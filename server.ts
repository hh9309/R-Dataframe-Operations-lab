import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Diagnostic Endpoint
app.post('/api/gemini/diagnose', async (req: Request, res: Response) => {
  try {
    const { datasetSummary, pipelineCode, issuesDetected, userContext } = req.body;

    if (!aiClient) {
      return res.json({
        source: 'local_heuristic',
        analysis: generateHeuristicDiagnosis(datasetSummary, pipelineCode, issuesDetected),
      });
    }

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

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '你专注于 R 语言 tidyverse (dplyr, tidyr, ggplot2) 数据处理工程，回答精准、专业、条理分明，杜绝套话。',
      },
    });

    return res.json({
      source: 'gemini_api',
      analysis: response.text,
    });
  } catch (error: any) {
    console.error('Gemini Diagnose Error:', error);
    return res.json({
      source: 'local_heuristic_fallback',
      analysis: generateHeuristicDiagnosis(
        req.body.datasetSummary,
        req.body.pipelineCode,
        req.body.issuesDetected
      ),
      note: '（已切换至内建专家级 R 语言规则诊断系统）',
    });
  }
});

// AI Q&A Assistant Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, currentDataset, currentPipeline } = req.body;

    if (!aiClient) {
      return res.json({
        reply: generateHeuristicChatReply(message, currentDataset, currentPipeline),
      });
    }

    const systemInstruction = `你是嵌入在《DataFrame 数据处理 WebApp 实验室 (R 语言版)》中的资深 R 语言数据科学随诊导师。
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

用户问题: ${message}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    return res.json({
      reply: generateHeuristicChatReply(req.body.message, req.body.currentDataset, req.body.currentPipeline),
    });
  }
});

// Heuristic backup engines to guarantee 100% offline & robust functionality
function generateHeuristicDiagnosis(summary: any, code: string = '', detected: any[] = []): string {
  const parts: string[] = [];

  parts.push('### 🎯 【核心风险判别】');
  if (code.includes('group_by') && !code.includes('ungroup')) {
    parts.push('- **⚠️ 警惕未解组污染 (Missing ungroup)**：检测到 `group_by()` 管道后未显式调用 `ungroup()`。在后续调用 `mutate()`、`slice()` 或跨表 `join()` 时，数据仍将维持分组隐式上下文，导致计算基准偏离或聚合层级锁定。');
  }
  if (code.includes('mean(') || code.includes('sum(') || code.includes('sd(')) {
    if (!code.includes('na.rm = TRUE') && !code.includes('na.rm=T')) {
      parts.push('- **⚠️ 隐性缺失值污染风险 (NA Propagation)**：使用统计聚合函数时未指定 `na.rm = TRUE`。在 R 语言的代数规则中，`x + NA = NA`，哪怕仅有 1 个观测缺失，整个聚合结果也会塌陷为 `NA`。');
    }
  }
  if (summary?.hasRowNames) {
    parts.push('- **⚠️ 行名陷阱 (Row Names Misalignment)**：数据源中含有行名索引。切勿将数据维度依托于 R 的 `row.names`，请在管道前端使用 `tibble::rownames_to_column(var = "row_id")` 将其显式转化为规范列变量。');
  }
  if (summary?.factorMismatch) {
    parts.push('- **⚠️ 因子水平断裂 (Factor Level Discrepancy)**：分类变量在分组或重塑时存在非预期因子水平（Unused Levels / Factor vs Character 强制转换失败）。');
  }

  if (parts.length === 1) {
    parts.push('- **未发现致命代数陷阱**：当前管道与数据结构表现健康。');
  }

  parts.push('\n### 📐 【代数结构与整洁数据 (Tidy Data) 分析】');
  parts.push(`- **维度形态**：观测总数 $N = ${summary?.rowCount || 0}$ 行，属性变量 $P = ${summary?.colCount || 0}$ 列。`);
  parts.push('- **整洁度解构**：遵循每行代表单一独立观测实体、每列代表同构特征向量。若进行时间序列或多维度指标横向对比，建议通过 `tidyr::pivot_longer()` 转换为长表以便于 `ggplot2` 图形映射。');

  parts.push('\n### ⚡ 【推荐改进代码与防坑指南】');
  parts.push('```r\n# 遵循工业级现代 R tidyverse 安全规范：\nclean_result <- df %>%\n  # 1. 前端显式过滤缺失值与异常值\n  filter(!is.na(target_col)) %>%\n  # 2. 分组聚合并显式处理 NA\n  group_by(category) %>%\n  summarise(\n    n_obs = n(),\n    mean_val = mean(target_col, na.rm = TRUE),\n    sd_val = sd(target_col, na.rm = TRUE),\n    .groups = "drop" # 自动安全解除分组\n  ) %>%\n  ungroup() # 双重防呆保险\n```');

  parts.push('\n### 💡 【学术与工程建议】');
  parts.push('- 工业实践中，优先使用 `summarise(..., .groups = "drop")` 或在末端补充 `ungroup()`；涉及多变量聚合推荐使用 `across(where(is.numeric), list(mean = ~mean(.x, na.rm = TRUE)))`。');

  return parts.join('\n');
}

function generateHeuristicChatReply(msg: string, dataset: any, pipeline: string): string {
  const lower = (msg || '').toLowerCase();
  if (lower.includes('ungroup') || lower.includes('解组')) {
    return `### 关于 R 语言中的 \`ungroup()\`\n\n在 \`dplyr\` 中，\`group_by()\` 会为 DataFrame (tibble) 附加属性 \`groups\`。如果在 \`summarise()\` 之后继续调用 \`mutate()\`，计算仍会在分组切片内分别执行！\n\n例如：\n\`\`\`r\ndf %>% \n  group_by(dept) %>% \n  summarise(avg_sal = mean(salary, na.rm = TRUE), .groups = "drop")\n\`\`\`\n使用 \`.groups = "drop"\` 或管道末尾添加 \`ungroup()\` 是现代 tidyverse 的标准最佳实践。`;
  }
  if (lower.includes('na') || lower.includes('缺失值') || lower.includes('na.rm')) {
    return `### R 语言缺失值 (NA) 处理三定律\n\n1. **代数传染性**：\`1 + NA = NA\`。求和、均值、标准差必须带 \`na.rm = TRUE\`。\n2. **条件过滤陷阱**：\`filter(x > 5)\` 会默默丢弃 \`x == NA\` 的行！若想保留缺失行，请写 \`filter(x > 5 | is.na(x))\`。\n3. **整洁填充**：使用 \`tidyr::replace_na()\` 或 \`dplyr::coalesce()\` 进行优雅插补。`;
  }
  if (lower.includes('长宽表') || lower.includes('pivot') || lower.includes('reshape')) {
    return `### \`pivot_longer()\` 与 \`pivot_wider()\` 的核心奥义\n\n- **长表转换 (Tidying)**：将多列测量指标下沉为“指标名”与“数值”两列，为 \`ggplot2(aes(color = metric))\` 的美学映射做准备。\n\`\`\`r\ndf_long <- df %>% \n  pivot_longer(\n    cols = c(Q1, Q2, Q3, Q4),\n    names_to = "Quarter",\n    values_to = "Revenue"\n  )\n\`\`\`\n- **宽表转换**：用于制作透视交叉报表或特征矩阵输入。`;
  }
  if (lower.includes('join') || lower.includes('连接') || lower.includes('多表')) {
    return `### dplyr 中的六大多表连接算子\n\n1. \`left_join(x, y, by = ...)\`：保留左表全部观测，未匹配列填 NA。\n2. \`inner_join(x, y)\`：严格保留左右交集。\n3. \`full_join(x, y)\`：保留两表全部记录并对齐。\n4. \`semi_join(x, y)\`：过滤筛选算子，仅保留在 y 中出现的 x 行，但不引入 y 的列！\n5. \`anti_join(x, y)\`：差集筛查，常用于稽核孤儿数据与库存失配。`;
  }
  return `针对您的问题："${msg}"：\n\n在现代 R 语言 tidyverse 体系中，数据处理的核心是构建**链式无副作用的数据流 (Pipe Workflow)**。\n- 使用 \`|>\` (R 4.1+ 原生管道符) 或 \`%>%\` (magrittr) 连接语义操作符。\n- 严格维护整洁数据规则：每列单一变量，每行独立观测。\n您可以通过左侧 10 大核心模块分别体验二维结构代数、多维切片过滤、分组聚合、长宽表变形及实战案例！`;
}

// Vite middleware setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`R DataFrame WebApp Lab Server listening at http://localhost:${port}`);
  });
}

startServer();
