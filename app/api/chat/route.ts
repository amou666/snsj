import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { createChatMessage, getChatHistory, getChatSessions } from '@/lib/models/chat-message';
import { callAI } from '@/lib/services/ai-service';
import { getUserById } from '@/lib/models/user';
import { deductCredits, rollbackCredits } from '@/lib/services/credit-service';
import { checkRateLimit, getRateLimitKey } from '@/lib/services/rate-limit';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    const messages = getChatHistory(auth.user.id, sessionId);
    return successResponse(messages);
  }

  const sessions = getChatSessions(auth.user.id);
  return successResponse(sessions);
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  // Rate limit
  const { key, rule } = getRateLimitKey('/api/chat/', auth.user.id);
  const { allowed, retryAfter } = checkRateLimit(key, rule);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'rate_limit', message: '操作太频繁', retryAfter }), {
      status: 429, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { message, sessionId: sid } = body;
    if (!message) return errorResponse('消息不能为空');

    const sessionId = sid || uuidv4();

    // Save user message
    createChatMessage({
      user_id: auth.user.id,
      session_id: sessionId,
      role: 'user',
      content: message,
      tool_key: null,
    });

    // Check credits (1 per message)
    const user = getUserById(auth.user.id);
    if (!user || user.credits < 1) return errorResponse('积分不足', 402);

    const requestId = uuidv4();
    deductCredits({ userId: auth.user.id, toolKey: 'chat', hasAnalysis: true, hasGeneration: false, requestId });

    // Call AI for text response
    try {
      const { getDb } = require('@/lib/db');
      const db = getDb();
      const modelConfig = db.prepare("SELECT * FROM model_configs WHERE type = 'analysis' AND is_active = 1 LIMIT 1").get();

      if (!modelConfig) {
        rollbackCredits(auth.user.id, requestId, 'chat', 1);
        return errorResponse('AI 模型未配置');
      }

      const history = getChatHistory(auth.user.id, sessionId, 10);
      const messages = [
        { role: 'system', content: '你是 InteriorAI 室内设计助手，可以回答室内设计相关问题，也可以帮助用户触发各种 AI 工具。当用户要求生成图片时，告诉他们可以在工作台操作。' },
        ...history.slice(-8).map((m: any) => ({ role: m.role, content: m.content })),
      ];

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(modelConfig.api_base_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${modelConfig.api_key}`,
        },
        body: JSON.stringify({ model: modelConfig.model_id, stream: false, max_tokens: modelConfig.max_tokens, messages }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        rollbackCredits(auth.user.id, requestId, 'chat', 1);
        return errorResponse('AI 响应失败');
      }

      const result = await response.json();
      const aiContent = result.choices?.[0]?.message?.content || '抱歉，我无法理解您的问题。';

      // Save AI message
      createChatMessage({
        user_id: auth.user.id,
        session_id: sessionId,
        role: 'assistant',
        content: aiContent,
        tool_key: null,
      });

      const updatedUser = getUserById(auth.user.id);
      return successResponse({
        sessionId,
        message: aiContent,
        creditsRemaining: updatedUser?.credits || 0,
      });
    } catch (aiError: any) {
      rollbackCredits(auth.user.id, requestId, 'chat', 1);
      const isTimeout = aiError.name === 'AbortError';
      return errorResponse(isTimeout ? 'AI 响应超时' : aiError.message);
    }
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
