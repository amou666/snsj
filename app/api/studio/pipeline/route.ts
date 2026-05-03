import { NextRequest } from 'next/server';
import { requireAuth, successResponse, errorResponse } from '@/lib/utils/response';
import { callAI } from '@/lib/services/ai-service';
import { deductCredits, rollbackCredits, getToolCreditsInfo } from '@/lib/services/credit-service';
import { getToolConfigByKey } from '@/lib/models/tool-config';
import { getUserById } from '@/lib/models/user';
import { v4 as uuidv4 } from 'uuid';

// Pipeline: execute multiple AI tools in sequence, output of step N becomes input of step N+1
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { steps, imageUrl, projectId } = body;

    if (!steps || !Array.isArray(steps) || steps.length === 0 || !imageUrl) {
      return errorResponse('缺少必要参数 (steps[], imageUrl)');
    }

    // Calculate total credits needed
    let totalCredits = 0;
    for (const step of steps) {
      const info = getToolCreditsInfo(step.toolKey);
      totalCredits += info.total;
    }

    const user = getUserById(auth.user.id);
    if (!user) return errorResponse('用户不存在');
    if (user.credits < totalCredits) return errorResponse(`积分不足，需要 ${totalCredits} 积分`, 402);

    const pipelineId = uuidv4();
    const results: any[] = [];
    let currentImage = imageUrl;
    let creditsUsed = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepRequestId = `${pipelineId}-step${i}`;

      const toolConfig = getToolConfigByKey(step.toolKey);
      if (!toolConfig || !toolConfig.is_active) {
        // Rollback previous deductions
        if (creditsUsed > 0) rollbackCredits(auth.user.id, pipelineId, 'pipeline', creditsUsed);
        return errorResponse(`步骤 ${i + 1}: 工具 ${step.toolKey} 不存在或已禁用`);
      }

      // Deduct credits for this step
      const deductResult = deductCredits({
        userId: auth.user.id,
        toolKey: step.toolKey,
        hasAnalysis: toolConfig.has_analysis === 1,
        hasGeneration: toolConfig.has_generation === 1,
        requestId: stepRequestId,
      });

      if (!deductResult.success) {
        if (creditsUsed > 0) rollbackCredits(auth.user.id, pipelineId, 'pipeline', creditsUsed);
        return errorResponse(`步骤 ${i + 1}: 积分扣减失败`);
      }

      creditsUsed += deductResult.creditsDeducted;

      // Call AI
      const aiResult = await callAI(
        {
          toolKey: step.toolKey,
          prompt: step.prompt || step.toolKey,
          imageUrl: currentImage,
          style: step.style,
          systemPrompt: step.systemPrompt,
        },
        auth.user.id,
        stepRequestId
      );

      if (!aiResult.success) {
        rollbackCredits(auth.user.id, pipelineId, 'pipeline', creditsUsed);
        return errorResponse(`步骤 ${i + 1} 失败: ${aiResult.error}`);
      }

      results.push({
        step: i + 1,
        toolKey: step.toolKey,
        outputImage: aiResult.outputImage,
        modelUsed: aiResult.modelUsed,
      });

      // Next step uses this output as input
      if (aiResult.outputImage) {
        currentImage = aiResult.outputImage;
      }
    }

    const updatedUser = getUserById(auth.user.id);

    return successResponse({
      pipelineId,
      results,
      finalImage: results[results.length - 1]?.outputImage,
      creditsDeducted: creditsUsed,
      creditsRemaining: updatedUser?.credits || 0,
    });
  } catch (error: any) {
    return errorResponse(error.message);
  }
}
