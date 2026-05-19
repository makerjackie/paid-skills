import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "..", "data", "history", "chinese-creators-youtube-race.json");

const years = Array.from({ length: 10 }, (_, index) => 2017 + index);

const entities = [
  {
    code: "LZQ",
    name: "李子柒",
    nameEn: "Li Ziqi",
    region: "中国大陆",
    values: [800000, 4000000, 8500000, 12000000, 16700000, 17700000, 18200000, 20000000, 24000000, 31000000],
  },
  {
    code: "GUIGE",
    name: "鬼哥",
    nameEn: "Gui Ge",
    region: "中国大陆",
    values: [0, 0, 0, 100000, 1000000, 3800000, 8500000, 13500000, 17500000, 20900000],
  },
  {
    code: "FSS",
    name: "胖松松和瘦二毛",
    nameEn: "FatSongsong and ThinErmao",
    region: "中国大陆",
    values: [0, 0, 0, 0, 0, 500000, 5000000, 12000000, 17500000, 20100000],
  },
  {
    code: "QX",
    name: "奇軒Tricking",
    nameEn: "Qixuan Tricking",
    region: "中国台湾",
    values: [1000000, 1800000, 2800000, 4000000, 5800000, 7500000, 9500000, 11500000, 14000000, 15700000],
  },
  {
    code: "MSYEAH",
    name: "办公室小野",
    nameEn: "Ms Yeah",
    region: "中国大陆",
    values: [1200000, 5000000, 8000000, 9600000, 10500000, 11300000, 12200000, 13000000, 13800000, 14100000],
  },
  {
    code: "MANYU",
    name: "是曼玉不是鳗鱼",
    nameEn: "Mandy",
    region: "中国大陆",
    values: [0, 0, 0, 0, 0, 0, 500000, 6000000, 10500000, 13400000],
  },
  {
    code: "DXXG",
    name: "滇西小哥",
    nameEn: "Dianxi Xiaoge",
    region: "中国大陆",
    values: [200000, 1200000, 4000000, 6500000, 8000000, 9500000, 10700000, 11200000, 11800000, 12300000],
  },
  {
    code: "RS",
    name: "Roman & Sharon",
    nameEn: "Roman and Sharon",
    region: "中国大陆",
    values: [0, 0, 0, 0, 0, 1500000, 7100000, 7500000, 7700000, 7810000],
  },
  {
    code: "LAOG",
    name: "老高与小茉",
    nameEn: "Mr & Mrs Gao",
    region: "华语",
    values: [1500000, 3500000, 4500000, 5000000, 5600000, 6000000, 6300000, 6500000, 6600000, 6730000],
  },
  {
    code: "ZXW",
    name: "钟薛蛙",
    nameEn: "Zhongxuewa",
    region: "中国大陆",
    values: [0, 0, 0, 0, 0, 200000, 2200000, 4500000, 6000000, 6590000],
  },
  {
    code: "YE",
    name: "葉式特工",
    nameEn: "Yes Ranger",
    region: "中国台湾",
    values: [1000000, 1800000, 2500000, 3200000, 4000000, 4800000, 5400000, 5900000, 6200000, 6510000],
  },
  {
    code: "XKHC",
    name: "俠客紅塵",
    nameEn: "Xia Ke Hong Chen",
    region: "中国大陆",
    values: [0, 0, 0, 100000, 1200000, 2800000, 4200000, 5100000, 5600000, 5890000],
  },
  {
    code: "LUREN",
    name: "整個路人",
    nameEn: "A Whole Passerby",
    region: "中国大陆",
    values: [0, 0, 0, 0, 0, 0, 100000, 2200000, 4100000, 4980000],
  },
  {
    code: "TGOP",
    name: "這群人TGOP",
    nameEn: "This Group of People",
    region: "中国台湾",
    values: [2200000, 2600000, 2900000, 3100000, 3250000, 3350000, 3400000, 3430000, 3440000, 3450000],
  },
  {
    code: "ASHEN",
    name: "阿神",
    nameEn: "A Shen",
    region: "中国台湾",
    values: [1400000, 1900000, 2300000, 2600000, 2850000, 3000000, 3100000, 3180000, 3230000, 3290000],
  },
  {
    code: "DSJ",
    name: "大树君",
    nameEn: "TreeMan",
    region: "中国大陆",
    values: [0, 500000, 1200000, 1800000, 2200000, 2500000, 2800000, 3000000, 3100000, 3170000],
  },
  {
    code: "ADI",
    name: "阿滴英文",
    nameEn: "Ray Du English",
    region: "中国台湾",
    values: [700000, 1300000, 1700000, 2200000, 2500000, 2700000, 2800000, 2860000, 2890000, 2900000],
  },
];

function buildFrames() {
  let previousRanks = new Map();

  return years.map((year, yearIndex) => {
    const ranked = entities
      .map((entity) => ({
        code: entity.code,
        name: entity.name,
        nameEn: entity.nameEn,
        region: entity.region,
        value: entity.values[yearIndex] ?? 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const total = ranked.reduce((sum, item) => sum + item.value, 0);
    const items = ranked.map((item, index) => {
      const rank = index + 1;
      const previousRank = previousRanks.get(item.code);
      return {
        ...item,
        rank,
        share: total > 0 ? Number((item.value / total).toFixed(4)) : 0,
        rankDelta: previousRank ? previousRank - rank : 0,
      };
    });

    previousRanks = new Map(items.map((item) => [item.code, item.rank]));

    return { year, total, items };
  });
}

const data = {
  slug: "chinese-creators-youtube-race",
  title: "华语自媒体 YouTube 订阅排名变化",
  titleEn: "Chinese Creator YouTube Subscriber Race",
  summary:
    "从 2017 年到 2026 年，看华语与华人自媒体 YouTube 频道订阅排名的变化。李子柒长期领跑，办公室小野、滇西小哥打开全球传播，2022 年后大量短视频账号快速追上。",
  summaryEn:
    "Track subscriber growth of Chinese-language and Chinese creator YouTube channels from 2017 to 2026. Li Ziqi leads for years, while short-form creator accounts surge after 2022.",
  sourceLabel: "YouTube 公开页 / YouTubers.me / Wikipedia 订阅榜",
  sourceLabelEn: "YouTube public pages / YouTubers.me / Wikipedia subscriber lists",
  sourceUrl: "https://us.youtubers.me/china/all/top-1000-most-subscribed-youtube-channels-in-china",
  sourcePages: [
    {
      year: 2026,
      title: "YouTubers.me China top subscribed channels",
      url: "https://us.youtubers.me/china/all/top-1000-most-subscribed-youtube-channels-in-china",
    },
    {
      year: 2026,
      title: "中国大陆 YouTube 频道订阅人数排行榜",
      url: "https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%9C%8B%E5%A4%A7%E9%99%B8YouTube%E9%A0%BB%E9%81%93%E8%A8%82%E9%96%B1%E4%BA%BA%E6%95%B8%E6%8E%92%E8%A1%8C%E6%A6%9C",
    },
    {
      year: 2026,
      title: "台灣 YouTube 頻道訂閱人數排行榜",
      url: "https://zh.wikipedia.org/wiki/%E5%8F%B0%E7%81%A3YouTube%E9%A0%BB%E9%81%93%E8%A8%82%E9%96%B1%E4%BA%BA%E6%95%B8%E6%8E%92%E8%A1%8C%E6%A6%9C",
    },
  ],
  sourceNote:
    "2026 年截面基于 YouTube 公开页、YouTubers.me 与中文 Wikipedia 订阅榜等公开记录交叉整理。2017-2025 年年度序列用于视频可视化，结合公开里程碑、起号年份和第三方历史记录估算，不应视为逐年精确审计数据。排除官方影视、电视台、音乐厂牌、品牌和儿童频道，保留个人或团队自媒体账号。",
  sourceNoteEn:
    "2026 snapshot compiled from YouTube public pages, YouTubers.me, and Chinese Wikipedia subscriber lists. 2017-2025 annual values are visualization estimates based on public milestones, channel start dates, and third-party historical records. Official media, music labels, brand, and kids channels are excluded.",
  unit: "订阅者",
  unitShort: "subs",
  valueKind: "count",
  showFlags: false,
  axisRetreatThreshold: 0.18,
  startYear: 2017,
  endYear: 2026,
  entities: entities.map(({ values, ...entity }) => entity),
  events: [
    {
      id: "e01",
      year: 2017,
      entityCode: "LZQ",
      kind: "milestone",
      title: "李子柒进入 YouTube 全球视野",
      titleEn: "Li Ziqi Gains Global Attention",
      description: "传统生活方式影像开始在海外平台快速传播",
      descriptionEn: "Traditional lifestyle videos started spreading globally",
      entityName: "李子柒",
      rank: 3,
    },
    {
      id: "e02",
      year: 2018,
      entityCode: "MSYEAH",
      kind: "milestone",
      title: "办公室小野打开海外爆款路线",
      titleEn: "Ms Yeah Breaks Out",
      description: "办公室料理创意短视频成为中国创作者出海代表",
      descriptionEn: "Office cooking videos became a China creator export case",
      entityName: "办公室小野",
      rank: 1,
    },
    {
      id: "e03",
      year: 2019,
      entityCode: "DXXG",
      kind: "milestone",
      title: "滇西小哥冲进千万级梯队",
      titleEn: "Dianxi Xiaoge Rises",
      description: "乡村生活、美食和地方风物成为海外观众熟悉的中国内容类型",
      descriptionEn: "Rural lifestyle and food videos found global audiences",
      entityName: "滇西小哥",
      rank: 4,
    },
    {
      id: "e04",
      year: 2021,
      entityCode: "LZQ",
      kind: "milestone",
      title: "李子柒继续扩大领先优势",
      titleEn: "Li Ziqi Extends Her Lead",
      description: "公开订阅里程碑显示，李子柒已成为最具全球影响力的中文创作者之一",
      descriptionEn: "Public milestones show Li Ziqi among the most influential Chinese creators",
      entityName: "李子柒",
      rank: 1,
    },
    {
      id: "e05",
      year: 2023,
      entityCode: "RS",
      kind: "trend",
      title: "短视频账号开始挤进前排",
      titleEn: "Short-form Accounts Surge",
      description: "Roman and Sharon、FatSongsong and ThinErmao 等账号快速追上长视频创作者",
      descriptionEn: "Short-form creator accounts started catching up with long-form channels",
      entityName: "Roman and Sharon",
      rank: 6,
    },
    {
      id: "e06",
      year: 2024,
      entityCode: "QX",
      kind: "milestone",
      title: "奇軒Tricking突破千万",
      titleEn: "Qixuan Tricking Reaches 10M",
      description: "动作类短视频说明语言门槛更低的内容也能进入全球流量池",
      descriptionEn: "Action shorts show how low-language-barrier content can scale globally",
      entityName: "奇軒Tricking",
      rank: 5,
    },
    {
      id: "e07",
      year: 2025,
      entityCode: "MANYU",
      kind: "trend",
      title: "新短视频账号继续上冲",
      titleEn: "New Short-form Accounts Keep Climbing",
      description: "是曼玉不是鳗鱼、钟薛蛙等账号把榜单推向短视频时代",
      descriptionEn: "New creator accounts pushed the ranking toward short-form video",
      entityName: "是曼玉不是鳗鱼",
      rank: 7,
    },
    {
      id: "e08",
      year: 2026,
      entityCode: "LZQ",
      kind: "milestone",
      title: "李子柒仍是华语创作者天花板",
      titleEn: "Li Ziqi Still Leads",
      description: "2026 年截面中，李子柒仍以约 3100 万订阅领跑",
      descriptionEn: "In the 2026 snapshot, Li Ziqi still leads at roughly 31M subscribers",
      entityName: "李子柒",
      rank: 1,
    },
  ],
  frames: buildFrames(),
};

writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Wrote ${dataPath}`);
