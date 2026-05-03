import { getModelConfigsByType, getModelConfigByModelId } from '../models/model-config';
import { getToolConfigByKey } from '../models/tool-config';
import { createGenerationRecord } from '../models/generation-record';

export interface AIGenerateParams {
  toolKey: string;
  prompt: string;
  imageUrl: string;
  refImageUrl?: string;
  additionalImages?: string[];
  systemPrompt?: string;
  selectedModel?: string;
  style?: string;
}

export interface AIGenerateResult {
  success: boolean;
  outputImage?: string;
  modelUsed?: string;
  error?: string;
}

// Deep search for image data in AI response
export function deepSearchImage(obj: any, depth = 0): string | null {
  if (!obj || depth > 20) return null;

  if (typeof obj === 'string') {
    const raw = obj.trim();
    const clean = raw.replace(/[\r\n\s]/g, '');

    // data URL
    if (raw.startsWith('data:image')) return raw;
    const b64Match = raw.match(/data:image\/[a-zA-Z]+;base64,[^"'\s)\]]+/);
    if (b64Match) return b64Match[0];

    // URL
    const urlMatch = raw.match(/https?:\/\/[^\s"'()<>]+/);
    if (urlMatch) {
      const url = urlMatch[0];
      if (url.match(/\.(jpg|jpeg|png|webp|gif)/i) || url.includes('api') || url.includes('generated') || url.includes('storage')) {
        return url;
      }
    }

    // Raw base64
    if (clean.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(clean)) {
      return `data:image/png;base64,${clean}`;
    }

    return null;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = deepSearchImage(item, depth + 1);
      if (found) return found;
    }
  } else if (typeof obj === 'object') {
    if (obj.url && typeof obj.url === 'string' && obj.url.startsWith('http')) return obj.url;
    if (obj.b64_json && typeof obj.b64_json === 'string') return `data:image/png;base64,${obj.b64_json.replace(/[\r\n\s]/g, '')}`;
    if (obj.inlineData?.data) return `data:image/png;base64,${obj.inlineData.data.replace(/[\r\n\s]/g, '')}`;
    if (obj.image_url?.url) return obj.image_url.url;
    if (obj.asset?.uri) return obj.asset.uri;
    if (obj.image?.imageBytes) return `data:image/png;base64,${obj.image.imageBytes.replace(/[\r\n\s]/g, '')}`;

    for (const key in obj) {
      try {
        const found = deepSearchImage(obj[key], depth + 1);
        if (found) return found;
      } catch {}
    }
  }
  return null;
}

export async function callAI(params: AIGenerateParams, userId: number, requestId: string): Promise<AIGenerateResult> {
  const toolConfig = getToolConfigByKey(params.toolKey);
  if (!toolConfig) return { success: false, error: 'Tool not found' };

  // Determine model to use
  const modelId = params.selectedModel || toolConfig.default_model_id || 'nano-banana-2';
  const modelConfig = getModelConfigByModelId(modelId);
  if (!modelConfig) return { success: false, error: 'Model not configured' };

  // For rough-to-real, append special instruction
  let finalPrompt = params.prompt;
  if (params.toolKey === 'rough-to-real' || params.toolKey === 'color-to-real' || params.toolKey === 'model-3d-to-real') {
    if (!finalPrompt.includes('请务必直接输出生成的图像数据')) {
      finalPrompt += ' 请务必直接输出生成的图像数据或Base64字符串，不要只返回文字描述。';
    }
  }

  // Build user content
  const userContent: any[] = [{ type: 'text', text: finalPrompt }];
  if (params.imageUrl) {
    userContent.push({ type: 'image_url', image_url: { url: params.imageUrl, detail: 'high' } });
  }
  if (params.refImageUrl) {
    userContent.push({ type: 'image_url', image_url: { url: params.refImageUrl, detail: 'high' } });
  }
  if (params.additionalImages?.length) {
    for (const img of params.additionalImages) {
      userContent.push({ type: 'image_url', image_url: { url: img, detail: 'high' } });
    }
  }

  const systemPrompt = params.systemPrompt || toolConfig.default_system_prompt || 'You are a professional interior designer AI assistant.';

  const requestBody = {
    model: modelConfig.model_id,
    stream: false,
    max_tokens: modelConfig.max_tokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ]
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), modelConfig.timeout_ms);

    const response = await fetch(modelConfig.api_base_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${modelConfig.api_key}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.text();
      createGenerationRecord({
        user_id: userId,
        tool_key: params.toolKey,
        request_id: requestId,
        model_used: modelConfig.model_id,
        input_image: null,
        output_image: null,
        style: params.style || null,
        prompt_used: finalPrompt,
        credits_charged: 0,
        status: 'failed',
        error: `API error ${response.status}: ${errorData.slice(0, 500)}`
      });
      return { success: false, error: `API 返回错误 (${response.status})`, modelUsed: modelConfig.model_id };
    }

    const result = await response.json();

    // Extract image from response
    const outputImage = deepSearchImage(result);

    if (outputImage) {
      createGenerationRecord({
        user_id: userId,
        tool_key: params.toolKey,
        request_id: requestId,
        model_used: modelConfig.model_id,
        input_image: null,
        output_image: outputImage.slice(0, 200), // Store truncated for reference
        style: params.style || null,
        prompt_used: finalPrompt,
        credits_charged: (toolConfig.has_analysis ? 1 : 0) + (toolConfig.has_generation ? 1 : 0),
        status: 'success',
        error: null
      });
      return { success: true, outputImage, modelUsed: modelConfig.model_id };
    } else {
      createGenerationRecord({
        user_id: userId,
        tool_key: params.toolKey,
        request_id: requestId,
        model_used: modelConfig.model_id,
        input_image: null,
        output_image: null,
        style: params.style || null,
        prompt_used: finalPrompt,
        credits_charged: 0,
        status: 'failed',
        error: 'No image found in response'
      });
      return { success: false, error: 'AI 响应成功但未检测到图片数据', modelUsed: modelConfig.model_id };
    }
  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    createGenerationRecord({
      user_id: userId,
      tool_key: params.toolKey,
      request_id: requestId,
      model_used: modelConfig.model_id,
      input_image: null,
      output_image: null,
      style: params.style || null,
      prompt_used: finalPrompt,
      credits_charged: 0,
      status: isTimeout ? 'timeout' : 'failed',
      error: isTimeout ? 'Request timeout' : error.message
    });
    return { success: false, error: isTimeout ? '请求超时，请重试' : error.message, modelUsed: modelConfig.model_id };
  }
}
