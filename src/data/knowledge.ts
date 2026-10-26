export interface KnowledgeSlice {
  id: string;
  sliceNumber: string;
  title: string;
  subtitle: string;
  summary: string;
  coreConcepts: {
    term: string;
    definition: string;
    rAnalogy: string;
  }[];
  deepDiveMarkdown: string;
  codeExample: string;
  commonMistakes: {
    wrong: string;
    right: string;
    explanation: string;
  }[];
}

export const knowledgeSlices: KnowledgeSlice[] = [
  {
    id: 'slice_1_tidy_data',
    sliceNumber: '切片一',
    title: 'DataFrame 基本要素的整洁数据解构',
    subtitle: 'Hadley Wickham Tidy Data 原则与表格数据二维代数形式化',
    summary: 'DataFrame 表格数据由行观测（Observations/Rows）、列变量（Variables/Columns）与单元格值（Values）三大基本要素交织构成。遵循“每行一个观测，每列一个变量，每个单元格一个值”的准则，奠定了现代统计建模与 ggplot2 图层语法的基石。',
    coreConcepts: [
      {
        term: '行观测 (Observation $i \\in \\{1, \\dots, n\\}$)',
        definition: '记录同一测量单元在同一时间或状态下的全部属性集合，在关系模型中对应元组 (Tuple)。',
        rAnalogy: 'df[i, ] 或 slice(df, i)'
      },
      {
        term: '列变量 (Variable $j \\in \\{1, \\dots, p\\}$)',
        definition: '在所有观测单位上具有相同测量度量衡与同质数据类型的特征向量 (Homogeneous Vector)。',
        rAnalogy: 'df[[j]] 或 pull(df, j)'
      },
      {
        term: '单元格值 (Value $x_{ij}$)',
        definition: '单个确定观测单元在特定变量上的标量测定值，类型必须符合严格代数定义（数值、因子、逻辑值、时间戳等）。',
        rAnalogy: 'df[i, j]'
      },
      {
        term: '整洁数据 (Tidy Data)',
        definition: '由统计学家 Hadley Wickham 于 2014 年提出：1. 每个变量构成一列；2. 每个观测构成一行；3. 每种观测单元构成一个表格。',
        rAnalogy: 'tidyr::pivot_longer() / pivot_wider()'
      }
    ],
    deepDiveMarkdown: `### 形式化代数模型与存储解构

在数学与计算机科学的交叉视角下，一个具有 $n$ 行观测和 $p$ 列特征的 DataFrame $\\mathbf{X}$ 可形式化定义为一个带模式（Schema）的强类型二阶张量与异构列向量组：

$$\\mathbf{X} = \\begin{bmatrix} \\mathbf{x}_{*1} & \\mathbf{x}_{*2} & \\cdots & \\mathbf{x}_{*p} \\end{bmatrix} \\in \\mathcal{D}_1 \\times \\mathcal{D}_2 \\times \\cdots \\times \\mathcal{D}_p$$

其中每个列向量 $\\mathbf{x}_{*j} = [x_{1j}, x_{2j}, \\dots, x_{nj}]^T$ 保持内部严格同构（Homogeneous），即 $\\forall i, x_{ij} \\in \\mathcal{D}_j$。在底层的内存布局中：
- **R 语言的传统 \`data.frame\`**：本质上是一个包含等长原子向量（Atomic Vectors）的泛型列表（Generic List）。
- **现代 \`tibble\` (tidyverse)**：严格禁止隐式类型转换（如 \`stringsAsFactors = FALSE\` 默认为真）、绝不进行部分列名模糊匹配、且禁止保留行名（Row Names）。

#### 为什么必须转换为整洁数据？
在脏乱的宽表中，列名往往实际上是**“变量的值”**（如 "2024_Q1", "2024_Q2"）。这会导致在 ggplot2 中无法使用 \`aes(x = quarter, y = revenue)\` 进行映射，更无法直接使用线性回归模型 \`lm(revenue ~ quarter)\`。通过 \`pivot_longer()\` 下沉，数据才真正获得可分析的整洁代数形态。`,
    codeExample: `# 整洁数据示范：将非规范宽表转换为标准 Tidy Data
library(tidyr)
library(dplyr)

# 原始非整洁形态（列名是测量季度，而非真实变量名）
messy_sales <- tibble(
  product = c("Alpha", "Beta"),
  Q1_2026 = c(120, 240),
  Q2_2026 = c(150, 290)
)

# 转换为整洁数据 (Tidy Data)
tidy_sales <- messy_sales %>%
  pivot_longer(
    cols = starts_with("Q"),
    names_to = "quarter",
    values_to = "revenue"
  )

print(tidy_sales)`,
    commonMistakes: [
      {
        wrong: '将年级、科室或时间点硬编码为 5-10 个单独的列名',
        right: '使用 pivot_longer() 转化为 "维度名称" 与 "度量值" 两列',
        explanation: '宽表不仅冗余，还会阻断 group_by() 和 ggplot2 自动化分面 (facet_wrap) 逻辑。'
      }
    ]
  },
  {
    id: 'slice_2_pipe_paradigm',
    sliceNumber: '切片二',
    title: 'R 语言管道符 (%>% / |>) 的函数式思维',
    subtitle: '从层层嵌套到线性声明式数据流的范式跃迁',
    summary: '通过管道操作符将数据一步步传递给 filter、select、group_by 和 summarise，实现了极高可读性的声明式数据处理流。将代数复合函数 $f(g(h(x)))$ 转变为直观的左向右数据流 $x \\to h \\to g \\to f$。',
    coreConcepts: [
      {
        term: '原生管道符 (`|>`) vs magrittr 管道 (`%>%`)',
        definition: 'R 4.1.0 引入了原生管道符 `|>`，在 AST 语法树解析期进行直接展开；`%>%` 支持占位符 `.` 和特殊别名管道。',
        rAnalogy: 'df |> filter() |> select()'
      },
      {
        term: '声明式数据管道 (Declarative Dataflow)',
        definition: '以动词为核心（filter, mutate, arrange），代码阅读顺序与数据清洗步骤的时间线性完全对齐。',
        rAnalogy: 'Input %>% Step1() %>% Step2() %>% Output'
      },
      {
        term: '无副作用原则 (Immutability / Pure Functions)',
        definition: 'tidyverse 算子在管道中不会就地修改原始内存对象（In-place Mutation），而是安全返回新 DataFrame，保障分析的可复现性。',
        rAnalogy: 'new_df <- df %>% mutate(...)'
      }
    ],
    deepDiveMarkdown: `### 函数式复合代数与管道流

在传统 R 或 Base R 编码风格中，多步清洗通常面临两种痛苦的抉择：
1. **地狱嵌套法**：\`arrange(filter(summarise(group_by(df, dept), avg = mean(x)), avg > 50), desc(avg))\`，阅读者必须由内向外反向解析括号；
2. **中间变量垃圾填埋场**：\`tmp1 <- group_by(...)\`, \`tmp2 <- summarise(tmp1, ...)\`, \`tmp3 <- filter(tmp2, ...)\`，污染全局工作区并增加内存碎片。

现代 R 语言通过管道算子建立了代数上的**左结合结合律**：
$$x \\triangleright f = f(x)$$
$$(x \\triangleright f) \\triangleright g = g(f(x))$$

在数据清洗中，这意味着数据管道成为一条精密的装配流水线：
\`Raw Data\` $\\longrightarrow$ \`filter()\` [质检剔除] $\\longrightarrow$ \`mutate()\` [特征衍生] $\\longrightarrow$ \`group_by() %>% summarise()\` [分箱汇总] $\\longrightarrow$ \`Final Insight\`.`,
    codeExample: `# 原生管道符 |> 与 magrittr %>% 的规范对比
library(dplyr)

# 优雅的现代管道工作流：
processed_report <- df_ecommerce %>%
  # 第一道工序：行条件切片
  filter(monetary_rmb >= 1000 & !is.na(recency_days)) %>%
  # 第二道工序：衍生指标列
  mutate(daily_spending = round(monetary_rmb / (365 - recency_days + 1), 2)) %>%
  # 第三道工序：按分类变量聚合
  group_by(membership_tier) %>%
  summarise(
    avg_daily_spend = mean(daily_spending, na.rm = TRUE),
    total_customers = n(),
    .groups = "drop"
  ) %>%
  # 第四道工序：排序呈现
  arrange(desc(avg_daily_spend))`,
    commonMistakes: [
      {
        wrong: '在管道中间将赋值符号赋给中间步骤：df %>% a <- filter()',
        right: '保持一条管道链从头到尾，仅在最外层或末端进行单次赋值',
        explanation: '在管道体内部进行二次赋值会破坏数据流的纯函数性与链式结构。'
      }
    ]
  },
  {
    id: 'slice_3_lethal_traps',
    sliceNumber: '切片三',
    title: '三大致命数据处理陷阱',
    subtitle: '行名混淆、未解组污染与隐性字符混合崩溃',
    summary: '混淆行名（Row Names）与真实列变量导致索引切片错位；分组聚合后忘记调用 ungroup() 导致后续突变（mutate）结果整体污染；忽视数值型列中混入字符型文本（如多余空格或 NA 符号）导致统计崩溃。',
    coreConcepts: [
      {
        term: '陷阱 1：行名（Row Names）混淆',
        definition: 'Base R 数据框常将样本编号存储在 row.names 属性中，dplyr 操作中会被自动丢弃或引发切片索引失效。',
        rAnalogy: 'tibble::rownames_to_column(df, "id")'
      },
      {
        term: '陷阱 2：未解组污染 (Forgotten ungroup)',
        definition: 'group_by() 会使数据框进入“分组状态”。后续对全体做归一化 (x / sum(x)) 时，会意外在每个小群组内部分别归一化！',
        rAnalogy: 'summarise(..., .groups = "drop") 或 ungroup()'
      },
      {
        term: '陷阱 3：字符型污染与类型隐式降级',
        definition: '读取 CSV 时，只要有一格包含 " " 或 "N/A" 文本，整列数值型 (numeric) 就会被静默降级为字符型 (character)。',
        rAnalogy: 'readr::read_csv(na = c("", "NA", "N/A"))'
      }
    ],
    deepDiveMarkdown: `### 深入剖析：未解组污染的致命隐蔽性

很多数据科学家经历过的“幽灵 Bug”都来自于未显式解组。考虑以下逻辑：
\`\`\`r
# 危险代码：
df_grouped <- df %>%
  group_by(department) %>%
  summarise(dept_total = sum(sales)) # 此时由于底层机制，若有多重分组，仍可能处于部分分组状态！

# 随后尝试计算“各部门占全公司的销售份额”：
df_danger <- df_grouped %>%
  mutate(share = dept_total / sum(dept_total)) 
\`\`\`
如果 \`df_grouped\` 仍保留分组属性，\`sum(dept_total)\` 计算的**绝不是全公司的总销售额**，而是分组内部的局部和！这会导致 \`share\` 计算出来全是 1.0 (100%)，且**没有任何错误提示**！

#### 防范措施：
- 在每一个 \`summarise()\` 中显式声明 \`.groups = "drop"\`；
- 在任何准备执行全表特征归一化或跨行运算前，显式插入 \`ungroup()\`。`,
    codeExample: `# 三大陷阱的安全防御代码
library(dplyr)
library(tibble)

# 1. 安全处理行名
df_safe1 <- rownames_to_column(mtcars, var = "car_model") %>%
  as_tibble()

# 2. 避免未解组污染
df_safe2 <- df_safe1 %>%
  group_by(cyl) %>%
  summarise(avg_mpg = mean(mpg), .groups = "drop") %>% # 显式 drop
  ungroup() %>% # 再次保险
  mutate(overall_pct = avg_mpg / sum(avg_mpg)) # 安全计算全局占比！

# 3. 避免类型隐式降级
df_safe3 <- tibble(col_dirty = c("12.5", " 18.2 ", "N/A")) %>%
  mutate(col_clean = as.numeric(na_if(trimws(col_dirty), "N/A")))`,
    commonMistakes: [
      {
        wrong: '执行 group_by() 后直接做 mutate(pct = val / sum(val)) 计算全局占比',
        right: '在 mutate 之前先执行 ungroup()，或者先计算全局常数',
        explanation: '未解组的 mutate 中的 sum() 作用域限定在当前分组内部，全局占比失真为 100%。'
      }
    ]
  },
  {
    id: 'slice_4_misconception_warnings',
    sliceNumber: '切片四',
    title: '误区警示与诊断陷阱',
    subtitle: '盲目求均值、缺失值代数坍塌与笛卡尔积爆炸',
    summary: '警惕“盲目对原始脏数据直接求均值”（未进行异常值筛查与缺失值对齐的聚合结果会严重失真，必须在管道前端严格加入清洗验证步骤）；掌握 R 语言 NA 传染法则与 Join 键基数爆炸防线。',
    coreConcepts: [
      {
        term: '盲目求均值 (Naïve Aggregation Trap)',
        definition: '均值对极端离群点和偏态分布极度敏感；未剔除数据输入错误（如 9999 代表缺失）将彻底破坏统计推断。',
        rAnalogy: '结合 median() 与 IQR 异常检测'
      },
      {
        term: 'NA 传染公理 ($x + \\text{NA} = \\text{NA}$)',
        definition: 'R 语言采用严格三值逻辑。只要向量中存在哪怕 1 个 NA，mean() 和 sum() 默认返回 NA。',
        rAnalogy: 'mean(x, na.rm = TRUE)'
      },
      {
        term: 'Join 键基数爆炸 (Cartesian Product Hazard)',
        definition: '当左右两表连接键均存在一对多或多对多重复项时，行数将以乘积级别爆炸，导致内存溢出或重复统计。',
        rAnalogy: 'relationship = "many-to-one" (dplyr 1.1.0+)'
      }
    ],
    deepDiveMarkdown: `### 严格工程防线：管道前端清洗验证

在工业级数据管道中，永远不要假设数据源是干净的。

#### 1. 均值陷阱的数学解构
假设样本为 $[10, 12, 11, 14, 9999]$（其中 9999 是旧系统用于指代"未测出"的标志位）：
- 直接求均值：$\\bar{x} = 2009.2$（严重失真，完全丧失物理意义）；
- 中位数：$\\text{Median} = 12.0$（体现稳健统计学特质）；
- 规范清洗流程：在聚合前必须经过过滤断言：
  \`filter(val < 1000 & !is.na(val))\`。

#### 2. 多表连接的爆炸防线
当执行 \`left_join(orders, customers, by = "cust_id")\` 时，若客户表因历史原因同一个 \`cust_id\` 存在两条记录，订单表中的每笔消费将被**重复翻倍计算**！现代 \`dplyr 1.1.0+\` 提供了 \`relationship = "many-to-one"\` 参数，一旦发现右表键非唯一，立即抛出警告中断危险执行。`,
    codeExample: `# 防御性数据清洗管道最佳实践
library(dplyr)

safe_analysis <- df_manufacturing %>%
  # 1. 前置守门员：过滤 NA 与极端非物理离群值
  filter(
    !is.na(yield_pct),
    yield_pct >= 0 & yield_pct <= 100,
    defect_ppm < 10000 # 剔除严重工艺失效离群点
  ) %>%
  # 2. 分组聚合同时计算抗噪统计量
  group_by(factory_id) %>%
  summarise(
    sample_n = n(),
    mean_yield = mean(yield_pct, na.rm = TRUE),
    median_yield = median(yield_pct, na.rm = TRUE), # 抗噪指标对比
    iqr_ppm = IQR(defect_ppm, na.rm = TRUE),
    .groups = "drop"
  )`,
    commonMistakes: [
      {
        wrong: '看到缺失值就直接 na.omit(df) 粗暴删除整行',
        right: '核对缺失机制（MCAR/MAR/MNAR），精准针对分析目标列做 filter(!is.na(target)) 或合理插补',
        explanation: '全表 na.omit 会因为无关辅助列的缺失而连带抹杀宝贵的真实观测样本。'
      }
    ]
  }
];
