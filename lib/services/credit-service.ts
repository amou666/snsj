import { getDb } from '../db';
import { getUserById, updateUserCredits } from '../models/user';
import { createCreditLog } from '../models/credit';
import { createGenerationRecord } from '../models/generation-record';
import { getAnalysisCredits, getGenerationCredits } from '../models/settings';
import { getToolConfigByKey } from '../models/tool-config';
import { v4 as uuidv4 } from 'uuid';

export interface DeductCreditsParams {
  userId: number;
  toolKey: string;
  hasAnalysis: boolean;
  hasGeneration: boolean;
  requestId?: string;
}

export interface DeductCreditsResult {
  success: boolean;
  creditsDeducted: number;
  requestId: string;
  error?: string;
}

export function deductCredits(params: DeductCreditsParams): DeductCreditsResult {
  const requestId = params.requestId || uuidv4();
  const analysisCost = getAnalysisCredits();
  const generationCost = getGenerationCredits();
  const totalCost = (params.hasAnalysis ? analysisCost : 0) + (params.hasGeneration ? generationCost : 0);

  const db = getDb();
  const tx = db.transaction(() => {
    const user = getUserById(params.userId);
    if (!user) throw new Error('User not found');

    // Check idempotency
    const existing = db.prepare('SELECT id FROM credits_log WHERE request_id = ?').get(requestId);
    if (existing) {
      return { success: true, creditsDeducted: 0, requestId, error: 'duplicate' };
    }

    // Check balance
    if (user.credits < totalCost) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    updateUserCredits(params.userId, -totalCost);
    const newBalance = user.credits - totalCost;

    // Log analysis
    if (params.hasAnalysis) {
      createCreditLog({
        user_id: params.userId,
        amount: -analysisCost,
        balance_after: newBalance,
        type: 'analysis',
        tool_key: params.toolKey,
        request_id: requestId,
        model_used: 'nano-banana-2',
        status: 'success',
        description: `分析操作 - ${params.toolKey}`
      });
    }

    // Log generation
    if (params.hasGeneration) {
      createCreditLog({
        user_id: params.userId,
        amount: -generationCost,
        balance_after: newBalance,
        type: 'generation',
        tool_key: params.toolKey,
        request_id: requestId,
        model_used: 'nano-banana-pro',
        status: 'success',
        description: `生成操作 - ${params.toolKey}`
      });
    }

    return { success: true, creditsDeducted: totalCost, requestId };
  });

  try {
    return tx();
  } catch (error: any) {
    return { success: false, creditsDeducted: 0, requestId, error: error.message };
  }
}

export function rollbackCredits(userId: number, requestId: string, toolKey: string, amount: number): void {
  const db = getDb();
  const tx = db.transaction(() => {
    updateUserCredits(userId, amount);
    const user = getUserById(userId);
    createCreditLog({
      user_id: userId,
      amount: amount,
      balance_after: user!.credits,
      type: 'refund',
      tool_key: toolKey,
      request_id: requestId,
      status: 'success',
      description: `退回积分 - 请求失败 ${requestId}`
    });
  });
  tx();
}

export function getToolCreditsInfo(toolKey: string): { analysis: number; generation: number; total: number } {
  const tool = getToolConfigByKey(toolKey);
  const analysis = tool?.has_analysis ? getAnalysisCredits() : 0;
  const generation = tool?.has_generation ? getGenerationCredits() : 0;
  return { analysis, generation, total: analysis + generation };
}
