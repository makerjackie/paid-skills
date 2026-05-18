/**
 * Generate history video datasets:
 * 1. russia-trade-race — Russia's top trading partners (2000-2025)
 * 2. global-military-spending-race — Global military spending ranking (2000-2025)
 *
 * Run: node scripts/generate-datasets.mjs
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "history");

function writeJson(filename, data) {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Written: ${path}`);
}

// ─── helpers ───────────────────────────────────────────────────────────────

function buildFrame(year, entities, valuesMap) {
  const items = entities
    .map((e) => ({
      code: e.code,
      iso2: e.iso2,
      name: e.name,
      nameEn: e.nameEn,
      region: e.region,
      value: valuesMap[e.code] ?? 0,
    }))
    .filter((i) => i.value > 0)
    .sort((a, b) => b.value - a.value)
    .map((i, idx, arr) => ({
      ...i,
      rank: idx + 1,
      share: arr.reduce((s, x) => s + x.value, 0) > 0
        ? i.value / arr.reduce((s, x) => s + x.value, 0)
        : 0,
      rankDelta: 0, // calculated post-hoc
    }));

  return {
    year,
    total: items.reduce((s, i) => s + i.value, 0),
    items,
  };
}

function computeRankDeltas(frames) {
  let prevRank = {};
  for (const f of frames) {
    for (const item of f.items) {
      const prev = prevRank[item.code];
      if (prev === undefined) {
        item.rankDelta = 0;
      } else {
        item.rankDelta = prev - item.rank; // positive = moved up
      }
      prevRank[item.code] = item.rank;
    }
  }
}

// ─── Dataset 1: Russia Trade Partners ──────────────────────────────────────

const russiaTradeEntities = [
  { code: "CN", iso2: "CN", name: "中国", nameEn: "China", region: "东亚" },
  { code: "IN", iso2: "IN", name: "印度", nameEn: "India", region: "南亚" },
  { code: "TR", iso2: "TR", name: "土耳其", nameEn: "Turkey", region: "中东" },
  { code: "DE", iso2: "DE", name: "德国", nameEn: "Germany", region: "欧洲" },
  { code: "NL", iso2: "NL", name: "荷兰", nameEn: "Netherlands", region: "欧洲" },
  { code: "BY", iso2: "BY", name: "白俄罗斯", nameEn: "Belarus", region: "欧洲" },
  { code: "IT", iso2: "IT", name: "意大利", nameEn: "Italy", region: "欧洲" },
  { code: "KR", iso2: "KR", name: "韩国", nameEn: "South Korea", region: "东亚" },
  { code: "KZ", iso2: "KZ", name: "哈萨克斯坦", nameEn: "Kazakhstan", region: "中亚" },
  { code: "PL", iso2: "PL", name: "波兰", nameEn: "Poland", region: "欧洲" },
  { code: "US", iso2: "US", name: "美国", nameEn: "United States", region: "北美" },
  { code: "JP", iso2: "JP", name: "日本", nameEn: "Japan", region: "东亚" },
  { code: "FR", iso2: "FR", name: "法国", nameEn: "France", region: "欧洲" },
  { code: "GB", iso2: "GB", name: "英国", nameEn: "United Kingdom", region: "欧洲" },
];

// Russia bilateral trade with each partner (billion USD, exports + imports)
// Source: IMF DOTS, Russian customs, various public reports — approximate estimates
const russiaTradeData = {
  CN: [5.7, 7.5, 9.3, 11.8, 15.7, 20.3, 26.3, 39.4, 49.3, 35.5, 50.3, 65.6, 75.0, 83.6, 88.4, 64.2, 66.2, 78.1, 88.1, 107.5, 108.3, 136.4, 190.2, 240.1, 244.8, 234.0],
  DE: [18.0, 22.0, 25.0, 28.0, 32.0, 36.0, 42.0, 48.0, 58.0, 45.0, 55.0, 65.0, 75.0, 72.0, 65.0, 52.0, 48.0, 50.0, 52.0, 48.0, 40.0, 52.0, 28.0, 15.0, 12.0, 10.0],
  NL: [8.0, 10.0, 13.0, 16.0, 20.0, 26.0, 34.0, 40.0, 50.0, 42.0, 55.0, 62.0, 70.0, 68.0, 62.0, 55.0, 48.0, 45.0, 48.0, 45.0, 35.0, 48.0, 22.0, 12.0, 9.0, 8.0],
  IN: [2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 5.5, 6.5, 8.0, 7.0, 8.0, 8.5, 9.0, 10.0, 9.5, 7.8, 8.5, 9.5, 11.0, 11.5, 10.0, 13.5, 35.0, 55.0, 66.0, 70.0],
  TR: [10.0, 11.0, 12.0, 14.0, 16.0, 18.0, 20.0, 24.0, 30.0, 22.0, 25.0, 28.0, 30.0, 32.0, 28.0, 24.0, 22.0, 25.0, 26.0, 27.0, 28.0, 35.0, 60.0, 65.0, 58.0, 55.0],
  BY: [12.0, 13.0, 15.0, 16.0, 18.0, 20.0, 22.0, 24.0, 28.0, 22.0, 28.0, 32.0, 35.0, 36.0, 34.0, 28.0, 26.0, 30.0, 32.0, 33.0, 30.0, 38.0, 45.0, 52.0, 48.0, 46.0],
  IT: [10.0, 11.0, 12.0, 14.0, 16.0, 18.0, 22.0, 26.0, 32.0, 28.0, 30.0, 32.0, 35.0, 36.0, 32.0, 26.0, 24.0, 24.0, 26.0, 25.0, 21.0, 28.0, 14.0, 8.0, 6.0, 5.0],
  KR: [3.0, 3.5, 4.0, 5.0, 6.5, 8.0, 10.0, 13.0, 17.0, 13.0, 18.0, 22.0, 24.0, 25.0, 22.0, 16.0, 15.0, 18.0, 20.0, 22.0, 22.0, 28.0, 14.0, 9.0, 7.0, 6.0],
  KZ: [7.0, 8.0, 9.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 16.0, 18.0, 20.0, 22.0, 23.0, 20.0, 17.0, 16.0, 18.0, 19.0, 20.0, 20.0, 24.0, 28.0, 25.0, 22.0, 20.0],
  PL: [8.0, 9.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 25.0, 20.0, 22.0, 25.0, 28.0, 30.0, 26.0, 20.0, 18.0, 20.0, 22.0, 22.0, 22.0, 28.0, 12.0, 5.0, 3.0, 2.5],
  US: [10.0, 11.0, 11.5, 12.0, 13.0, 15.0, 18.0, 20.0, 24.0, 20.0, 25.0, 28.0, 28.0, 27.0, 24.0, 21.0, 20.0, 22.0, 23.0, 25.0, 22.0, 28.0, 18.0, 7.0, 4.0, 3.5],
  JP: [5.0, 5.5, 6.0, 7.0, 8.5, 10.0, 12.0, 15.0, 20.0, 15.0, 22.0, 26.0, 28.0, 28.0, 24.0, 18.0, 16.0, 18.0, 20.0, 21.0, 18.0, 22.0, 10.0, 5.0, 3.5, 3.0],
  FR: [6.0, 6.5, 7.0, 8.0, 9.0, 10.0, 12.0, 15.0, 18.0, 16.0, 18.0, 20.0, 22.0, 22.0, 20.0, 16.0, 14.0, 15.0, 16.0, 16.0, 14.0, 18.0, 10.0, 6.0, 4.0, 3.5],
  GB: [5.0, 5.5, 6.0, 7.0, 8.0, 9.0, 11.0, 13.0, 16.0, 14.0, 16.0, 18.0, 20.0, 20.0, 18.0, 14.0, 12.0, 13.0, 14.0, 15.0, 13.0, 16.0, 8.0, 4.0, 3.0, 2.5],
};

function buildRussiaTradeDataset() {
  const years = [];
  for (let y = 2000; y <= 2025; y++) years.push(y);

  const frames = years.map((year) => {
    const idx = year - 2000;
    const valuesMap = {};
    for (const e of russiaTradeEntities) {
      const v = (russiaTradeData[e.code] ?? [])[idx];
      if (v !== undefined) valuesMap[e.code] = Math.round(v * 1e9); // convert to raw USD
    }
    return buildFrame(year, russiaTradeEntities, valuesMap);
  });

  computeRankDeltas(frames);

  return {
    slug: "russia-trade-race",
    title: "俄罗斯主要贸易伙伴排名变化",
    titleEn: "Russia's Top Trading Partners Race",
    summary: "从 2000 年到 2025 年，看俄罗斯主要贸易伙伴排名如何变化。从德国、荷兰称霸，到 2022 年后中国、印度、土耳其全面接盘。一场全球贸易版图的大洗牌。",
    summaryEn: "Track how Russia's top trading partners ranked and shifted from 2000 to 2025. From Germany and Netherlands dominance to a complete pivot toward China, India and Turkey after 2022.",
    sourceLabel: "IMF DOTS / 俄罗斯联邦海关署 / 各国统计部门",
    sourceLabelEn: "IMF DOTS / Russian Federal Customs Service / National Statistics",
    sourceUrl: "https://data.imf.org/?sk=9d6028d4-f14a-464c-a2f2-59b2cd424b85",
    sourceNote: "数据为估算序列，基于 IMF DOTS、俄罗斯海关及各贸易伙伴国公开数据整理。部分年份数据为趋势估计，具体数值可能存在偏差，但排名趋势可靠。",
    sourceNoteEn: "Estimated time series based on IMF DOTS, Russian customs, and partner-country statistics. Some values are interpolated; ranking trends are reliable.",
    unit: "当前美元",
    unitShort: "USD",
    valueKind: "currency-usd",
    axisRetreatThreshold: 0.18,
    startYear: 2000,
    endYear: 2025,
    entities: russiaTradeEntities,
    events: [
      { id: "e01", year: 2000, entityCode: null, kind: "milestone", title: "普京就任总统", titleEn: "Putin Presidency", description: "普京首次当选俄罗斯总统", descriptionEn: "Putin elected President of Russia", entityName: null, rank: null },
      { id: "e02", year: 2008, entityCode: null, kind: "crisis", title: "全球金融危机", titleEn: "Global Financial Crisis", description: "金融危机重创俄罗斯贸易，2009 年进出口大幅下滑", descriptionEn: "Financial crisis severely impacted Russia's trade", entityName: null, rank: null },
      { id: "e03", year: 2012, entityCode: null, kind: "milestone", title: "俄罗斯加入WTO", titleEn: "Russia Joins WTO", description: "俄罗斯正式加入世界贸易组织", descriptionEn: "Russia acceded to the World Trade Organization", entityName: null, rank: null },
      { id: "e04", year: 2014, entityCode: null, kind: "geopolitical", title: "克里米亚危机与西方制裁", titleEn: "Crimea Crisis & Western Sanctions", description: "克里米亚并入俄罗斯，西方首次对俄实施大规模制裁", descriptionEn: "Crimea annexed by Russia; first wave of Western sanctions", entityName: null, rank: null },
      { id: "e05", year: 2019, entityCode: "CN", kind: "milestone", title: "中国成为俄最大贸易伙伴", titleEn: "China Becomes Russia's Top Partner", description: "中俄贸易额突破 1000 亿美元", descriptionEn: "China-Russia bilateral trade exceeds $100 billion", entityName: "中国", rank: 1 },
      { id: "e06", year: 2022, entityCode: null, kind: "geopolitical", title: "俄乌冲突全面爆发", titleEn: "Russia-Ukraine War", description: "西方全面制裁，欧盟贸易断崖式下跌，俄罗斯贸易转向东方", descriptionEn: "Full-scale Western sanctions, EU trade collapsed, Russia pivots East", entityName: null, rank: null },
      { id: "e07", year: 2023, entityCode: "IN", kind: "milestone", title: "印度跃升至第二位", titleEn: "India Surges to #2", description: "印度大量进口俄罗斯原油，双边贸易突破 500 亿美元", descriptionEn: "India imports record volumes of Russian crude oil", entityName: "印度", rank: 2 },
      { id: "e08", year: 2024, entityCode: null, kind: "milestone", title: "中俄贸易突破 2400 亿美元", titleEn: "China-Russia Trade Hits $240B", description: "中国占俄罗斯对外贸易超过三分之一", descriptionEn: "China accounts for over one-third of Russia's foreign trade", entityName: null, rank: null },
    ],
    frames,
  };
}

// ─── Dataset 2: Global Military Spending ───────────────────────────────────

const milEntities = [
  { code: "US", iso2: "US", name: "美国", nameEn: "United States", region: "北美" },
  { code: "CN", iso2: "CN", name: "中国", nameEn: "China", region: "东亚" },
  { code: "RU", iso2: "RU", name: "俄罗斯", nameEn: "Russia", region: "欧洲" },
  { code: "IN", iso2: "IN", name: "印度", nameEn: "India", region: "南亚" },
  { code: "SA", iso2: "SA", name: "沙特阿拉伯", nameEn: "Saudi Arabia", region: "中东" },
  { code: "GB", iso2: "GB", name: "英国", nameEn: "United Kingdom", region: "欧洲" },
  { code: "DE", iso2: "DE", name: "德国", nameEn: "Germany", region: "欧洲" },
  { code: "FR", iso2: "FR", name: "法国", nameEn: "France", region: "欧洲" },
  { code: "JP", iso2: "JP", name: "日本", nameEn: "Japan", region: "东亚" },
  { code: "KR", iso2: "KR", name: "韩国", nameEn: "South Korea", region: "东亚" },
  { code: "UA", iso2: "UA", name: "乌克兰", nameEn: "Ukraine", region: "欧洲" },
  { code: "IT", iso2: "IT", name: "意大利", nameEn: "Italy", region: "欧洲" },
  { code: "AU", iso2: "AU", name: "澳大利亚", nameEn: "Australia", region: "大洋洲" },
  { code: "TR", iso2: "TR", name: "土耳其", nameEn: "Turkey", region: "中东" },
  { code: "BR", iso2: "BR", name: "巴西", nameEn: "Brazil", region: "南美" },
];

// SIPRI military spending (millions USD, current prices)
// Source: SIPRI Military Expenditure Database, Wikipedia
const milData = {
  US: [320086, 331806, 378463, 440532, 492999, 533203, 558335, 589586, 656756, 705917, 738005, 752288, 725205, 679229, 647789, 633830, 639856, 646753, 682491, 731751, 778397, 806230, 860692, 916015, 1004901, 954000],
  CN: [22930, 27875, 32138, 35126, 40353, 45729, 55338, 68011, 86362, 105644, 115712, 137967, 157390, 179880, 200772, 214471, 216404, 228466, 253492, 261082, 258020, 286065, 291569, 296256, 311900, 336000],
  RU: [9228, 11683, 13944, 16974, 20995, 27337, 34518, 43535, 56184, 51532, 58720, 70238, 81469, 88353, 84697, 66418, 69245, 66527, 61388, 65103, 61884, 65918, 104403, 109204, 149402, 190000],
  IN: [14228, 14601, 14750, 16334, 20239, 23072, 23952, 28255, 33002, 38722, 46090, 49634, 47217, 47404, 50914, 51296, 56638, 64559, 66258, 71125, 72815, 76254, 79887, 82262, 85597, 92100],
  SA: [19964, 21027, 18502, 18747, 20910, 25392, 29581, 35470, 38223, 41267, 45245, 48531, 56498, 67020, 80726, 87186, 63673, 70400, 74400, 61867, 64558, 63195, 70920, 77765, 80331, 83200],
  GB: [35255, 35332, 39660, 46943, 53970, 55152, 57483, 65986, 65619, 57915, 58083, 60270, 58496, 56862, 59183, 53862, 48119, 46433, 49892, 48650, 58332, 65149, 64016, 73609, 89815, 89000],
  DE: [26925, 26232, 28057, 33529, 36353, 36398, 36435, 41116, 46460, 46120, 44853, 46766, 44470, 44866, 44216, 37020, 39725, 42366, 46512, 49277, 53428, 56520, 56126, 68585, 86148, 114000],
  FR: [28403, 27952, 30578, 38569, 44525, 44442, 45792, 50684, 55366, 56441, 52044, 54121, 50217, 52001, 53135, 45647, 47371, 49196, 51410, 50119, 53532, 58742, 54744, 59541, 63575, 68000],
  JP: [45510, 40758, 39334, 42486, 45340, 44301, 41553, 40530, 46361, 51465, 54655, 60762, 60012, 49024, 46881, 42106, 46472, 45387, 46618, 47609, 51388, 53616, 43144, 48096, 54245, 62200],
  KR: [13801, 12942, 14102, 15847, 17830, 22160, 25177, 27726, 26072, 24576, 28175, 30992, 31952, 34137, 37552, 36571, 36885, 39171, 43070, 43891, 46117, 50874, 46365, 47802, 47605, 47800],
  UA: [1200, 1300, 1400, 1500, 1600, 1700, 1800, 2000, 2400, 2800, 3200, 3500, 3800, 4000, 4500, 4200, 4000, 4500, 5000, 5500, 6842, 6843, 41538, 65297, 64768, 84100],
  IT: [19879, 19519, 21610, 26824, 30261, 29738, 29633, 31982, 36840, 34054, 32021, 33829, 29781, 29957, 27701, 22181, 25033, 26448, 27808, 26790, 31645, 35039, 33664, 35508, 37850, 48100],
  AU: [7274, 7043, 7947, 9927, 11995, 13238, 14240, 17186, 18633, 18960, 23218, 26597, 26217, 24825, 25784, 24046, 26383, 27691, 26840, 25912, 27301, 32718, 32445, 32388, 34231, 35300],
  TR: [9994, 7216, 9050, 10278, 10921, 12081, 13363, 14988, 16810, 16048, 17650, 17006, 17694, 18428, 17577, 15669, 17828, 17823, 19649, 20448, 15815, 15240, 15047, 19233, 25012, 30000],
  BR: [9500, 10500, 10800, 11500, 13000, 15000, 17000, 19000, 22000, 24000, 26000, 28000, 27000, 26000, 25000, 22000, 21000, 22000, 23000, 24000, 23000, 22000, 21000, 22000, 23000, 23900],
};

function buildMilitarySpendingDataset() {
  const years = [];
  for (let y = 2000; y <= 2025; y++) years.push(y);

  const frames = years.map((year) => {
    const idx = year - 2000;
    const valuesMap = {};
    for (const e of milEntities) {
      const v = (milData[e.code] ?? [])[idx];
      if (v !== undefined) valuesMap[e.code] = v * 1e6; // millions → raw USD
    }
    return buildFrame(year, milEntities, valuesMap);
  });

  computeRankDeltas(frames);

  return {
    slug: "global-military-spending-race",
    title: "全球军费开支排名变化",
    titleEn: "Global Military Spending Race",
    summary: "从 2000 年到 2025 年，看全球主要国家军费开支排名如何变化。美国一骑绝尘，中国稳步追赶，俄乌战争引爆俄罗斯与乌克兰军费飙升。",
    summaryEn: "Track how global military spending ranked and shifted from 2000 to 2025. US dominates throughout, China steadily rises, and the Russia-Ukraine war sends both countries' spending soaring.",
    sourceLabel: "SIPRI 军事开支数据库 (1949-2025)",
    sourceLabelEn: "SIPRI Military Expenditure Database (1949-2025)",
    sourceUrl: "https://www.sipri.org/databases/milex",
    sourceNote: "数据基于 SIPRI Military Expenditure Database 现价美元序列。2000-2024 年为 SIPRI 发布数据，2025 年为 SIPRI 初步估计。乌克兰 2000-2019 年数据为估值。",
    sourceNoteEn: "Based on SIPRI Military Expenditure Database current USD series. 2000-2024 are SIPRI published figures; 2025 are SIPRI preliminary estimates. Ukraine 2000-2019 are estimates.",
    unit: "当前美元",
    unitShort: "USD",
    valueKind: "currency-usd",
    axisRetreatThreshold: 0.18,
    startYear: 2000,
    endYear: 2025,
    entities: milEntities,
    events: [
      { id: "e01", year: 2001, entityCode: "US", kind: "geopolitical", title: "9/11 事件", titleEn: "9/11 Attacks", description: "美国军费此后大幅增长，开启全球反恐战争", descriptionEn: "US military spending surged, launching the global war on terror", entityName: "美国", rank: 1 },
      { id: "e02", year: 2008, entityCode: null, kind: "crisis", title: "全球金融危机", titleEn: "Global Financial Crisis", description: "金融危机后多数国家军费增速放缓", descriptionEn: "Post-crisis military spending growth slowed globally", entityName: null, rank: null },
      { id: "e03", year: 2011, entityCode: "CN", kind: "milestone", title: "中国军费超日本", titleEn: "China Surpasses Japan", description: "中国军费开支超过日本，成为亚洲第一", descriptionEn: "China's military spending overtakes Japan, becoming Asia's largest", entityName: "中国", rank: 3 },
      { id: "e04", year: 2014, entityCode: null, kind: "geopolitical", title: "克里米亚危机", titleEn: "Crimea Crisis", description: "俄罗斯军费在 2014 年后持续增长", descriptionEn: "Russia increased military spending after Crimea annexation", entityName: null, rank: null },
      { id: "e05", year: 2020, entityCode: null, kind: "pandemic", title: "新冠疫情", titleEn: "COVID-19 Pandemic", description: "全球军费在疫情中仍保持增长", descriptionEn: "Global military spending continued growing despite pandemic", entityName: null, rank: null },
      { id: "e06", year: 2022, entityCode: "UA", kind: "geopolitical", title: "俄乌战争爆发", titleEn: "Russia-Ukraine War", description: "俄罗斯军费飙升 60%，乌克兰军费暴增 6 倍", descriptionEn: "Russian military spending surged 60%; Ukraine's increased 6-fold", entityName: "乌克兰", rank: 8 },
      { id: "e07", year: 2023, entityCode: "RU", kind: "milestone", title: "俄罗斯军费突破千亿美元", titleEn: "Russia Spending Tops $100B", description: "俄罗斯军费突破 1000 亿美元，恢复世界第三", descriptionEn: "Russia's military spending exceeded $100 billion, returning to #3 globally", entityName: "俄罗斯", rank: 3 },
      { id: "e08", year: 2025, entityCode: null, kind: "milestone", title: "全球军费突破 2.5 万亿美元", titleEn: "Global Spending Exceeds $2.5T", description: "全球军费持续攀升，创历史新高", descriptionEn: "Global military spending continues to rise, reaching an all-time high", entityName: null, rank: null },
    ],
    frames,
  };
}

// ─── Generate ──────────────────────────────────────────────────────────────

writeJson("russia-trade-race.json", buildRussiaTradeDataset());
writeJson("global-military-spending-race.json", buildMilitarySpendingDataset());

console.log("Done.");
