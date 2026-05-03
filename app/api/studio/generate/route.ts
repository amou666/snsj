import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { callAI } from '@/lib/services/ai-service';
import { deductCredits, rollbackCredits, getToolCreditsInfo } from '@/lib/services/credit-service';
import { getToolConfigByKey } from '@/lib/models/tool-config';
import { getUserById } from '@/lib/models/user';
import { addFavorite } from '@/lib/models/favorite';
import { checkRateLimit, getRateLimitKey } from '@/lib/services/rate-limit';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  // Rate limit
  const { key, rule } = getRateLimitKey('/api/studio/generate', auth.user.id);
  const { allowed, retryAfter } = checkRateLimit(key, rule);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'rate_limit', message: '操作太频繁，请稍后再试', retryAfter }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
    });
  }

  try {
    const body = await request.json();
    const { toolKey, prompt, imageUrl, refImageUrl, additionalImages, systemPrompt, selectedModel, style, projectId } = body;

    if (!toolKey || !prompt || !imageUrl) {
      return errorResponse('缺少必要参数 (toolKey, prompt, imageUrl)');
    }

    const toolConfig = getToolConfigByKey(toolKey);
    if (!toolConfig || !toolConfig.is_active) {
      return errorResponse('工具不存在或已禁用');
    }

    const creditsInfo = getToolCreditsInfo(toolKey);
    const user = getUserById(auth.user.id);
    if (!user) return errorResponse('用户不存在');
    if (user.credits < creditsInfo.total) {
      return errorResponse('积分不足', 402);
    }

    const requestId = uuidv4();

    const deductResult = deductCredits({
      userId: auth.user.id,
      toolKey,
      hasAnalysis: toolConfig.has_analysis === 1,
      hasGeneration: toolConfig.has_generation === 1,
      requestId,
    });

    if (!deductResult.success && deductResult.error !== 'duplicate') {
      return errorResponse(deductResult.error || '积分扣减失败', 402);
    }

    const aiResult = await callAI(
      { toolKey, prompt, imageUrl, refImageUrl, additionalImages, systemPrompt, selectedModel, style },
      auth.user.id,
      requestId
    );

    if (!aiResult.success) {
      if (deductResult.creditsDeducted > 0) {
        rollbackCredits(auth.user.id, requestId, toolKey, deductResult.creditsDeducted);
      }
      return errorResponse(aiResult.error || 'AI 生成失败');
    }

    if (aiResult.outputImage) {
      try {
        addFavorite(auth.user.id, {
          originalImage: imageUrl,
          resultImage: aiResult.outputImage,
          toolKey,
          style,
        });
      } catch {}
    }

    const updatedUser = getUserById(auth.user.id);

    return successResponse({
      outputImage: aiResult.outputImage,
      modelUsed: aiResult.modelUsed,
      creditsDeducted: deductResult.creditsDeducted,
      creditsRemaining: updatedUser?.credits || 0,
      requestId,
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return errorResponse('请求超时，请重试', 408);
    }
    return errorResponse(error.message);
  }
}
