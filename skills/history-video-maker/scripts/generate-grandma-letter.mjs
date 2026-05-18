/**
 * Generate: 《给阿嬷的情书》· 木生为什么要下南洋
 * Southeast Asia GDP Per Capita Race (1948-2018)
 *
 * Run: node scripts/generate-grandma-letter.mjs
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "history");

// Per capita GDP (current USD) — 5 countries × 71 years (1948-2018)
const data = {
  MYS: [202,205,208,211,214,218,221,224,227,231,234,237,241,232,237,289,300,324,336,333,341,368,380,404,462,676,808,768,893,1044,1280,1630,1886,1899,1995,2208,2411,2161,1872,2116,2258,2418,2469,2672,3120,3423,3706,4300,4770,4619,3264,3511,4084,3969,4244,4567,5086,5753,6400,7467,8738,7526,8899,10210,10596,10730,11072,9740,9610,10049,10902],
  THA: [73,75,77,79,82,84,86,89,92,94,97,100,103,109,115,119,126,138,160,165,172,184,197,199,214,275,338,356,395,448,529,588,709,744,762,813,829,754,817,939,1124,1293,1559,1763,1967,2237,2506,2848,3036,2459,1839,2026,2006,1894,2098,2361,2662,2899,3378,3986,4397,4235,4974,5386,5755,6067,5865,5765,5928,6533,7100],
  VNM: [66,67,68,69,70,71,72,73,74,76,77,78,79,79,80,80,81,81,82,82,83,84,83,84,84,85,86,86,96,107,120,134,143,160,178,199,222,247,455,624,426,104,99,144,146,192,233,293,344,369,370,385,404,417,442,491,557,698,794,916,1160,1228,1683,1948,2177,2344,2523,2549,2699,2912,3222],
  IDN: [55,55,55,55,55,55,55,55,55,56,56,56,56,56,55,55,55,55,54,54,66,76,79,79,91,131,203,234,280,336,370,362,487,561,578,509,521,513,472,439,479,527,578,623,671,813,893,1002,1107,1032,449,647,764,732,879,1039,1120,1229,1545,1805,2101,2190,3066,3578,3630,3563,3435,3281,3512,3786,3861],
  CHN: [45,47,48,50,52,53,55,57,64,71,78,84,90,76,71,74,86,99,105,97,92,100,113,119,132,157,160,179,166,186,157,184,195,197,204,226,251,295,282,252,284,311,319,334,368,379,476,613,713,787,835,881,969,1065,1164,1307,1531,1778,2129,2735,3523,3898,4629,5708,6422,7178,7824,8227,8310,9043,10086],
};

const entities = [
  { code: "MYS", iso2: "MY", name: "马来西亚", nameEn: "Malaysia", region: "东南亚" },
  { code: "THA", iso2: "TH", name: "泰国", nameEn: "Thailand", region: "东南亚" },
  { code: "VNM", iso2: "VN", name: "越南", nameEn: "Vietnam", region: "东南亚" },
  { code: "IDN", iso2: "ID", name: "印度尼西亚", nameEn: "Indonesia", region: "东南亚" },
  { code: "CHN", iso2: "CN", name: "中国", nameEn: "China", region: "东亚" },
];

function buildFrame(year, valuesMap) {
  const items = Object.entries(valuesMap)
    .map(([code, value]) => {
      const entity = entities.find((e) => e.code === code);
      if (!entity) return null;
      if (typeof entity.iso2 === 'undefined') return null;
      return {
        code: entity.code,
        iso2: entity.iso2,
        name: entity.name,
        nameEn: entity.nameEn,
        region: entity.region,
        value,
        gdp: value,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.value - a.value)
    .map((i, idx, arr) => ({
      ...i,
      rank: idx + 1,
      share: arr.reduce((s, x) => s + x.value, 0) > 0
        ? i.value / arr.reduce((s, x) => s + x.value, 0)
        : 0,
      rankDelta: 0,
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
      item.rankDelta = prev === undefined ? 0 : prev - item.rank;
      prevRank[item.code] = item.rank;
    }
  }
}

const years = [];
for (let y = 1948; y <= 2018; y++) years.push(y);

const frames = years.map((year) => {
  const idx = year - 1948;
  const valuesMap = {};
  for (const code of Object.keys(data)) {
    valuesMap[code] = data[code][idx];
  }
  return buildFrame(year, valuesMap);
});

computeRankDeltas(frames);

const dataset = {
  slug: "grandma-letter-nanyang-gdp",
  title: "东南亚人均GDP排位赛（1948-2018）",
  titleEn: "Southeast Asia GDP Per Capita Race (1948-2018)",
  summary: "从1948年到2018年，看中国与东南亚国家的人均GDP排名如何在七十年间从悬殊走向逆转。",
  summaryEn: "From 1948 to 2018, see how China's per capita GDP ranking against Southeast Asian nations reversed over seven decades.",
  sourceLabel: "World Bank WDI (NY.GDP.PCAP.CD) · 中国国家统计局 · AI估算补全",
  sourceLabelEn: "World Bank WDI (NY.GDP.PCAP.CD) · China NBS · AI estimation",
  sourceUrl: "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD",
  sourceNote: "1960年以前数据基于AI估算补全，通过反向外推和插值方法生成。越南因战争数据波动较大，1985年前为AI估算。印度尼西亚1967年前为AI估算。",
  sourceNoteEn: "Pre-1960 data estimated via back-extrapolation and interpolation. Vietnam data before 1985 estimated. Indonesia data before 1967 estimated.",
  unit: "人均GDP（当前美元）",
  unitShort: "USD",
  valueKind: "count",
  axisRetreatThreshold: 0.2,
  showFlags: true,
  startYear: 1948,
  endYear: 2018,
  entities,
  events: [
    {
      id: "musheng-departure",
      year: 1948,
      entityCode: "CHN",
      kind: "context",
      title: "木生告别潮汕，乘红头船下南洋",
      titleEn: "Musheng leaves Chaoshan for Nanyang",
      description: "潮汕青年郑木生为躲抓壮丁，告别妻儿，挤上红头船漂向大海。彼时中国人均GDP仅$45，不足马来西亚的四分之一。",
      descriptionEn: "To escape conscription, Musheng leaves his wife and children for Nanyang. China's per capita GDP is only $45.",
      entityName: "中国",
      rank: 5,
      value: 45,
      gdp: 45,
    },
    {
      id: "musheng-malaysia",
      year: 1953,
      entityCode: "MYS",
      kind: "context",
      title: "马来西亚锡矿 · 木生第一站",
      titleEn: "Malaysia tin mines",
      description: "木生到马来西亚锡矿场和橡胶园做苦力。马来亚人均GDP近$218，是中国的4倍。",
      descriptionEn: "Musheng works in tin mines and rubber plantations. Malaya's per capita GDP is 4x China's.",
      entityName: "马来西亚",
      rank: 1,
      value: 218,
      gdp: 218,
    },
    {
      id: "musheng-thailand",
      year: 1957,
      entityCode: "THA",
      kind: "context",
      title: "辗转暹罗 · 曼谷唐人街",
      titleEn: "Bangkok Chinatown",
      description: "木生辗转曼谷唐人街，蹬三轮、扛码头货。在旅馆结识房东女儿谢南枝。",
      descriptionEn: "Musheng arrives in Bangkok Chinatown, working as a rickshaw puller. He meets Xie Nanzhi at a hostel.",
      entityName: "泰国",
      rank: 2,
      value: 94,
      gdp: 94,
    },
    {
      id: "musheng-death",
      year: 1960,
      entityCode: "CHN",
      kind: "context",
      title: "木生之死 · 南枝代写侨批十八年",
      titleEn: "Musheng dies, Nanzhi writes for 18 years",
      description: "木生为救落水同乡不幸遇难。谢南枝隐瞒死讯，以他的名义继续向潮汕写信寄钱，一写就是十八年。",
      descriptionEn: "Musheng drowns saving a fellow villager. Xie Nanzhi conceals his death and continues sending money home for 18 years.",
      entityName: "中国",
      rank: 3,
      value: 90,
      gdp: 90,
    },
    {
      id: "nanzhi-letters",
      year: 1970,
      entityCode: "CHN",
      kind: "context",
      title: "十八年侨批 · 咸猪肉、自行车、布料",
      titleEn: "18 years of remittance letters",
      description: "南枝模仿木生笔迹，寄咸猪肉、寄自行车、寄布料、寄学费。中国正值文革，人均GDP仅$113。",
      descriptionEn: "Nanzhi forges Musheng's handwriting, sending money for food, bicycles, cloth, and school fees during the Cultural Revolution.",
      entityName: "中国",
      rank: 4,
      value: 113,
      gdp: 113,
    },
    {
      id: "reform-opening",
      year: 1978,
      entityCode: "CHN",
      kind: "context",
      title: "改革开放 · 南枝的信还在写",
      titleEn: "Reform and Opening Up",
      description: "中国迎来改革开放。但人均GDP仅$157，东南亚领先中国数倍。南枝继续写信——她不知道，故土已经开始变了。",
      descriptionEn: "China begins Reform and Opening Up, but per capita GDP is only $157. Nanzhi keeps writing, unaware things are changing back home.",
      entityName: "中国",
      rank: 5,
      value: 157,
      gdp: 157,
    },
    {
      id: "asian-crisis",
      year: 1997,
      entityCode: "THA",
      kind: "context",
      title: "亚洲金融风暴 · 泰国梦碎",
      titleEn: "Asian Financial Crisis",
      description: "泰铢崩溃，泰国人均GDP从$3,036暴跌至$2,459。曼谷唐人街侨批汇款缩水大半。",
      descriptionEn: "Thai baht collapses, per capita GDP drops from $3,036 to $2,459. Remittance values shrink dramatically.",
      entityName: "泰国",
      rank: 3,
      value: 2459,
      gdp: 2459,
    },
    {
      id: "letter-secret-revealed",
      year: 2018,
      entityCode: "CHN",
      kind: "context",
      title: "七十年后 · 给阿嬷的情书",
      titleEn: "The Secret Letter",
      description: "淑柔的孙子去泰国寻亲，揭开南枝守护了半个世纪的秘密——木生1960年已去世。中国人均GDP达$10,086，但那些侨批里的情义，无法用数字丈量。",
      descriptionEn: "The grandson goes to Thailand and uncovers Nanzhi's half-century secret — Musheng died in 1960. China's per capita GDP reaches $10,086.",
      entityName: "中国",
      rank: 2,
      value: 10086,
      gdp: 10086,
    },
  ],
  frames,
};

const path = join(DATA_DIR, "grandma-letter-nanyang-gdp.json");
writeFileSync(path, JSON.stringify(dataset, null, 2), "utf-8");
console.log(`Written: ${path} (${dataset.frames.length} frames, ${dataset.events.length} events)`);
