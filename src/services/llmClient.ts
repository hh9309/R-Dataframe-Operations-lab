import { LLMConfig, LLMModelId, LLMCallResult } from '../types/llm';

const STORAGE_KEY = 'r_dataframe_lab_llm_config';

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  model: 'gemini 3 flash',
  apiKey: '',
  baseUrl: '',
  provider: 'google',
};

/**
 * Read LLM configuration from client-side browser localStorage
 */
export function getLLMConfig(): LLMConfig {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_LLM_CONFIG };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_LLM_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      model: parsed.model || 'gemini 3 flash',
      apiKey: parsed.apiKey || '',
      baseUrl: parsed.baseUrl || '',
      provider: parsed.model === 'deepseek-v4-pro' ? 'deepseek' : 'google',
    };
  } catch {
    return { ...DEFAULT_LLM_CONFIG };
  }
}

/**
 * Save LLM configuration to localStorage and notify all listeners
 */
export function saveLLMConfig(config: LLMConfig): void {
  if (typeof window === 'undefined') return;
  const normalized: LLMConfig = {
    model: config.model,
    apiKey: config.apiKey.trim(),
    baseUrl: (config.baseUrl || '').trim(),
    provider: config.model === 'deepseek-v4-pro' ? 'deepseek' : 'google',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('llm_config_changed', { detail: normalized }));
}

/**
 * Clear stored API Key & config
 */
export function clearLLMConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('llm_config_changed', { detail: { ...DEFAULT_LLM_CONFIG } }));
}

/**
 * Check if the user has provided a non-empty API Key
 */
export function hasValidApiKey(): boolean {
  const cfg = getLLMConfig();
  return Boolean(cfg.apiKey && cfg.apiKey.trim().length > 3);
}

/**
 * Client-Side Direct LLM Call (No backend required; suitable for GitHub Pages / static hosting)
 */
export async function callClientLLM({
  prompt,
  systemPrompt,
}: {
  prompt: string;
  systemPrompt?: string;
}): Promise<LLMCallResult> {
  const config = getLLMConfig();

  if (!config.apiKey || !config.apiKey.trim()) {
    throw new Error('未检测到有效的 API-Key。请点击右上角小齿轮设置大模型与 API-Key 后再进行调用。');
  }

  const startTime = Date.now();

  if (config.model === 'gemini 3 flash') {
    // Direct browser call to Google Generative Language API
    const base = config.baseUrl || 'https://generativelanguage.googleapis.com';
    const cleanBase = base.replace(/\/+$/, '');
    // Using gemini-2.5-flash as the underlying production engine for gemini 3 flash
    const endpoint = `${cleanBase}/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      config.apiKey.trim()
    )}`;

    const body: Record<string, any> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2500,
      },
    };

    if (systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errorMsg = `HTTP 状态码: ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson?.error?.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {
        // use fallback
      }
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        throw new Error(`Gemini API 认证失败 (${res.status}): ${errorMsg}。请检查您的 API-Key 是否正确有效。`);
      }
      throw new Error(`Gemini API 调用异常 (${res.status}): ${errorMsg}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini API 未返回有效文本输出，可能触发了内容安全过滤或响应为空。');
    }

    return {
      text,
      model: 'gemini 3 flash',
      provider: 'google',
      durationMs: Date.now() - startTime,
    };
  } else {
    // Direct browser call to DeepSeek Chat API
    const base = config.baseUrl || 'https://api.deepseek.com';
    const cleanBase = base.replace(/\/+$/, '');
    const endpoint = cleanBase.endsWith('/chat/completions')
      ? cleanBase
      : `${cleanBase}/v1/chat/completions`;

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!res.ok) {
      let errorMsg = `HTTP 状态码: ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson?.error?.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {
        // fallback
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error(`DeepSeek API 认证失败 (${res.status}): ${errorMsg}。请检查您的 DeepSeek API-Key。`);
      }
      throw new Error(`DeepSeek API 调用异常 (${res.status}): ${errorMsg}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('DeepSeek API 未返回有效内容，请检查模型响应状态。');
    }

    return {
      text: content,
      model: 'deepseek-v4-pro',
      provider: 'deepseek',
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Diagnosis Prompt Builder & Client Executor
 */
export async function diagnosePipelineWithClientLLM({
  datasetSummary,
  pipelineCode,
  issuesDetected,
  userContext,
}: {
  datasetSummary: any;
  pipelineCode: string;
  issuesDetected: any[];
  userContext?: string;
}): Promise<LLMCallResult> {
  const prompt = `你是一位世界顶级的现代 R 语言 (tidyverse / dplyr / tidyr / ggplot2) 与数据科学架构专家。
请对以下用户正在操作的 R 语言 DataFrame 与数据处理管道进行严格的代数结构与逻辑诊断：

【数据集概览】：
${JSON.stringify(datasetSummary, null, 2)}

【用户执行的 R 语言代码/管道】：
\`\`\`r
${pipelineCode || '# 暂无执行代码'}
\`\`\`

【规则引擎预警命中项】：
${JSON.stringify(issuesDetected || [], null, 2)}

【用户附加上下文】：
${userContext || '请进行全方位的 R 语言数据处理鲁棒性与整洁数据 (Tidy Data) 诊断'}

请严格按照以下结构输出中文专业诊断（淡雅大方、条理清晰，直击要害）：
1. 🎯 【核心风险判别】：指出是否存在如“忘记 ungroup()”、“因子匹配断裂”、“隐性 NA 污染”、“行名与真实列混淆”或“未经清洗直接求均值”等致命问题。
2. 📐 【代数结构与整洁数据分析】：分析行观测、列变量与长宽表形态是否符合 Hadley Wickham 的 Tidy Data 原则。
3. ⚡ 【推荐改进代码与防坑指南】：提供带安全保护的现代 R 语言优雅管道代码（使用 %>% 或 |>，注明 na.rm = TRUE, ungroup(), across() 等规范写法）。
4. 💡 【学术与工程建议】：简短总结 1-2 条适用于该场景的实战经验。`;

  const systemPrompt =
    '你专注于 R 语言 tidyverse (dplyr, tidyr, ggplot2) 数据处理工程，回答精准、专业、条理分明，杜绝套话。使用清晰优雅的中文。';

  return callClientLLM({ prompt, systemPrompt });
}

/**
 * Chat Assistant Client Executor
 */
export async function chatWithClientLLM({
  message,
  currentDataset,
  currentPipeline,
}: {
  message: string;
  currentDataset?: any;
  currentPipeline?: string;
}): Promise<LLMCallResult> {
  const systemPrompt = `你是嵌入在《DataFrame 数据处理 WebApp 实验室 (R 语言版)》中的资深 R 语言数据科学随诊导师。
你的核心知识涵盖：
- 表格数据代数结构 (2D Relational Matrix, Row/Col Vectors, Hadley Wickham Tidy Data)
- 索引切片与子集提取 (base R [i, j], dplyr::filter(), select(), slice(), pull())
- 分组聚合算法 (group_by(), summarise(), across(), count(), ungroup() 的必要性)
- 多表连接 (left_join, inner_join, right_join, full_join, semi_join, anti_join)
- 长宽表重塑 (tidyr::pivot_longer(), pivot_wider(), separate(), unite())
- 工业级实战案例（RFM电商聚类、方差分析ANOVA生产良率、金融缺失收益率清洗、智慧城市时空聚合、医疗T检验对照、多仓库存审计）
- 现代管道符操作 (%>%, |>) 与 ggplot2 数据可视化美学。

请用专业、亲和、清晰严谨的中文回答用户提问。代码示例请采用纯正现代 R (tidyverse) 风格。`;

  const prompt = `当前数据集信息: ${JSON.stringify(currentDataset || '无')}
当前 R 管道代码:
\`\`\`r
${currentPipeline || '# 当前未指定管道'}
\`\`\`

用户咨询问题:
${message}`;

  return callClientLLM({ prompt, systemPrompt });
}
