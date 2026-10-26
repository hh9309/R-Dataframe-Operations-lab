import { DataFrame } from '../types/dataframe';

// 1. 电子商务用户消费行为 (RFM 案例)
export const ecommerceDataset: DataFrame = {
  id: 'df_ecommerce',
  name: 'df_ecommerce (电商消费行为 RFM 数据集)',
  description: '包含 24 名活跃客户在最近一年内的订单消费行为特征与历史累计指标。',
  columns: [
    { name: 'customer_id', type: 'character', label: '客户识别码' },
    { name: 'recency_days', type: 'integer', label: '最近一次消费间隔天数 (R)' },
    { name: 'frequency', type: 'integer', label: '年度累计下单频次 (F)' },
    { name: 'monetary_rmb', type: 'numeric', label: '年度累计消费金额 (M, 元)' },
    { name: 'membership_tier', type: 'factor', levels: ['Standard', 'Silver', 'Gold', 'VIP'], label: '会员等级' },
    { name: 'preferred_channel', type: 'factor', levels: ['App', 'Web', 'MiniProgram'], label: '主消费渠道' },
  ],
  data: [
    { customer_id: 'CUST-1001', recency_days: 4, frequency: 28, monetary_rmb: 14200.5, membership_tier: 'VIP', preferred_channel: 'App' },
    { customer_id: 'CUST-1002', recency_days: 12, frequency: 19, monetary_rmb: 8650.0, membership_tier: 'Gold', preferred_channel: 'App' },
    { customer_id: 'CUST-1003', recency_days: 85, frequency: 3, monetary_rmb: 720.0, membership_tier: 'Standard', preferred_channel: 'MiniProgram' },
    { customer_id: 'CUST-1004', recency_days: 150, frequency: 1, monetary_rmb: 199.0, membership_tier: 'Standard', preferred_channel: 'Web' },
    { customer_id: 'CUST-1005', recency_days: 8, frequency: 35, monetary_rmb: 21800.0, membership_tier: 'VIP', preferred_channel: 'App' },
    { customer_id: 'CUST-1006', recency_days: 22, frequency: 12, monetary_rmb: 5400.0, membership_tier: 'Silver', preferred_channel: 'Web' },
    { customer_id: 'CUST-1007', recency_days: 45, frequency: 7, monetary_rmb: 2310.0, membership_tier: 'Silver', preferred_channel: 'MiniProgram' },
    { customer_id: 'CUST-1008', recency_days: 3, frequency: 42, monetary_rmb: 36500.0, membership_tier: 'VIP', preferred_channel: 'App' },
    { customer_id: 'CUST-1009', recency_days: 110, frequency: 2, monetary_rmb: 480.0, membership_tier: 'Standard', preferred_channel: 'Web' },
    { customer_id: 'CUST-1010', recency_days: 18, frequency: 15, monetary_rmb: 6920.0, membership_tier: 'Gold', preferred_channel: 'MiniProgram' },
    { customer_id: 'CUST-1011', recency_days: 6, frequency: 24, monetary_rmb: 13500.0, membership_tier: 'Gold', preferred_channel: 'App' },
    { customer_id: 'CUST-1012', recency_days: 190, frequency: 1, monetary_rmb: 150.0, membership_tier: 'Standard', preferred_channel: 'Web' },
    { customer_id: 'CUST-1013', recency_days: 30, frequency: 9, monetary_rmb: 3200.0, membership_tier: 'Silver', preferred_channel: 'MiniProgram' },
    { customer_id: 'CUST-1014', recency_days: 2, frequency: 51, monetary_rmb: 45800.0, membership_tier: 'VIP', preferred_channel: 'App' },
    { customer_id: 'CUST-1015', recency_days: 72, frequency: 4, monetary_rmb: 980.0, membership_tier: 'Standard', preferred_channel: 'Web' },
    { customer_id: 'CUST-1016', recency_days: 14, frequency: 16, monetary_rmb: 7400.0, membership_tier: 'Gold', preferred_channel: 'App' },
    { customer_id: 'CUST-1017', recency_days: 9, frequency: 31, monetary_rmb: 18900.0, membership_tier: 'VIP', preferred_channel: 'App' },
    { customer_id: 'CUST-1018', recency_days: 60, frequency: 5, monetary_rmb: 1600.0, membership_tier: 'Silver', preferred_channel: 'MiniProgram' },
    { customer_id: 'CUST-1019', recency_days: 135, frequency: 2, monetary_rmb: 390.0, membership_tier: 'Standard', preferred_channel: 'Web' },
    { customer_id: 'CUST-1020', recency_days: 5, frequency: 27, monetary_rmb: 15600.0, membership_tier: 'Gold', preferred_channel: 'MiniProgram' },
    { customer_id: 'CUST-1021', recency_days: 28, frequency: 11, monetary_rmb: 4890.0, membership_tier: 'Silver', preferred_channel: 'App' },
    { customer_id: 'CUST-1022', recency_days: 210, frequency: 1, monetary_rmb: 120.0, membership_tier: 'Standard', preferred_channel: 'Web' },
    { customer_id: 'CUST-1023', recency_days: 16, frequency: 14, monetary_rmb: 6200.0, membership_tier: 'Gold', preferred_channel: 'App' },
    { customer_id: 'CUST-1024', recency_days: 1, frequency: 65, monetary_rmb: 58200.0, membership_tier: 'VIP', preferred_channel: 'App' },
  ]
};

// 2. 制造业多工厂生产良率 (ANOVA 案例)
export const manufacturingDataset: DataFrame = {
  id: 'df_manufacturing',
  name: 'df_manufacturing (多工厂产线良率监测表)',
  description: '涵盖 4 个制造基地 (Factory A/B/C/D) 共 24 个生产批次的良率 (Yield %)、缺陷 PPM 与检测温湿度。',
  columns: [
    { name: 'batch_no', type: 'character', label: '批次编码' },
    { name: 'factory_id', type: 'factor', levels: ['Plant_A', 'Plant_B', 'Plant_C', 'Plant_D'], label: '工厂基地' },
    { name: 'workshop', type: 'factor', levels: ['SMT_1', 'SMT_2', 'Assembly_Line', 'Final_Test'], label: '车间工序' },
    { name: 'yield_pct', type: 'numeric', label: '良品率 (%)' },
    { name: 'defect_ppm', type: 'integer', label: '不良率 (PPM)' },
    { name: 'operating_temp', type: 'numeric', label: '环境运行温度 (℃)' },
  ],
  data: [
    { batch_no: 'B2601-A1', factory_id: 'Plant_A', workshop: 'SMT_1', yield_pct: 98.4, defect_ppm: 1600, operating_temp: 23.5 },
    { batch_no: 'B2601-A2', factory_id: 'Plant_A', workshop: 'SMT_2', yield_pct: 98.1, defect_ppm: 1900, operating_temp: 24.1 },
    { batch_no: 'B2601-A3', factory_id: 'Plant_A', workshop: 'Assembly_Line', yield_pct: 97.9, defect_ppm: 2100, operating_temp: 23.8 },
    { batch_no: 'B2601-A4', factory_id: 'Plant_A', workshop: 'Final_Test', yield_pct: 98.6, defect_ppm: 1400, operating_temp: 22.9 },
    { batch_no: 'B2601-A5', factory_id: 'Plant_A', workshop: 'SMT_1', yield_pct: 98.8, defect_ppm: 1200, operating_temp: 23.2 },
    { batch_no: 'B2601-A6', factory_id: 'Plant_A', workshop: 'Final_Test', yield_pct: 98.2, defect_ppm: 1800, operating_temp: 23.4 },

    { batch_no: 'B2601-B1', factory_id: 'Plant_B', workshop: 'SMT_1', yield_pct: 95.2, defect_ppm: 4800, operating_temp: 26.5 },
    { batch_no: 'B2601-B2', factory_id: 'Plant_B', workshop: 'SMT_2', yield_pct: 94.8, defect_ppm: 5200, operating_temp: 27.2 },
    { batch_no: 'B2601-B3', factory_id: 'Plant_B', workshop: 'Assembly_Line', yield_pct: 93.9, defect_ppm: 6100, operating_temp: 26.9 },
    { batch_no: 'B2601-B4', factory_id: 'Plant_B', workshop: 'Final_Test', yield_pct: 95.5, defect_ppm: 4500, operating_temp: 25.8 },
    { batch_no: 'B2601-B5', factory_id: 'Plant_B', workshop: 'SMT_1', yield_pct: 94.2, defect_ppm: 5800, operating_temp: 27.0 },
    { batch_no: 'B2601-B6', factory_id: 'Plant_B', workshop: 'Assembly_Line', yield_pct: 88.5, defect_ppm: 11500, operating_temp: 29.4 }, // Outlier

    { batch_no: 'B2601-C1', factory_id: 'Plant_C', workshop: 'SMT_1', yield_pct: 99.1, defect_ppm: 900, operating_temp: 22.1 },
    { batch_no: 'B2601-C2', factory_id: 'Plant_C', workshop: 'SMT_2', yield_pct: 99.3, defect_ppm: 700, operating_temp: 21.8 },
    { batch_no: 'B2601-C3', factory_id: 'Plant_C', workshop: 'Assembly_Line', yield_pct: 98.9, defect_ppm: 1100, operating_temp: 22.4 },
    { batch_no: 'B2601-C4', factory_id: 'Plant_C', workshop: 'Final_Test', yield_pct: 99.4, defect_ppm: 600, operating_temp: 21.9 },
    { batch_no: 'B2601-C5', factory_id: 'Plant_C', workshop: 'SMT_1', yield_pct: 99.0, defect_ppm: 1000, operating_temp: 22.3 },
    { batch_no: 'B2601-C6', factory_id: 'Plant_C', workshop: 'Final_Test', yield_pct: 99.2, defect_ppm: 800, operating_temp: 22.0 },

    { batch_no: 'B2601-D1', factory_id: 'Plant_D', workshop: 'SMT_1', yield_pct: 96.8, defect_ppm: 3200, operating_temp: 24.8 },
    { batch_no: 'B2601-D2', factory_id: 'Plant_D', workshop: 'SMT_2', yield_pct: 96.4, defect_ppm: 3600, operating_temp: 25.1 },
    { batch_no: 'B2601-D3', factory_id: 'Plant_D', workshop: 'Assembly_Line', yield_pct: 96.0, defect_ppm: 4000, operating_temp: 25.4 },
    { batch_no: 'B2601-D4', factory_id: 'Plant_D', workshop: 'Final_Test', yield_pct: 97.2, defect_ppm: 2800, operating_temp: 24.3 },
    { batch_no: 'B2601-D5', factory_id: 'Plant_D', workshop: 'SMT_1', yield_pct: 96.7, defect_ppm: 3300, operating_temp: 24.9 },
    { batch_no: 'B2601-D6', factory_id: 'Plant_D', workshop: 'Assembly_Line', yield_pct: 95.8, defect_ppm: 4200, operating_temp: 25.6 },
  ]
};

// 3. 金融时间序列股票收益率 (含缺失值 NA 与长宽表转换)
export const financialDataset: DataFrame = {
  id: 'df_finance',
  name: 'df_finance (金融证券多资产日频收益序列表)',
  description: '涵盖 16 个连续交易日内 3 只标的资产 (Tech300, MedBio, GreenEnergy) 的收盘点位与收益率，含假期间断缺失值 NA。',
  columns: [
    { name: 'date', type: 'Date', label: '交易日期' },
    { name: 'ticker', type: 'factor', levels: ['Tech300', 'MedBio', 'GreenEnergy'], label: '标的代码' },
    { name: 'close_price', type: 'numeric', label: '收盘价 (元)' },
    { name: 'daily_return', type: 'numeric', label: '单日收益率 (%)' },
    { name: 'volatility_3d', type: 'numeric', label: '3日滚动波动率' },
  ],
  data: [
    { date: '2026-03-01', ticker: 'Tech300', close_price: 3250.4, daily_return: 1.25, volatility_3d: 0.85 },
    { date: '2026-03-02', ticker: 'Tech300', close_price: 3280.1, daily_return: 0.91, volatility_3d: 0.78 },
    { date: '2026-03-03', ticker: 'Tech300', close_price: null, daily_return: null, volatility_3d: null }, // NA
    { date: '2026-03-04', ticker: 'Tech300', close_price: 3310.5, daily_return: 0.93, volatility_3d: 0.88 },
    { date: '2026-03-05', ticker: 'Tech300', close_price: 3290.0, daily_return: -0.62, volatility_3d: 0.92 },
    { date: '2026-03-06', ticker: 'Tech300', close_price: 3345.2, daily_return: 1.68, volatility_3d: 1.15 },

    { date: '2026-03-01', ticker: 'MedBio', close_price: 1850.0, daily_return: -0.45, volatility_3d: 0.62 },
    { date: '2026-03-02', ticker: 'MedBio', close_price: 1842.0, daily_return: -0.43, volatility_3d: 0.58 },
    { date: '2026-03-03', ticker: 'MedBio', close_price: 1865.0, daily_return: 1.25, volatility_3d: 0.71 },
    { date: '2026-03-04', ticker: 'MedBio', close_price: 1872.4, daily_return: 0.40, volatility_3d: 0.65 },
    { date: '2026-03-05', ticker: 'MedBio', close_price: null, daily_return: null, volatility_3d: null }, // NA
    { date: '2026-03-06', ticker: 'MedBio', close_price: 1890.0, daily_return: 0.94, volatility_3d: 0.82 },

    { date: '2026-03-01', ticker: 'GreenEnergy', close_price: 920.5, daily_return: 2.15, volatility_3d: 1.45 },
    { date: '2026-03-02', ticker: 'GreenEnergy', close_price: 940.0, daily_return: 2.12, volatility_3d: 1.52 },
    { date: '2026-03-03', ticker: 'GreenEnergy', close_price: 931.2, daily_return: -0.94, volatility_3d: 1.60 },
    { date: '2026-03-04', ticker: 'GreenEnergy', close_price: null, daily_return: null, volatility_3d: null }, // NA
    { date: '2026-03-05', ticker: 'GreenEnergy', close_price: 955.0, daily_return: 2.56, volatility_3d: 1.78 },
    { date: '2026-03-06', ticker: 'GreenEnergy', close_price: 970.0, daily_return: 1.57, volatility_3d: 1.62 },
  ]
};

// 4. 智慧城市空气质量监测 (时空切片案例)
export const airQualityDataset: DataFrame = {
  id: 'df_airquality',
  name: 'df_airquality (智慧城市时空空气质量监测表)',
  description: '涵盖 5 个监测站点（奥林匹克公园、金融街、高新产业园、滨江湿地、物流港）连续两日的空气质量细分监测指标。',
  columns: [
    { name: 'station_id', type: 'factor', levels: ['ST_Olympic', 'ST_FinStreet', 'ST_HiTech', 'ST_Wetland', 'ST_Logistics'], label: '监测站点' },
    { name: 'district_type', type: 'factor', levels: ['Urban', 'Commercial', 'Industrial', 'Ecological', 'Transport'], label: '功能区域' },
    { name: 'timestamp_hour', type: 'integer', label: '监测整点 (0-23h)' },
    { name: 'pm25_ug_m3', type: 'numeric', label: 'PM2.5 (μg/m³)' },
    { name: 'aqi', type: 'integer', label: '空气质量综合指数 (AQI)' },
    { name: 'no2_ug_m3', type: 'numeric', label: '二氧化氮 NO2 (μg/m³)' },
    { name: 'o3_ug_m3', type: 'numeric', label: '臭氧 O3 (μg/m³)' },
  ],
  data: [
    { station_id: 'ST_Olympic', district_type: 'Ecological', timestamp_hour: 8, pm25_ug_m3: 18.2, aqi: 26, no2_ug_m3: 22.4, o3_ug_m3: 45.0 },
    { station_id: 'ST_Olympic', district_type: 'Ecological', timestamp_hour: 12, pm25_ug_m3: 14.5, aqi: 21, no2_ug_m3: 18.1, o3_ug_m3: 68.2 },
    { station_id: 'ST_Olympic', district_type: 'Ecological', timestamp_hour: 18, pm25_ug_m3: 22.0, aqi: 31, no2_ug_m3: 31.0, o3_ug_m3: 52.4 },
    { station_id: 'ST_Olympic', district_type: 'Ecological', timestamp_hour: 22, pm25_ug_m3: 25.8, aqi: 37, no2_ug_m3: 38.5, o3_ug_m3: 32.1 },

    { station_id: 'ST_FinStreet', district_type: 'Commercial', timestamp_hour: 8, pm25_ug_m3: 45.2, aqi: 64, no2_ug_m3: 58.2, o3_ug_m3: 38.0 },
    { station_id: 'ST_FinStreet', district_type: 'Commercial', timestamp_hour: 12, pm25_ug_m3: 38.0, aqi: 54, no2_ug_m3: 42.6, o3_ug_m3: 74.5 },
    { station_id: 'ST_FinStreet', district_type: 'Commercial', timestamp_hour: 18, pm25_ug_m3: 58.4, aqi: 80, no2_ug_m3: 68.9, o3_ug_m3: 55.0 },
    { station_id: 'ST_FinStreet', district_type: 'Commercial', timestamp_hour: 22, pm25_ug_m3: 41.2, aqi: 58, no2_ug_m3: 49.3, o3_ug_m3: 40.2 },

    { station_id: 'ST_HiTech', district_type: 'Industrial', timestamp_hour: 8, pm25_ug_m3: 72.5, aqi: 97, no2_ug_m3: 65.4, o3_ug_m3: 32.1 },
    { station_id: 'ST_HiTech', district_type: 'Industrial', timestamp_hour: 12, pm25_ug_m3: 64.0, aqi: 87, no2_ug_m3: 52.0, o3_ug_m3: 62.4 },
    { station_id: 'ST_HiTech', district_type: 'Industrial', timestamp_hour: 18, pm25_ug_m3: 88.6, aqi: 118, no2_ug_m3: 78.5, o3_ug_m3: 48.0 },
    { station_id: 'ST_HiTech', district_type: 'Industrial', timestamp_hour: 22, pm25_ug_m3: 79.2, aqi: 105, no2_ug_m3: 71.0, o3_ug_m3: 36.5 },

    { station_id: 'ST_Wetland', district_type: 'Ecological', timestamp_hour: 8, pm25_ug_m3: 15.0, aqi: 22, no2_ug_m3: 14.2, o3_ug_m3: 42.0 },
    { station_id: 'ST_Wetland', district_type: 'Ecological', timestamp_hour: 12, pm25_ug_m3: 12.1, aqi: 17, no2_ug_m3: 11.5, o3_ug_m3: 65.0 },
    { station_id: 'ST_Wetland', district_type: 'Ecological', timestamp_hour: 18, pm25_ug_m3: 19.4, aqi: 28, no2_ug_m3: 20.1, o3_ug_m3: 49.2 },
    { station_id: 'ST_Wetland', district_type: 'Ecological', timestamp_hour: 22, pm25_ug_m3: 21.0, aqi: 30, no2_ug_m3: 24.0, o3_ug_m3: 29.8 },

    { station_id: 'ST_Logistics', district_type: 'Transport', timestamp_hour: 8, pm25_ug_m3: 82.0, aqi: 110, no2_ug_m3: 85.0, o3_ug_m3: 28.0 },
    { station_id: 'ST_Logistics', district_type: 'Transport', timestamp_hour: 12, pm25_ug_m3: 68.5, aqi: 92, no2_ug_m3: 62.0, o3_ug_m3: 54.0 },
    { station_id: 'ST_Logistics', district_type: 'Transport', timestamp_hour: 18, pm25_ug_m3: 95.2, aqi: 126, no2_ug_m3: 92.4, o3_ug_m3: 38.2 },
    { station_id: 'ST_Logistics', district_type: 'Transport', timestamp_hour: 22, pm25_ug_m3: 86.4, aqi: 115, no2_ug_m3: 81.0, o3_ug_m3: 25.4 },
  ]
};

// 5. 医疗临床试验疗效对照评估 (T-Test 案例)
export const clinicalTrialDataset: DataFrame = {
  id: 'df_clinical',
  name: 'df_clinical (肿瘤药物临床双盲试验对照表)',
  description: '比较试验组 (Treatment / 新型靶向抑制剂) 与对照组 (Control / 标准安慰剂) 在基线与服药 8 周后的生化指标改善情况。',
  columns: [
    { name: 'patient_id', type: 'character', label: '患者受试号' },
    { name: 'arm_group', type: 'factor', levels: ['Control', 'Treatment'], label: '试验分组' },
    { name: 'gender', type: 'factor', levels: ['Male', 'Female'], label: '性别' },
    { name: 'age', type: 'integer', label: '受试年龄 (岁)' },
    { name: 'baseline_biomarker', type: 'numeric', label: '入组基线抗原 (ng/mL)' },
    { name: 'week8_biomarker', type: 'numeric', label: '第8周复查抗原 (ng/mL)' },
    { name: 'reduction_pct', type: 'numeric', label: '抗原下降率 (%)' },
  ],
  data: [
    { patient_id: 'PT-01', arm_group: 'Treatment', gender: 'Female', age: 54, baseline_biomarker: 45.2, week8_biomarker: 12.1, reduction_pct: 73.2 },
    { patient_id: 'PT-02', arm_group: 'Treatment', gender: 'Male', age: 62, baseline_biomarker: 58.0, week8_biomarker: 16.5, reduction_pct: 71.6 },
    { patient_id: 'PT-03', arm_group: 'Treatment', gender: 'Female', age: 48, baseline_biomarker: 38.6, week8_biomarker: 9.8, reduction_pct: 74.6 },
    { patient_id: 'PT-04', arm_group: 'Treatment', gender: 'Male', age: 67, baseline_biomarker: 62.4, week8_biomarker: 21.0, reduction_pct: 66.3 },
    { patient_id: 'PT-05', arm_group: 'Treatment', gender: 'Female', age: 51, baseline_biomarker: 49.0, week8_biomarker: 11.2, reduction_pct: 77.1 },
    { patient_id: 'PT-06', arm_group: 'Treatment', gender: 'Male', age: 58, baseline_biomarker: 55.3, week8_biomarker: 14.8, reduction_pct: 73.2 },
    { patient_id: 'PT-07', arm_group: 'Treatment', gender: 'Female', age: 63, baseline_biomarker: 41.5, week8_biomarker: 13.0, reduction_pct: 68.7 },
    { patient_id: 'PT-08', arm_group: 'Treatment', gender: 'Male', age: 55, baseline_biomarker: 52.1, week8_biomarker: 15.2, reduction_pct: 70.8 },

    { patient_id: 'PT-09', arm_group: 'Control', gender: 'Female', age: 53, baseline_biomarker: 46.0, week8_biomarker: 44.2, reduction_pct: 3.9 },
    { patient_id: 'PT-10', arm_group: 'Control', gender: 'Male', age: 60, baseline_biomarker: 56.5, week8_biomarker: 58.0, reduction_pct: -2.7 },
    { patient_id: 'PT-11', arm_group: 'Control', gender: 'Female', age: 49, baseline_biomarker: 39.2, week8_biomarker: 37.5, reduction_pct: 4.3 },
    { patient_id: 'PT-12', arm_group: 'Control', gender: 'Male', age: 65, baseline_biomarker: 64.0, week8_biomarker: 62.1, reduction_pct: 3.0 },
    { patient_id: 'PT-13', arm_group: 'Control', gender: 'Female', age: 52, baseline_biomarker: 48.5, week8_biomarker: 47.0, reduction_pct: 3.1 },
    { patient_id: 'PT-14', arm_group: 'Control', gender: 'Male', age: 59, baseline_biomarker: 54.0, week8_biomarker: 55.2, reduction_pct: -2.2 },
    { patient_id: 'PT-15', arm_group: 'Control', gender: 'Female', age: 61, baseline_biomarker: 43.0, week8_biomarker: 41.8, reduction_pct: 2.8 },
    { patient_id: 'PT-16', arm_group: 'Control', gender: 'Male', age: 56, baseline_biomarker: 51.0, week8_biomarker: 49.5, reduction_pct: 2.9 },
  ]
};

// 6. 供应链多仓库库存周转率审计 (多表连接与失配审计)
export const warehouseInventoryDataset: DataFrame = {
  id: 'df_inventory',
  name: 'df_inventory (主仓物理现存明细表)',
  description: '记录各个仓储中心 SKU 的物理库位、在库数量与单位安全库存标准。',
  columns: [
    { name: 'sku_id', type: 'character', label: '物料编码 (SKU)' },
    { name: 'warehouse_code', type: 'factor', levels: ['WH_East', 'WH_North', 'WH_South', 'WH_West'], label: '所属仓库' },
    { name: 'on_hand_qty', type: 'integer', label: '当前在库物理数量' },
    { name: 'safety_stock', type: 'integer', label: '安全库存阈值' },
    { name: 'unit_cost_rmb', type: 'numeric', label: '单位采购成本 (元)' },
  ],
  data: [
    { sku_id: 'SKU-801', warehouse_code: 'WH_East', on_hand_qty: 450, safety_stock: 200, unit_cost_rmb: 120.0 },
    { sku_id: 'SKU-802', warehouse_code: 'WH_East', on_hand_qty: 80, safety_stock: 150, unit_cost_rmb: 45.0 }, // Understocked
    { sku_id: 'SKU-803', warehouse_code: 'WH_East', on_hand_qty: 1200, safety_stock: 300, unit_cost_rmb: 28.5 },
    { sku_id: 'SKU-804', warehouse_code: 'WH_North', on_hand_qty: 310, safety_stock: 180, unit_cost_rmb: 210.0 },
    { sku_id: 'SKU-805', warehouse_code: 'WH_North', on_hand_qty: 95, safety_stock: 100, unit_cost_rmb: 85.0 },
    { sku_id: 'SKU-806', warehouse_code: 'WH_North', on_hand_qty: 620, safety_stock: 250, unit_cost_rmb: 62.0 },
    { sku_id: 'SKU-807', warehouse_code: 'WH_South', on_hand_qty: 15, safety_stock: 120, unit_cost_rmb: 340.0 }, // Severe shortage
    { sku_id: 'SKU-808', warehouse_code: 'WH_South', on_hand_qty: 850, safety_stock: 400, unit_cost_rmb: 18.0 },
    { sku_id: 'SKU-809', warehouse_code: 'WH_West', on_hand_qty: 290, safety_stock: 150, unit_cost_rmb: 155.0 },
    { sku_id: 'SKU-810', warehouse_code: 'WH_West', on_hand_qty: 40, safety_stock: 80, unit_cost_rmb: 92.0 },
  ]
};

// 辅助表：发货出库流水表 (用于与库存表连接)
export const warehouseShipmentsDataset: DataFrame = {
  id: 'df_shipments',
  name: 'df_shipments (月度发货与出库汇总表)',
  description: '过去 30 天内各 SKU 的实际发货需求量，用于核算库存周转率。',
  columns: [
    { name: 'sku_id', type: 'character', label: '物料编码 (SKU)' },
    { name: 'monthly_shipped_qty', type: 'integer', label: '月出库总数量' },
    { name: 'order_count', type: 'integer', label: '出库履约订单笔数' },
  ],
  data: [
    { sku_id: 'SKU-801', monthly_shipped_qty: 900, order_count: 64 },
    { sku_id: 'SKU-802', monthly_shipped_qty: 450, order_count: 32 },
    { sku_id: 'SKU-803', monthly_shipped_qty: 320, order_count: 15 }, // Overstock / slow turnover
    { sku_id: 'SKU-804', monthly_shipped_qty: 680, order_count: 48 },
    { sku_id: 'SKU-805', monthly_shipped_qty: 210, order_count: 19 },
    { sku_id: 'SKU-806', monthly_shipped_qty: 1100, order_count: 82 },
    { sku_id: 'SKU-807', monthly_shipped_qty: 520, order_count: 41 },
    { sku_id: 'SKU-808', monthly_shipped_qty: 190, order_count: 12 },
    { sku_id: 'SKU-899', monthly_shipped_qty: 85, order_count: 7 }, // Orphan SKU (in shipment, but missing in physical inventory!)
  ]
};

// 7. 脏数据陷阱演示数据集 (Dirty Data for AI Diagnosis)
export const dirtyDataset: DataFrame = {
  id: 'df_dirty_sample',
  name: 'df_dirty (包含四大常见陷阱的脏数据示范表)',
  description: '故意混入缺失值 NA、文本空格、异常离群值与行名 (Row Names)，用于展示 R 语言鲁棒性诊断。',
  hasRowNames: true,
  rowNames: ['Row_01', 'Row_02', 'Row_03', 'Row_04', 'Row_05', 'Row_06', 'Row_07', 'Row_08'],
  columns: [
    { name: 'dept', type: 'factor', levels: ['Engineering', 'Marketing', 'Sales'], label: '部门' },
    { name: 'raw_score', type: 'numeric', label: '评分 (含 NA)' },
    { name: 'expense_txt', type: 'character', label: '报销额 (含字符文本与空格)' },
    { name: 'abnormal_flag', type: 'integer', label: '标记值 (含极端异常点)' },
  ],
  data: [
    { dept: 'Engineering', raw_score: 92.5, expense_txt: ' 1200 ', abnormal_flag: 10 },
    { dept: 'Engineering', raw_score: null, expense_txt: '1500', abnormal_flag: 12 }, // NA score
    { dept: 'Engineering', raw_score: 88.0, expense_txt: 'N/A', abnormal_flag: 11 }, // Text N/A in expense
    { dept: 'Marketing', raw_score: 75.0, expense_txt: '800', abnormal_flag: 9999 }, // Extreme outlier
    { dept: 'Marketing', raw_score: 79.5, expense_txt: '950 ', abnormal_flag: 14 },
    { dept: 'Sales', raw_score: 85.0, expense_txt: '2100', abnormal_flag: 15 },
    { dept: 'Sales', raw_score: null, expense_txt: '1900', abnormal_flag: 13 }, // NA score
    { dept: 'Sales', raw_score: 91.0, expense_txt: ' 3200', abnormal_flag: 18 },
  ]
};

export const allDatasets: DataFrame[] = [
  ecommerceDataset,
  manufacturingDataset,
  financialDataset,
  airQualityDataset,
  clinicalTrialDataset,
  warehouseInventoryDataset,
  dirtyDataset,
];

export const caseStudiesList = [
  {
    id: 'case_rfm',
    title: '① 电子商务用户消费行为聚类分析',
    mapping: '分组聚合与用户 RFM 指标多维计算',
    domain: '新零售 / 用户生命周期',
    description: '通过 Recency (最近消费天数)、Frequency (频次) 与 Monetary (消费总额) 结合 group_by 与 summarise 建立分层标签与高价值客户画像。',
    iconName: 'ShoppingBag',
    datasetId: 'df_ecommerce',
    explanation: '利用 R 语言 dplyr 的 group_by(membership_tier) 与 summarise 计算每个层级的平均间隔天数、消费金额及客单价，并利用 mutate() 构造 RFM 综合评分。',
    defaultRCode: `# ==============================================================================
# Case 1: E-commerce Customer RFM & Lifetime Value Analysis
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(ggplot2)
library(tibble)

# 1. Standalone Sample Dataset
df_ecommerce <- tibble(
  customer_id = c("CUST-1001", "CUST-1002", "CUST-1003", "CUST-1005", "CUST-1008", "CUST-1011", "CUST-1014", "CUST-1020", "CUST-1024"),
  recency_days = c(4, 12, 85, 8, 3, 6, 2, 5, 1),
  frequency = c(28, 19, 3, 35, 42, 24, 51, 27, 65),
  monetary_rmb = c(14200.5, 8650.0, 720.0, 21800.0, 36500.0, 13500.0, 45800.0, 15600.0, 58200.0),
  membership_tier = factor(c("VIP", "Gold", "Standard", "VIP", "VIP", "Gold", "VIP", "Gold", "VIP"))
)

# 2. Pipeline Execution
rfm_analysis <- df_ecommerce %>%
  filter(recency_days <= 180) %>%
  group_by(membership_tier) %>%
  summarise(
    user_count = n(),
    avg_recency = mean(recency_days, na.rm = TRUE),
    avg_frequency = mean(frequency, na.rm = TRUE),
    total_revenue = sum(monetary_rmb, na.rm = TRUE),
    arpu = mean(monetary_rmb, na.rm = TRUE),
    .groups = "drop" # Safe ungrouping
  ) %>%
  mutate(revenue_share_pct = round(total_revenue / sum(total_revenue) * 100, 2)) %>%
  arrange(desc(total_revenue))

# 3. High-Fidelity ggplot2 Plot (English Titles, Axes, Legends)
ggplot(df_ecommerce, aes(x = recency_days, y = monetary_rmb, color = membership_tier)) +
  geom_point(aes(size = frequency), alpha = 0.8) +
  scale_color_manual(values = c("VIP" = "#0284c7", "Gold" = "#d97706", "Standard" = "#94a3b8")) +
  labs(
    title = "Customer Lifetime Value: Recency vs Monetary",
    subtitle = "High-Value Active Segments Clustered by Frequency",
    x = "Recency (Days Since Last Order)",
    y = "Monetary Spending (RMB)",
    color = "Membership Tier",
    size = "Order Frequency"
  ) +
  theme_minimal(base_size = 11)

print(rfm_analysis)`,
  },
  {
    id: 'case_anova',
    title: '② 制造业多工厂生产良率对比',
    mapping: '按车间分组的方差分析 (ANOVA) 与异常检测',
    domain: '精密制造 / 质量工程',
    description: '针对 4 大制造基地的生产批次，执行分组方差齐性检查与单因素 ANOVA 检验，筛查不良率超标的离群工序。',
    iconName: 'Cpu',
    datasetId: 'df_manufacturing',
    explanation: '利用 dplyr 进行分组方差分析前置汇总，结合 aov(yield_pct ~ factory_id) 计算 F 统计量与 P 值，判断不同工厂基地之间良品率是否存在显著统计学差异。',
    defaultRCode: `# ==============================================================================
# Case 2: Multi-Factory Production Yield ANOVA & Quality Control
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(ggplot2)
library(tibble)

# 1. Standalone Sample Dataset
df_manufacturing <- tibble(
  factory_id = factor(c(rep("Plant_A", 4), rep("Plant_B", 4), rep("Plant_C", 4), rep("Plant_D", 4))),
  workshop = factor(rep(c("SMT_1", "SMT_2", "Assembly", "Final_Test"), 4)),
  yield_pct = c(98.4, 98.1, 97.9, 98.6,
                95.2, 94.8, 88.5, 95.5,
                99.1, 99.3, 98.9, 99.4,
                96.8, 96.4, 96.0, 97.2)
)

# 2. Summary & ANOVA Modeling
factory_summary <- df_manufacturing %>%
  group_by(factory_id) %>%
  summarise(
    batches = n(),
    mean_yield = round(mean(yield_pct, na.rm = TRUE), 2),
    sd_yield = round(sd(yield_pct, na.rm = TRUE), 3),
    min_yield = min(yield_pct, na.rm = TRUE),
    .groups = "drop"
  )

anova_fit <- aov(yield_pct ~ factory_id, data = df_manufacturing)

# 3. ggplot2 Boxplot (English Titles, Axes, Legends)
ggplot(df_manufacturing, aes(x = factory_id, y = yield_pct, fill = factory_id)) +
  geom_boxplot(alpha = 0.7, show.legend = FALSE) +
  geom_jitter(width = 0.15, size = 2, color = "#334155") +
  labs(
    title = "Production Yield Distribution Across Manufacturing Plants",
    subtitle = "One-Way ANOVA Model Verification with Outlier Screening",
    x = "Manufacturing Plant",
    y = "Production Yield (%)",
    caption = "Plant_B Assembly line shows significant process variance (88.5%)"
  ) +
  theme_minimal(base_size = 11)

print(factory_summary)
summary(anova_fit)`,
  },
  {
    id: 'case_finance',
    title: '③ 金融时间序列股票收益率清洗',
    mapping: '缺失值处理、滚动窗口计算与长宽表转换',
    domain: '量化金融 / 资产定价',
    description: '对多标的日频交易数据进行非交易日 NA 智能插补、滚动波动率对齐，并使用 pivot_wider 转化为宽表相关性矩阵。',
    iconName: 'TrendingUp',
    datasetId: 'df_finance',
    explanation: '金融数据中非同质停牌导致数据缺失。通过 tidyr::fill() 前向填充补全收盘价，再用 pivot_wider(names_from = ticker, values_from = daily_return) 构造多资产收益率宽表。',
    defaultRCode: `# ==============================================================================
# Case 3: Financial Multi-Asset Returns Imputation & Reshaping
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(tidyr)
library(ggplot2)
library(tibble)

# 1. Standalone Dataset with Weekend/Holiday Missing Values (NA)
df_finance <- tibble(
  date = as.Date(rep(c("2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04", "2026-03-05", "2026-03-06"), 3)),
  ticker = factor(c(rep("Tech300", 6), rep("MedBio", 6), rep("GreenEnergy", 6))),
  close_price = c(3250.4, 3280.1, NA, 3310.5, 3290.0, 3345.2,
                  1850.0, 1842.0, 1865.0, 1872.4, NA, 1890.0,
                  920.5, 940.0, 931.2, NA, 955.0, 970.0),
  daily_return = c(1.25, 0.91, NA, 0.93, -0.62, 1.68,
                   -0.45, -0.43, 1.25, 0.40, NA, 0.94,
                   2.15, 2.12, -0.94, NA, 2.56, 1.57)
)

# 2. Forward-Fill NA & Pivot to Wide Format
clean_returns <- df_finance %>%
  group_by(ticker) %>%
  arrange(date) %>%
  fill(close_price, .direction = "down") %>%
  ungroup() %>%
  filter(!is.na(daily_return)) %>%
  select(date, ticker, daily_return) %>%
  pivot_wider(names_from = ticker, values_from = daily_return)

# 3. ggplot2 Line Chart (English Titles, Axes, Legends)
ggplot(filter(df_finance, !is.na(daily_return)), aes(x = date, y = daily_return, color = ticker, group = ticker)) +
  geom_line(linewidth = 1) +
  geom_point(size = 2) +
  geom_hline(yintercept = 0, linetype = "dashed", color = "#94a3b8") +
  labs(
    title = "Multi-Asset Daily Return Volatility",
    subtitle = "Imputed Time Series Across Tech300, MedBio, and GreenEnergy",
    x = "Trading Date",
    y = "Daily Return (%)",
    color = "Ticker Symbol"
  ) +
  theme_minimal(base_size = 11)

print(clean_returns)`,
  },
  {
    id: 'case_airquality',
    title: '④ 智慧城市空气质量监测时空切片',
    mapping: '多条件行过滤与空间站点指标聚合',
    domain: '环境科学 / 智慧城市',
    description: '利用复合逻辑谓词提取交通高峰时段及工业区污染特征，聚合空间站点的多维气象与污染物浓度。',
    iconName: 'Wind',
    datasetId: 'df_airquality',
    explanation: '使用 filter(timestamp_hour %in% c(8, 18) & district_type != "Ecological") 精准切片早晚高峰高风险监测数据，结合 across() 计算多项污染物的均值。',
    defaultRCode: `# ==============================================================================
# Case 4: Smart City Air Quality Spatial-Temporal Slicing
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(ggplot2)
library(tibble)

# 1. Standalone Sample Dataset
df_airquality <- tibble(
  station_id = factor(c("ST_Olympic", "ST_FinStreet", "ST_HiTech", "ST_Wetland", "ST_Logistics",
                        "ST_Olympic", "ST_FinStreet", "ST_HiTech", "ST_Wetland", "ST_Logistics")),
  district_type = factor(c("Ecological", "Commercial", "Industrial", "Ecological", "Transport",
                           "Ecological", "Commercial", "Industrial", "Ecological", "Transport")),
  timestamp_hour = c(8, 8, 8, 8, 8, 18, 18, 18, 18, 18),
  pm25_ug_m3 = c(18.2, 45.2, 72.5, 15.0, 82.0, 22.0, 58.4, 88.6, 19.4, 95.2),
  aqi = c(26, 64, 97, 22, 110, 31, 80, 118, 28, 126)
)

# 2. Multi-Condition Slicing & Across Aggregation
air_summary <- df_airquality %>%
  filter(
    timestamp_hour %in% c(8, 18),
    district_type %in% c("Industrial", "Transport", "Commercial")
  ) %>%
  group_by(district_type, station_id) %>%
  summarise(
    mean_pm25 = round(mean(pm25_ug_m3, na.rm = TRUE), 1),
    max_aqi = max(aqi, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  arrange(desc(mean_pm25))

# 3. ggplot2 Bar Chart (English Titles, Axes, Legends)
ggplot(air_summary, aes(x = reorder(station_id, -mean_pm25), y = mean_pm25, fill = district_type)) +
  geom_col(width = 0.6) +
  labs(
    title = "Peak Hour Air Quality: PM2.5 Concentration by Station",
    subtitle = "Spatial Slices Across Commercial, Industrial, and Transport Zones",
    x = "Monitoring Station",
    y = "Mean PM2.5 Concentration (ug/m3)",
    fill = "District Type"
  ) +
  theme_minimal(base_size = 11)

print(air_summary)`,
  },
  {
    id: 'case_clinical',
    title: '⑤ 医疗临床试验疗效对照评估',
    mapping: '分组统计汇总与假设检验 (T-Test) 验证',
    domain: '生物医药 / 流行病学',
    description: '严格对照靶向药试验组与安慰剂组在抗原指标下降率上的分布，执行双独立样本 Welch 氏 t 检验与 95% 置信区间评估。',
    iconName: 'HeartPulse',
    datasetId: 'df_clinical',
    explanation: '医疗临床金标准。先对基线特征做平衡性检验，再对疗效指标 reduction_pct 分组计算 mean 与标准误 SE，最后调用 t.test() 输出 p-value 与检验推断。',
    defaultRCode: `# ==============================================================================
# Case 5: Clinical Trial Double-Blind Efficacy Evaluation (Welch T-Test)
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(ggplot2)
library(tibble)

# 1. Standalone Sample Clinical Trial Dataset
df_clinical <- tibble(
  patient_id = paste0("PT-", sprintf("%02d", 1:16)),
  arm_group = factor(c(rep("Treatment", 8), rep("Control", 8))),
  gender = factor(rep(c("Female", "Male"), 8)),
  age = c(54, 62, 48, 67, 51, 58, 63, 55, 53, 60, 49, 65, 52, 59, 61, 56),
  baseline_biomarker = c(45.2, 58.0, 38.6, 62.4, 49.0, 55.3, 41.5, 52.1, 46.0, 56.5, 39.2, 64.0, 48.5, 54.0, 43.0, 51.0),
  reduction_pct = c(73.2, 71.6, 74.6, 66.3, 77.1, 73.2, 68.7, 70.8, 3.9, -2.7, 4.3, 3.0, 3.1, -2.2, 2.8, 2.9)
)

# 2. Group Statistics & Welch Two-Sample T-Test
clinical_stats <- df_clinical %>%
  group_by(arm_group) %>%
  summarise(
    n_sample = n(),
    mean_reduction = round(mean(reduction_pct), 2),
    sd_reduction = round(sd(reduction_pct), 2),
    se_reduction = round(sd_reduction / sqrt(n_sample), 2),
    .groups = "drop"
  )

t_test_res <- t.test(reduction_pct ~ arm_group, data = df_clinical, conf.level = 0.95)

# 3. ggplot2 Visual Representation with Error Bars (English)
ggplot(clinical_stats, aes(x = arm_group, y = mean_reduction, fill = arm_group)) +
  geom_col(width = 0.5, show.legend = FALSE) +
  geom_errorbar(aes(ymin = mean_reduction - 1.96 * se_reduction, ymax = mean_reduction + 1.96 * se_reduction), width = 0.2) +
  labs(
    title = "Clinical Trial: Biomarker Reduction Rate by Arm Group",
    subtitle = "Comparison of Targeted Inhibitor vs Placebo (95% CI Error Bars)",
    x = "Trial Arm Group",
    y = "Mean Biomarker Reduction (%)",
    fill = "Study Arm"
  ) +
  theme_minimal(base_size = 11)

print(clinical_stats)
print(t_test_res)`,
  },
  {
    id: 'case_warehouse',
    title: '⑥ 供应链多仓库库存周转率审计',
    mapping: '多表内连接 (Inner Join) 与复杂汇总报表生成',
    domain: '现代物流 / 供应链运营',
    description: '通过物理现存表与出库流水表多表连接，审计呆滞积压物资 (Overstock) 与断货风险，并使用 anti_join 排查孤儿物料。',
    iconName: 'Truck',
    datasetId: 'df_inventory',
    explanation: '多表连接经典场景。将 df_inventory 与 df_shipments 通过 by = "sku_id" 执行 inner_join，计算月周转率 (Turnover = Shipped / OnHand)，并用 anti_join 筛查发货记录中存在但库存缺失的幽灵数据。',
    defaultRCode: `# ==============================================================================
# Case 6: Multi-Warehouse Inventory Turnover & Supply Chain Audit
# Ready to run directly in RStudio / R CLI without external dependencies
# ==============================================================================
library(dplyr)
library(ggplot2)
library(tibble)

# 1. Standalone Warehouse Physical Inventory & Shipments Datasets
df_inventory <- tibble(
  sku_id = c("SKU-801", "SKU-802", "SKU-803", "SKU-804", "SKU-807", "SKU-808"),
  warehouse_code = factor(c("WH_East", "WH_East", "WH_East", "WH_North", "WH_South", "WH_South")),
  on_hand_qty = c(450, 80, 1200, 310, 15, 850),
  safety_stock = c(200, 150, 300, 180, 120, 400),
  unit_cost_rmb = c(120.0, 45.0, 28.5, 210.0, 340.0, 18.0)
)

df_shipments <- tibble(
  sku_id = c("SKU-801", "SKU-802", "SKU-803", "SKU-804", "SKU-807", "SKU-808", "SKU-899"),
  monthly_shipped_qty = c(900, 450, 320, 680, 520, 190, 85)
)

# 2. Inner Join for Turnover & Anti Join for Orphan Records
inventory_turnover <- df_inventory %>%
  inner_join(df_shipments, by = "sku_id") %>%
  mutate(
    turnover_ratio = round(monthly_shipped_qty / on_hand_qty, 2),
    stock_status = factor(case_when(
      on_hand_qty < safety_stock ~ "Shortage Alert",
      turnover_ratio < 0.5 ~ "Overstock Risk",
      TRUE ~ "Healthy Turnover"
    ))
  ) %>%
  arrange(turnover_ratio)

# 3. ggplot2 Visual Representation (English)
ggplot(inventory_turnover, aes(x = sku_id, y = turnover_ratio, fill = stock_status)) +
  geom_col(width = 0.55) +
  geom_hline(yintercept = 1.0, linetype = "dashed", color = "#475569") +
  scale_fill_manual(values = c("Shortage Alert" = "#dc2626", "Overstock Risk" = "#d97706", "Healthy Turnover" = "#16a34a")) +
  labs(
    title = "Warehouse Inventory Turnover Ratio & Stock Health",
    subtitle = "Inner Join of Physical On-Hand Stock with 30-Day Shipments",
    x = "SKU Identifier",
    y = "Monthly Turnover Ratio (Shipped / On-Hand)",
    fill = "Stock Status"
  ) +
  theme_minimal(base_size = 11)

print(inventory_turnover)`,
  },
];
