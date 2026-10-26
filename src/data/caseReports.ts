import { DataFrame } from '../types/dataframe';
import {
  ecommerceDataset,
  manufacturingDataset,
  financialDataset,
  airQualityDataset,
  clinicalTrialDataset,
  warehouseInventoryDataset,
  warehouseShipmentsDataset,
} from './datasets';

export interface WorkflowReportSection {
  stepNumber: number;
  partTitle: string;
  badge: string;
  content: string;
  rCodeSnippet?: string;
  metrics?: Array<{ label: string; value: string; hint?: string }>;
}

export interface CaseWorkflowReport {
  caseId: string;
  title: string;
  domain: string;
  dataset: DataFrame;
  relatedDataset?: DataFrame;
  sections: WorkflowReportSection[];
  ggplotCode: string;
  chartInfo: {
    title: string;
    subtitle: string;
    xAxis: string;
    yAxis: string;
    legend: string;
    chartType: 'scatter' | 'bar' | 'line' | 'box';
  };
}

export const CASE_WORKFLOW_REPORTS: CaseWorkflowReport[] = [
  // 1. E-commerce RFM
  {
    caseId: 'case_rfm',
    title: '案例一：电子商务用户消费行为聚类分析 (RFM)',
    domain: '新零售 / 用户价值分层',
    dataset: ecommerceDataset,
    chartInfo: {
      title: 'Customer Lifetime Value: Recency vs Monetary',
      subtitle: 'RFM Segmentation Across VIP and Gold Member Cohorts',
      xAxis: 'Recency (Days Since Last Order)',
      yAxis: 'Monetary Value (RMB)',
      legend: 'Membership Tier (VIP / Gold / Silver)',
      chartType: 'scatter',
    },
    ggplotCode: `ggplot(clean_cust, aes(x = recency_days, y = monetary_rmb, color = membership_tier)) +
  geom_point(aes(size = avg_order_value), alpha = 0.85) +
  geom_smooth(method = "lm", se = FALSE, color = "#475569", linetype = "dashed") +
  scale_color_manual(values = c("VIP" = "#0284c7", "Gold" = "#d97706", "Silver" = "#64748b")) +
  labs(
    title = "Customer Lifetime Value: Recency vs Monetary",
    subtitle = "RFM Segmentation Across VIP and Gold Member Cohorts",
    x = "Recency (Days Since Last Order)",
    y = "Monetary Value (RMB)",
    color = "Membership Tier",
    size = "Avg Order Value (RMB)"
  ) +
  theme_minimal(base_size = 11)`,
    sections: [
      {
        stepNumber: 1,
        partTitle: '一、业务背景与问题定义 (Business Objective & Problem Formulation)',
        badge: '全流程导引 01',
        content: `在新零售与会员制电商平台运营中，全量用户的价值分布呈现极度长尾效应。本项目旨在建立以 RFM（Recency 最近消费时间、Frequency 消费频次、Monetary 消费金额）为核心的数据驱动分层模型，精准识别高价值 VIP 客户并识别活跃度下滑的流失预警用户。`,
        metrics: [
          { label: '核心业务指标', value: 'RFM 综合分 / 客单价 (AOV)' },
          { label: '优化目标', value: '提升高净值客户留存率 +25%' },
          { label: '决策依据', value: '分层差异化会员权益与挽回机制' },
        ],
      },
      {
        stepNumber: 2,
        partTitle: '二、原始数据架构与整洁度审计 (Data Architecture & Tidy Data Audit)',
        badge: '全流程导引 02',
        content: `原始数据集为用户级别汇总表，包含客户 ID、最后下单天数、下单次数、累计金额与会员层级。依据 Hadley Wickham 的“整洁数据 (Tidy Data)”三大公理：每行代表独立客户实体，每列代表单一指标变量，每个单元格为原子数值。字段类型已严格定义为 <chr>, <int>, <dbl>, <fct>，无隐性行名污染。`,
        metrics: [
          { label: '样本总行数', value: `${ecommerceDataset.data.length} 行观测` },
          { label: '变量总维度', value: `${ecommerceDataset.columns.length} 个字段` },
          { label: '缺失值 (NA) 比例', value: '0.0% (完全填充)' },
          { label: '整洁数据检验', value: 'Tidy Data 校验通过' },
        ],
        rCodeSnippet: `# 原始数据架构校验
glimpse(df_ecommerce)
stopifnot(!any(is.na(df_ecommerce$monetary_rmb)))`,
      },
      {
        stepNumber: 3,
        partTitle: '三、索引切片与数据清洗流水线 (Subsetting & Data Cleaning Pipeline)',
        badge: '全流程导引 03',
        content: `通过 dplyr::filter 进行防御性切片，剔除超长期未活跃且消费频次过低的噪音样本（recency_days <= 30 & frequency >= 5）。使用 dplyr::mutate 派生关键特征“单均交易额 (avg_order_value = monetary_rmb / frequency)”，最后按照累计消费降序重排。`,
        rCodeSnippet: `clean_cust <- df_ecommerce %>%
  filter(recency_days <= 30 & frequency >= 5) %>%
  mutate(avg_order_value = round(monetary_rmb / frequency, 1)) %>%
  arrange(desc(monetary_rmb))`,
      },
      {
        stepNumber: 4,
        partTitle: '四、分组聚合与多维统计量推导 (Group-by Aggregation & Statistical Estimation)',
        badge: '全流程导引 04',
        content: `采用 Split-Apply-Combine 范式对 membership_tier 进行分组汇总，计算各会员等级的用户规模、累计总营收、平均留存活跃天数及客单价均值。关键工程规范：在 summarise 内部显式声明 .groups = "drop"，并在管道末端追加 ungroup()，彻底阻断分组上下文泄漏。`,
        metrics: [
          { label: 'VIP 总营收贡献', value: '¥215,000.5 (65.2%)' },
          { label: 'VIP 平均回访周期', value: '4.5 天 (极高粘性)' },
          { label: 'Gold 层级规模', value: '7 位核心用户' },
        ],
        rCodeSnippet: `tier_summary <- clean_cust %>%
  group_by(membership_tier) %>%
  summarise(
    user_count = n(),
    total_revenue = sum(monetary_rmb, na.rm = TRUE),
    avg_recency = round(mean(recency_days, na.rm = TRUE), 1),
    mean_aov = round(mean(avg_order_value, na.rm = TRUE), 1),
    .groups = "drop"
  ) %>%
  ungroup() %>%
  mutate(revenue_share_pct = round(total_revenue / sum(total_revenue) * 100, 1))`,
      },
      {
        stepNumber: 5,
        partTitle: '五、数据可视化呈现与业务推断 (ggplot2 Visualization & Inferences)',
        badge: '全流程导引 05',
        content: `绘制双变量散点气泡图（X 轴为回访天数，Y 轴为累计消费额，气泡大小映射平均客单价，颜色区分会员层级）。量化推断表明：VIP 组聚集于高金额与低回访间隔的黄金左上方象限，呈现显著的负相关回归特征，是企业利润的绝对支柱。`,
        metrics: [
          { label: '回归斜率', value: 'β = -1842.3 (p < 0.01)' },
          { label: '二八定律验证', value: '前 20% 用户占 65% 营收' },
        ],
      },
      {
        stepNumber: 6,
        partTitle: '六、智能随诊复盘与工业级部署建议 (Diagnostic Review & Production Guidance)',
        badge: '全流程导引 06',
        content: `AI 随诊专家审计报告结论：管道已全面防御未解组导致的占比分母计算失真风险，字段因子 levels 无漂移。建议在生产 ETL 环境中将本流水线固化为日度定时调度任务，并对未进入过滤条件的 Standard 用户自动推送沉睡唤醒券。`,
        metrics: [
          { label: '规则引擎评分', value: '100 / 100 (零预警)' },
          { label: '生产复现状态', value: '已包含独立数据源，零依赖' },
        ],
      },
    ],
  },

  // 2. Manufacturing ANOVA
  {
    caseId: 'case_manufacturing',
    title: '案例二：制造业多工厂生产良率对比 (ANOVA)',
    domain: '智能制造 / 工艺质量控制',
    dataset: manufacturingDataset,
    chartInfo: {
      title: 'Manufacturing Yield Rate Across Production Plants',
      subtitle: 'One-Way ANOVA and Batch Defect Dispersion Analysis',
      xAxis: 'Manufacturing Plant Identifier',
      yAxis: 'Yield Rate Percentage (%)',
      legend: 'Plant Identifier (Plant_A / Plant_B / Plant_C)',
      chartType: 'bar',
    },
    ggplotCode: `ggplot(df_manufacturing, aes(x = plant_id, y = yield_rate, fill = plant_id)) +
  geom_col(position = "dodge", alpha = 0.9, width = 0.6) +
  geom_hline(yintercept = 98.0, linetype = "dashed", color = "#ef4444") +
  labs(
    title = "Manufacturing Yield Rate Across Production Plants",
    subtitle = "One-Way ANOVA and Batch Defect Dispersion Analysis",
    x = "Manufacturing Plant Identifier",
    y = "Yield Rate Percentage (%)",
    fill = "Plant"
  ) +
  theme_minimal(base_size = 11)`,
    sections: [
      {
        stepNumber: 1,
        partTitle: '一、业务背景与问题定义 (Business Objective & Problem Formulation)',
        badge: '全流程导引 01',
        content: `高精密智能制造流水线中，不同分厂（Plant_A、Plant_B、Plant_C）及不同生产班次（Morning / Night）之间的产品良品率存在波动。需通过单因素方差分析 (One-Way ANOVA) 检验各工厂均值差异是否具有统计学显著性，定位制程缺陷根因。`,
        metrics: [
          { label: '控制目标', value: '平均良率 ≥ 98.5%' },
          { label: '检验方法', value: '单因素方差分析 (ANOVA F 检验)' },
          { label: '关键参量', value: '环境温度、班次与缺陷件数' },
        ],
      },
      {
        stepNumber: 2,
        partTitle: '二、原始数据架构与整洁度审计 (Data Architecture & Tidy Data Audit)',
        badge: '全流程导引 02',
        content: `批次级别观测矩阵记录了 12 个独立生产批次。因子列 plant_id 与 shift 具备清晰的 factor levels。已静态排查字符型混淆与极端离群点，数据整洁度达标。`,
        metrics: [
          { label: '检测批次数', value: `${manufacturingDataset.data.length} 个独立生产批次` },
          { label: '涵盖工厂', value: '3 大现代化生产基地' },
          { label: '温度监测范围', value: '20.5°C ~ 26.5°C (恒温受控)' },
        ],
        rCodeSnippet: `str(df_manufacturing)
levels(df_manufacturing$plant_id)`,
      },
      {
        stepNumber: 3,
        partTitle: '三、索引切片与数据清洗流水线 (Subsetting & Data Cleaning Pipeline)',
        badge: '全流程导引 03',
        content: `执行条件切片，筛选温度在安全工艺窗口（20°C - 27°C）内且缺陷件数受控的有效测试批次，排除因停电或传感器标定产生的外生噪音点。`,
        rCodeSnippet: `clean_batches <- df_manufacturing %>%
  filter(temperature_c >= 20.0 & temperature_c <= 27.0) %>%
  mutate(pass_standard = yield_rate >= 98.0)`,
      },
      {
        stepNumber: 4,
        partTitle: '四、分组聚合与多维统计量推导 (Group-by Aggregation & Statistical Estimation)',
        badge: '全流程导引 04',
        content: `按工厂分组计算良率均值、标准差与总缺陷数，并执行 ANOVA 假设检验。计算得到 F(2, 9) = 18.64, p = 0.0006 < 0.01，拒绝“各工厂良率均值相等”的原假设。`,
        metrics: [
          { label: 'Plant_A 平均良率', value: '98.85% (标杆工厂)' },
          { label: 'Plant_B 平均良率', value: '97.98% (达标工厂)' },
          { label: 'Plant_C 平均良率', value: '96.38% (重点整改)' },
          { label: 'ANOVA 检验结果', value: 'F = 18.64, p < 0.001 (极显著)' },
        ],
        rCodeSnippet: `plant_stats <- clean_batches %>%
  group_by(plant_id) %>%
  summarise(
    mean_yield = mean(yield_rate, na.rm = TRUE),
    sd_yield = sd(yield_rate, na.rm = TRUE),
    total_defects = sum(defect_count, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  ungroup()

anova_fit <- aov(yield_rate ~ plant_id, data = clean_batches)
summary(anova_fit)`,
      },
      {
        stepNumber: 5,
        partTitle: '五、数据可视化呈现与业务推断 (ggplot2 Visualization & Inferences)',
        badge: '全流程导引 05',
        content: `生成分厂良率柱状图与质量基准红线（98.0%）。图表直观揭示 Plant_C 夜班良率下滑明显，主要由夜间恒温空调风道波动引发，建议推行夜班工艺补偿参数。`,
        metrics: [
          { label: '基准红线达成', value: 'Plant_A 100% 达成' },
          { label: '工艺改善建议', value: '重点检修 Plant_C 温控伺服' },
        ],
      },
      {
        stepNumber: 6,
        partTitle: '六、智能随诊复盘与工业级部署建议 (Diagnostic Review & Production Guidance)',
        badge: '全流程导引 06',
        content: `诊断引擎验证：模型已遵循正确的方差齐性假定，并在管道末端正确执行 ungroup。建议产线部署时，将 ANOVA 监控逻辑集成至 SCADA 实时流处理管道中。`,
        metrics: [
          { label: '规则引擎质检', value: '通过 (未检出结构漏洞)' },
          { label: '可移植性评估', value: '已完全解耦，支持一键复现' },
        ],
      },
    ],
  },

  // 3. Finance Returns
  {
    caseId: 'case_finance',
    title: '案例三：金融时间序列股票收益率清洗 (Finance Returns)',
    domain: '量化金融 / 时间序列清洗',
    dataset: financialDataset,
    chartInfo: {
      title: 'Multi-Asset Daily Return Volatility Over Time',
      subtitle: 'Comparative Volatility Across Tech300, MedBio, and GreenEnergy',
      xAxis: 'Trading Date',
      yAxis: 'Daily Return Percentage (%)',
      legend: 'Asset Ticker',
      chartType: 'line',
    },
    ggplotCode: `ggplot(clean_finance, aes(x = as.Date(date), y = daily_return, color = ticker, group = ticker)) +
  geom_line(linewidth = 0.9) +
  geom_point(size = 2) +
  geom_hline(yintercept = 0, color = "#94a3b8", linetype = "dotted") +
  labs(
    title = "Multi-Asset Daily Return Volatility Over Time",
    subtitle = "Comparative Volatility Across Tech300, MedBio, and GreenEnergy",
    x = "Trading Date",
    y = "Daily Return Percentage (%)",
    color = "Ticker"
  ) +
  theme_minimal(base_size = 11)`,
    sections: [
      {
        stepNumber: 1,
        partTitle: '一、业务背景与问题定义 (Business Objective & Problem Formulation)',
        badge: '全流程导引 01',
        content: `量化投资策略开发中，跨交易所多标的日常行情数据常遭遇停牌、非同步交易及通讯丢包导致的非整齐时间戳与缺失值 (NA)。必须在特征入模前进行前向填充 (LOCF) 与宽长表转换。`,
        metrics: [
          { label: '对冲标的', value: 'Tech300 / MedBio / GreenEnergy' },
          { label: '回测窗口', value: '2026-03-01 至 2026-03-06' },
          { label: '核心诉求', value: '缺失值免疫与波动率基准对齐' },
        ],
      },
      {
        stepNumber: 2,
        partTitle: '二、原始数据架构与整洁度审计 (Data Architecture & Tidy Data Audit)',
        badge: '全流程导引 02',
        content: `原始矩阵呈现长表格式，包含日期、标的代码、收盘价与日收益率。经审计，3月3日与3月5日存在 2 处显式缺失值 NA，若未经处理直接调用 mean() 将导致整个向量返回 NA（NA 传染风险）。`,
        metrics: [
          { label: '观测序列总数', value: `${financialDataset.data.length} 条交易日记录` },
          { label: '检出缺失项 (NA)', value: '2 处收盘价缺失' },
          { label: '潜在风险等级', value: 'High (隐性 NA 传染算子)' },
        ],
        rCodeSnippet: `# 缺失值审计
sum(is.na(df_finance$close_price))
any(is.na(df_finance$daily_return))`,
      },
      {
        stepNumber: 3,
        partTitle: '三、索引切片与数据清洗流水线 (Subsetting & Data Cleaning Pipeline)',
        badge: '全流程导引 03',
        content: `采用 tidyr::fill(.direction = "down") 实行最后观测值结转 (Last Observation Carried Forward)，并剔除极端异动值。转换后的清洁数据集完全符合时间对齐标准。`,
        rCodeSnippet: `clean_finance <- df_finance %>%
  arrange(ticker, date) %>%
  group_by(ticker) %>%
  tidyr::fill(close_price, .direction = "down") %>%
  mutate(daily_return = ifelse(is.na(daily_return), 0, daily_return)) %>%
  ungroup()`,
      },
      {
        stepNumber: 4,
        partTitle: '四、分组聚合与多维统计量推导 (Group-by Aggregation & Statistical Estimation)',
        badge: '全流程导引 04',
        content: `按标的计算年化波动率、日均收益率及夏普比率前序统计量。所有聚合函数显式挂载 na.rm = TRUE 参数，保障算子绝对稳健。`,
        metrics: [
          { label: 'GreenEnergy 平均日收益', value: '+1.49% (高弹性标的)' },
          { label: 'Tech300 平均日收益', value: '+0.83% (稳健蓝筹)' },
          { label: 'MedBio 平均日收益', value: '+0.34% (防御性资产)' },
        ],
        rCodeSnippet: `risk_return_summary <- clean_finance %>%
  group_by(ticker) %>%
  summarise(
    mean_daily_return = round(mean(daily_return, na.rm = TRUE), 2),
    volatility_sd = round(sd(daily_return, na.rm = TRUE), 2),
    obs_days = n(),
    .groups = "drop"
  ) %>%
  ungroup()`,
      },
      {
        stepNumber: 5,
        partTitle: '五、数据可视化呈现与业务推断 (ggplot2 Visualization & Inferences)',
        badge: '全流程导引 05',
        content: `利用 ggplot2 绘制多资产时序走势对比折线图。图表直观反映出新能源板块（GreenEnergy）在上半周经历回撤后迎来连续强势反弹，波动幅度显著高于科技与医疗板块。`,
        metrics: [
          { label: '资产相关系数', value: 'r(Tech, Med) = 0.42 (低相关)' },
          { label: '资产配置结论', value: '具备优良的投资组合分散效应' },
        ],
      },
      {
        stepNumber: 6,
        partTitle: '六、智能随诊复盘与工业级部署建议 (Diagnostic Review & Production Guidance)',
        badge: '全流程导引 06',
        content: `随诊诊断提示：时序重塑时推荐使用 tidyr::pivot_wider 将标的展开为列矩阵以便快速计算协方差矩阵；已严格加入 na.rm 防护与 ungroup 解组。`,
        metrics: [
          { label: 'NA 传染风险解除', value: '已通过防御性清洗' },
          { label: '生产复现性', value: '100% 独立可运行' },
        ],
      },
    ],
  },

  // 4. Air Quality
  {
    caseId: 'case_airquality',
    title: '案例四：智慧城市空气质量监测时空切片 (Air Quality)',
    domain: '智慧城市 / 环境物联网物联网大数据',
    dataset: airQualityDataset,
    chartInfo: {
      title: 'Spatiotemporal Air Quality (PM2.5) Across Urban Districts',
      subtitle: 'Peak Hour Pollution Levels across Five Functional Zones',
      xAxis: 'Monitoring Timestamp (Hour of Day)',
      yAxis: 'PM2.5 Concentration (ug/m3)',
      legend: 'Functional District Type',
      chartType: 'line',
    },
    ggplotCode: `ggplot(clean_air, aes(x = timestamp_hour, y = pm25_ug_m3, color = district_type, group = district_type)) +
  geom_line(linewidth = 1) +
  geom_point(size = 2.5) +
  geom_hline(yintercept = 75, linetype = "dashed", color = "#ef4444") +
  labs(
    title = "Spatiotemporal Air Quality (PM2.5) Across Urban Districts",
    subtitle = "Peak Hour Pollution Levels across Five Functional Zones",
    x = "Monitoring Timestamp (Hour of Day)",
    y = "PM2.5 Concentration (ug/m3)",
    color = "District Type"
  ) +
  theme_minimal(base_size = 11)`,
    sections: [
      {
        stepNumber: 1,
        partTitle: '一、业务背景与问题定义 (Business Objective & Problem Formulation)',
        badge: '全流程导引 01',
        content: `现代化绿色城市建设依赖高密度的环境监测微站。本案例针对五大典型功能区（生态湿地、商业金融街、高新产业园、交通物流港与奥林匹克绿地）进行 24 小时连续时空切片，精准识别早晚交通早晚高峰的污染外溢特征。`,
        metrics: [
          { label: '监测核心物', value: 'PM2.5 / 二氧化氮 NO2 / 综合 AQI' },
          { label: '国家二级标准', value: 'PM2.5 ≤ 75 μg/m³ (24小时日均)' },
        ],
      },
      {
        stepNumber: 2,
        partTitle: '二、原始数据架构与整洁度审计 (Data Architecture & Tidy Data Audit)',
        badge: '全流程导引 02',
        content: `时空面板数据由 20 个整点采样构成，包含 station_id、district_type、整点小时与多项污染物浓度。变量结构清晰，符合整洁数据定义。`,
        metrics: [
          { label: '总采样点数', value: `${airQualityDataset.data.length} 条整点时空记录` },
          { label: '监测微站数', value: '5 个核心城市微站' },
        ],
        rCodeSnippet: `summary(df_airquality$pm25_ug_m3)`,
      },
      {
        stepNumber: 3,
        partTitle: '三、索引切片与数据清洗流水线 (Subsetting & Data Cleaning Pipeline)',
        badge: '全流程导引 03',
        content: `利用 dplyr::filter 抽取上下班高峰时段（timestamp_hour %in% c(8, 18)）以及 AQI 超标的高污染事件，快速形成时空聚焦切片。`,
        rCodeSnippet: `clean_air <- df_airquality %>%
  filter(!is.na(pm25_ug_m3)) %>%
  mutate(is_rush_hour = timestamp_hour %in% c(8, 18))`,
      },
      {
        stepNumber: 4,
        partTitle: '四、分组聚合与多维统计量推导 (Group-by Aggregation & Statistical Estimation)',
        badge: '全流程导引 04',
        content: `按 district_type 分组聚合计算 PM2.5 均值与最大 AQI 峰值。物流港与高新产业园在晚高峰时段由于重型柴油货运车辆出入，均值显著偏高。`,
        metrics: [
          { label: '生态湿地平均 PM2.5', value: '16.9 μg/m³ (天然氧吧)' },
          { label: '物流港平均 PM2.5', value: '85.4 μg/m³ (重点治理)' },
        ],
        rCodeSnippet: `district_summary <- clean_air %>%
  group_by(district_type) %>%
  summarise(
    mean_pm25 = round(mean(pm25_ug_m3, na.rm = TRUE), 1),
    max_aqi = max(aqi, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  ungroup()`,
      },
      {
        stepNumber: 5,
        partTitle: '五、数据可视化呈现与业务推断 (ggplot2 Visualization & Inferences)',
        badge: '全流程导引 05',
        content: `通过时空折线图展现各区域 8:00、12:00、18:00 与 22:00 的污染演变轨迹。物流港与高新区在 18:00 突破 75 μg/m³ 警戒线，为交管与环保部门提供精准错峰管控抓手。`,
        metrics: [
          { label: '峰值时段', value: '18:00 晚间出城物流高峰' },
          { label: '环境治理建议', value: '强化货车新能源替代及绕行' },
        ],
      },
      {
        stepNumber: 6,
        partTitle: '六、智能随诊复盘与工业级部署建议 (Diagnostic Review & Production Guidance)',
        badge: '全流程导引 06',
        content: `随诊审查显示无行名污染，多条件 filter 语法清晰。建议在大数据流式场景下，使用 Across 同时对 PM2.5、NO2 与 O3 执行滑动窗口均值计算。`,
        metrics: [
          { label: '数据安全等级', value: '通过 (零污染泄漏)' },
          { label: '计算效率', value: '矢量化过滤，亚毫秒级' },
        ],
      },
    ],
  },

  // 5. Clinical Trial
  {
    caseId: 'case_clinical',
    title: '案例五：医疗临床试验疗效对照评估 (Clinical Trial)',
    domain: '生物医药 / 临床试验假设检验',
    dataset: clinicalTrialDataset,
    chartInfo: {
      title: 'Biomarker Reduction Percentage: Treatment vs Control',
      subtitle: 'Independent Welch Two-Sample T-Test for Clinical Efficacy',
      xAxis: 'Clinical Trial Cohort Group',
      yAxis: 'Antigen Reduction Rate (%)',
      legend: 'Arm Group (Control / Treatment)',
      chartType: 'bar',
    },
    ggplotCode: `ggplot(df_clinical, aes(x = arm_group, y = reduction_pct, fill = arm_group)) +
  geom_boxplot(alpha = 0.8, outlier.shape = 21, width = 0.5) +
  geom_jitter(width = 0.15, alpha = 0.7, size = 2) +
  labs(
    title = "Biomarker Reduction Percentage: Treatment vs Control",
    subtitle = "Independent Welch Two-Sample T-Test for Clinical Efficacy",
    x = "Clinical Trial Cohort Group",
    y = "Antigen Reduction Rate (%)",
    fill = "Study Arm"
  ) +
  theme_minimal(base_size = 11)`,
    sections: [
      {
        stepNumber: 1,
        partTitle: '一、业务背景与问题定义 (Business Objective & Problem Formulation)',
        badge: '全流程导引 01',
        content: `新型抗肿瘤靶向小分子药物进行 II 期双盲随机对照试验。受试患者随机分为试验组（Treatment，服药 8 周）与对照组（Control，服安慰剂）。需评估关键生物标记物抗原下降率（reduction_pct）的统计学显著性。`,
        metrics: [
          { label: '试验方案', value: '双盲随机平行对照 (RCT)' },
          { label: '主要终点指标', value: '8周后血清抗原改善幅度 (%)' },
          { label: '原假设 H0', value: '试验组与对照组抗原下降率无差异' },
        ],
      },
      {
        stepNumber: 2,
        partTitle: '二、原始数据架构与整洁度审计 (Data Architecture & Tidy Data Audit)',
        badge: '全流程导引 02',
        content: `受试者数据集严格遵守 GCP 临床规范，包含 14 名入组患者。字段涉及 patient_id、arm_group、gender、age、基线与第8周指标。经审计，无重复受试者编号，变量类型完整无缺失。`,
        metrics: [
          { label: '入组患者总数', value: `${clinicalTrialDataset.data.length} 位受试者` },
          { label: '对照组人数', value: '7 例' },
          { label: '试验组人数', value: '7 例' },
        ],
        rCodeSnippet: `table(df_clinical$arm_group, df_clinical$gender)`,
      },
      {
        stepNumber: 3,
        partTitle: '三、索引切片与数据清洗流水线 (Subsetting & Data Cleaning Pipeline)',
        badge: '全流程导引 03',
        content: `执行符合方案集 (Per-Protocol Set, PPS) 切片，验证 baseline_biomarker > 0 且服药合规率 100%，构建整洁的疗效评估子集。`,
        rCodeSnippet: `clean_trial <- df_clinical %>%
  filter(!is.na(week8_biomarker)) %>%
  mutate(antigen_delta = baseline_biomarker - week8_biomarker)`,
      },
      {
        stepNumber: 4,
        partTitle: '四、分组聚合与多维统计量推导 (Group-by Aggregation & Statistical Estimation)',
        badge: '全流程导引 04',
        content: `按分组计算抗原下降率的均值与置信区间，并执行独立双样本 Welch t-test（考虑方差不齐）。检验结果：t(10.82) = 11.42, p = 1.34e-07 < 0.001，强烈拒绝原假设，表明靶向药具有极其显著的疗效。`,
        metrics: [
          { label: '试验组均值下降', value: '76.84% (95% CI: 72.1% - 81.5%)' },
          { label: '对照组均值下降', value: '23.47% (95% CI: 19.8% - 27.1%)' },
          { label: 'Welch T 统计量', value: 't = 11.42, p < 0.0001 (极显著)' },
        ],
        rCodeSnippet: `trial_summary <- clean_trial %>%
  group_by(arm_group) %>%
  summarise(
    mean_red = mean(reduction_pct),
    sd_red = sd(reduction_pct),
    se_red = sd_red / sqrt(n()),
    .groups = "drop"
  ) %>%
  ungroup()

t_res <- t.test(reduction_pct ~ arm_group, data = clean_trial, var.equal = FALSE)
print(t_res)`,
      },
      {
        stepNumber: 5,
        partTitle: '五、数据可视化呈现与业务推断 (ggplot2 Visualization & Inferences)',
        badge: '全流程导引 05',
        content: `通过箱线图与抖动点图结合展示抗原下降率分布。两组受试者分布完全无重叠，试验组展现出压倒性的生化指标改善，且中老年亚组中响应同样优异。`,
        metrics: [
          { label: '效应量 Cohen’s d', value: 'd = 6.10 (超强效应)' },
          { label: '监管申报建议', value: '支持提前进入 III 期临床试验' },
        ],
      },
      {
        stepNumber: 6,
        partTitle: '六、智能随诊复盘与工业级部署建议 (Diagnostic Review & Production Guidance)',
        badge: '全流程导引 06',
        content: `随诊质检结论：分组聚合严格闭环解组，因子 levels 对比基准正确。在向监管机构（如 NMPA / FDA）报送分析报告时，推荐直接导出本 R Markdown 独立可复现文档。`,
        metrics: [
          { label: '统计完整性', value: '符合 CDISC 规范' },
          { label: '质检结论', value: '通过全部 5 项代数约束' },
        ],
      },
    ],
  },

  // 6. Supply Chain
  {
    caseId: 'case_warehouse',
    title: '案例六：供应链多仓库库存周转率审计 (Supply Chain)',
    domain: '现代物流 / 进销存库存审计',
    dataset: warehouseInventoryDataset,
    relatedDataset: warehouseShipmentsDataset,
    chartInfo: {
      title: 'Monthly Inventory Turnover Days by Warehouse',
      subtitle: 'Inner Join Audit Between Physical Stock and Outbound Demands',
      xAxis: 'Warehouse Identifier',
      yAxis: 'Inventory Turnover Days (Days)',
      legend: 'Warehouse Identifier (WH_North / WH_East / WH_South)',
      chartType: 'bar',
    },
    ggplotCode: `ggplot(turnover_summary, aes(x = warehouse_id, y = turnover_days, fill = warehouse_id)) +
  geom_col(width = 0.55, alpha = 0.85) +
  geom_hline(yintercept = 60, linetype = "dashed", color = "#ef4444") +
  labs(
    title = "Monthly Inventory Turnover Days by Warehouse",
    subtitle = "Inner Join Audit Between Physical Stock and Outbound Demands",
    x = "Warehouse Identifier",
    y = "Inventory Turnover Days (Days)",
    fill = "Warehouse"
  ) +
  theme_minimal(base_size = 11)`,
    sections: [
      {
        stepNumber: 1,
        partTitle: '一、业务背景与问题定义 (Business Objective & Problem Formulation)',
        badge: '全流程导引 01',
        content: `集团在全国建有华北、华东与华南三大核心仓储中心。实体库存表（df_inventory）与月度出库发货表（df_shipments）属于典型的异构系统。需通过多表关联审计呆滞料（Overstock）与无库存孤儿物料（Orphan SKU），优化资金周转效率。`,
        metrics: [
          { label: '周转天数红线', value: '≤ 60 天 (精益供应链标准)' },
          { label: '重点排查物料', value: '呆滞物料与孤儿物料' },
          { label: '核算周期', value: '过去 30 天滚动出库量' },
        ],
      },
      {
        stepNumber: 2,
        partTitle: '二、原始数据架构与整洁度审计 (Data Architecture & Tidy Data Audit)',
        badge: '全流程导引 02',
        content: `包含两张关系表格：df_inventory（8 个在库物料批次）与 df_shipments（9 个月度发货 SKU）。经静态 Join 键审计：SKU-899 仅在发货表中存在但在物理库存中为 0；必须选用合适的 Join 算子防范行丢失。`,
        metrics: [
          { label: '库存记录数', value: `${warehouseInventoryDataset.data.length} 条物理在库记录` },
          { label: '发货记录数', value: `${warehouseShipmentsDataset.data.length} 条月度履约记录` },
          { label: '关联主键', value: 'sku_id (复合匹配键)' },
        ],
        rCodeSnippet: `# 校验关联键匹配情况
setdiff(df_shipments$sku_id, df_inventory$sku_id)`,
      },
      {
        stepNumber: 3,
        partTitle: '三、索引切片与数据清洗流水线 (Subsetting & Data Cleaning Pipeline)',
        badge: '全流程导引 03',
        content: `通过 inner_join 将实体库存与月度出库需求按 sku_id 对齐，剔除孤儿物料后，计算单物料的周转天数（turnover_days = (stock_quantity / monthly_shipped_qty) * 30）。`,
        rCodeSnippet: `audit_dataset <- df_inventory %>%
  inner_join(df_shipments, by = "sku_id") %>%
  mutate(
    turnover_days = round((stock_quantity / monthly_shipped_qty) * 30, 1),
    is_overstocked = turnover_days > 60
  )`,
      },
      {
        stepNumber: 4,
        partTitle: '四、分组聚合与多维统计量推导 (Group-by Aggregation & Statistical Estimation)',
        badge: '全流程导引 04',
        content: `按仓库维度（warehouse_id）进行 group_by 聚合汇总，计算全仓在库总货值、出库履约总件数及综合加权周转天数。华北仓周转最为健康（38.5天），华南仓存在滞销品积压（72.1天）。`,
        metrics: [
          { label: '华北仓 (WH_North)', value: '周转 38.5 天 (优良评级)' },
          { label: '华东仓 (WH_East)', value: '周转 51.2 天 (合格评级)' },
          { label: '华南仓 (WH_South)', value: '周转 72.1 天 (超标预警)' },
        ],
        rCodeSnippet: `warehouse_audit <- audit_dataset %>%
  group_by(warehouse_id) %>%
  summarise(
    total_stock_value = sum(stock_quantity * unit_cost),
    total_shipped = sum(monthly_shipped_qty),
    avg_turnover_days = round(mean(turnover_days), 1),
    .groups = "drop"
  ) %>%
  ungroup()`,
      },
      {
        stepNumber: 5,
        partTitle: '五、数据可视化呈现与业务推断 (ggplot2 Visualization & Inferences)',
        badge: '全流程导引 05',
        content: `绘制仓库周转天数对比柱状图与 60 天红线。发现 SKU-803（标准紧固件）在华南仓积压严重，周转周期突破 180 天，建议紧急启动跨仓调拨方案。`,
        metrics: [
          { label: '重点调拨 SKU', value: 'SKU-803 (从华南调拨至华东)' },
          { label: '预期释放现金流', value: '约 ¥145,000 元' },
        ],
      },
      {
        stepNumber: 6,
        partTitle: '六、智能随诊复盘与工业级部署建议 (Diagnostic Review & Production Guidance)',
        badge: '全流程导引 06',
        content: `AI 随诊审查：Join 操作前未发生一对多数据膨胀，键类型严格一致。建议定期执行 anti_join(df_shipments, df_inventory) 预警库存断供导致的负库存出库异常。`,
        metrics: [
          { label: '笛卡尔积膨胀排查', value: '0 行异常膨胀 (通过)' },
          { label: '独立运行测试', value: '已打包独立可复现代码' },
        ],
      },
    ],
  },
];
