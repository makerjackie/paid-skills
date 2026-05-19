import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'history');

function writeJson(filename, data) {
  const filePath = join(DATA_DIR, filename);
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${filePath}`);
}

function buildFrames(years, entities, series) {
  const frames = years.map((year, yearIndex) => {
    const rows = entities
      .map((entity) => ({
        ...entity,
        value: series[entity.code]?.[yearIndex] ?? 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((item, index, arr) => ({
        ...item,
        rank: index + 1,
        share: item.value / arr.reduce((sum, current) => sum + current.value, 0),
        rankDelta: 0,
      }));

    return {
      year,
      total: rows.reduce((sum, item) => sum + item.value, 0),
      items: rows,
    };
  });

  computeRankDeltas(frames);
  return frames;
}

function computeRankDeltas(frames) {
  const previousRanks = new Map();

  for (const frame of frames) {
    for (const item of frame.items) {
      const previousRank = previousRanks.get(item.code);
      item.rankDelta = previousRank === undefined ? 0 : previousRank - item.rank;
      previousRanks.set(item.code, item.rank);
    }
  }
}

function event(id, year, title, description, entityCode = null, entityName = null, rank = null, value = null) {
  return {
    id,
    year,
    entityCode,
    kind: entityCode ? 'milestone' : 'context',
    title,
    titleEn: title,
    description,
    descriptionEn: description,
    entityName,
    rank,
    value,
  };
}

function creator(code, name, region) {
  return {code, iso2: code, name, nameEn: name, region};
}

function buildGlobalYoutubeChannels() {
  const years = Array.from({length: 15}, (_, index) => 2012 + index);
  const entities = [
    creator('PEW', 'PewDiePie', '个人创作者'),
    creator('TS', 'T-Series', '音乐厂牌'),
    creator('BEAST', 'MrBeast', '个人创作者'),
    creator('COCO', 'Cocomelon', '儿童内容'),
    creator('SET', 'SET India', '影视娱乐'),
    creator('DIANA', 'Kids Diana Show', '儿童内容'),
    creator('NASTYA', 'Like Nastya', '儿童内容'),
    creator('WWE', 'WWE', '体育娱乐'),
    creator('ZEE', 'Zee Music', '音乐厂牌'),
    creator('VLAD', 'Vlad and Niki', '儿童内容'),
    creator('BLACK', 'BLACKPINK', '音乐艺人'),
    creator('BIEBER', 'Justin Bieber', '音乐艺人'),
  ];

  const series = {
    PEW: [2_000_000, 19_000_000, 33_000_000, 40_000_000, 50_000_000, 58_000_000, 79_000_000, 102_000_000, 108_000_000, 110_000_000, 111_000_000, 111_000_000, 111_000_000, 110_000_000, 110_000_000],
    TS: [700_000, 1_500_000, 4_000_000, 9_000_000, 17_000_000, 30_000_000, 75_000_000, 100_000_000, 155_000_000, 200_000_000, 230_000_000, 250_000_000, 266_000_000, 290_000_000, 311_000_000],
    BEAST: [50_000, 120_000, 450_000, 1_200_000, 3_000_000, 6_000_000, 15_000_000, 25_000_000, 45_000_000, 80_000_000, 112_000_000, 210_000_000, 270_000_000, 400_000_000, 483_000_000],
    COCO: [300_000, 700_000, 1_500_000, 4_000_000, 9_000_000, 18_000_000, 42_000_000, 70_000_000, 100_000_000, 120_000_000, 145_000_000, 165_000_000, 176_000_000, 190_000_000, 201_000_000],
    SET: [2_500_000, 4_000_000, 6_000_000, 10_000_000, 18_000_000, 28_000_000, 45_000_000, 60_000_000, 80_000_000, 105_000_000, 130_000_000, 155_000_000, 170_000_000, 180_000_000, 188_000_000],
    DIANA: [0, 0, 0, 500_000, 2_000_000, 8_000_000, 22_000_000, 45_000_000, 65_000_000, 82_000_000, 98_000_000, 110_000_000, 120_000_000, 130_000_000, 138_000_000],
    NASTYA: [0, 0, 0, 100_000, 1_500_000, 7_000_000, 20_000_000, 45_000_000, 65_000_000, 80_000_000, 95_000_000, 110_000_000, 118_000_000, 123_000_000, 127_000_000],
    WWE: [5_000_000, 7_000_000, 10_000_000, 15_000_000, 21_000_000, 30_000_000, 40_000_000, 50_000_000, 65_000_000, 78_000_000, 90_000_000, 96_000_000, 102_000_000, 106_000_000, 110_000_000],
    ZEE: [300_000, 700_000, 2_000_000, 5_000_000, 12_000_000, 22_000_000, 35_000_000, 50_000_000, 65_000_000, 80_000_000, 92_000_000, 100_000_000, 106_000_000, 110_000_000, 114_000_000],
    VLAD: [0, 0, 0, 0, 500_000, 4_000_000, 13_000_000, 33_000_000, 55_000_000, 75_000_000, 90_000_000, 105_000_000, 115_000_000, 125_000_000, 132_000_000],
    BLACK: [0, 0, 0, 0, 5_000_000, 14_000_000, 25_000_000, 32_000_000, 50_000_000, 60_000_000, 75_000_000, 85_000_000, 92_000_000, 96_000_000, 100_000_000],
    BIEBER: [30_000_000, 35_000_000, 40_000_000, 45_000_000, 50_000_000, 55_000_000, 60_000_000, 62_000_000, 65_000_000, 67_000_000, 70_000_000, 72_000_000, 73_000_000, 74_000_000, 75_000_000],
  };

  return {
    slug: 'global-youtube-channels-race',
    title: '全球 YouTube 订阅排名变化',
    titleEn: 'Global YouTube Subscriber Race',
    summary: '从 2012 到 2026，看全球 YouTube 订阅榜如何从个人创作者时代，转向音乐厂牌、儿童内容和超级创作者并存。',
    sourceLabel: 'YouTube 公开数据 / Social Blade / HypeAuditor / Wikipedia',
    sourceLabelEn: 'YouTube public data / Social Blade / HypeAuditor / Wikipedia',
    sourceUrl: 'https://en.wikipedia.org/wiki/List_of_most-subscribed_YouTube_channels',
    sourcePages: [
      {year: 2026, title: 'HypeAuditor YouTube Ranking', url: 'https://hypeauditor.com/top-youtube/'},
      {year: 2026, title: 'DataReport-style YouTube channel stats', url: 'https://www.demandsage.com/youtube-stats/'},
      {year: 2024, title: 'Axios: MrBeast takes YouTube crown', url: 'https://www.axios.com/2024/06/03/mrbeast-youtube-most-subscribers-tseries'},
    ],
    sourceNote: '逐年订阅数为公开榜单、里程碑报道、Social Blade 记录和频道页面近似值整理；适合展示趋势，不代表逐日精确快照。',
    unit: '订阅者',
    unitShort: 'subs',
    valueKind: 'count',
    musicId: 'hd235-bright-life',
    themeId: 'tech-signal',
    startYear: 2012,
    endYear: 2026,
    entities,
    frames: buildFrames(years, entities, series),
    events: [
      event('pew-first', 2013, 'PewDiePie 成为第一', '个人游戏创作者登上 YouTube 订阅榜首。', 'PEW', 'PewDiePie', 1, 19_000_000),
      event('tseries-race', 2018, 'PewDiePie vs T-Series', '订阅大战把 YouTube 频道竞争推向主流舆论。'),
      event('tseries-first', 2019, 'T-Series 登顶', '印度音乐厂牌超过 PewDiePie，平台第一从个人转向机构。', 'TS', 'T-Series', 1, 100_000_000),
      event('cocomelon-100m', 2020, 'Cocomelon 破亿', '儿童内容成为全球 YouTube 订阅榜最强品类之一。', 'COCO', 'Cocomelon', 3, 100_000_000),
      event('beast-100m', 2022, 'MrBeast 破亿', '挑战、慈善和高预算视频把个人创作者带回榜单中心。', 'BEAST', 'MrBeast', 4, 112_000_000),
      event('beast-first', 2024, 'MrBeast 超过 T-Series', 'MrBeast 以约 2.7 亿订阅成为全球第一频道。', 'BEAST', 'MrBeast', 1, 270_000_000),
      event('beast-400m', 2025, 'MrBeast 进入 4 亿时代', '个人创作者频道规模接近传统媒体网络。', 'BEAST', 'MrBeast', 1, 400_000_000),
    ],
  };
}

function buildBilibiliCreators() {
  const years = Array.from({length: 11}, (_, index) => 2016 + index);
  const entities = [
    creator('LUO', '罗翔说刑法', '知识'),
    creator('FAN', '老番茄', '游戏'),
    creator('HE', '老师好我叫何同学', '科技'),
    creator('BI', '哔哩哔哩漫画', '平台账号'),
    creator('ZHOU', '周深', '音乐'),
    creator('MENG', '萌宠小队', '泛娱乐'),
    creator('MUMU', '木鱼水心', '影视解说'),
    creator('ZHU', '朱一旦的枯燥生活', '短剧'),
    creator('KAN', '看理想', '知识'),
    creator('ALEX', 'LexBurner', '动画'),
    creator('CHAI', '差评君', '科技'),
    creator('BAN', '半佛仙人', '商业'),
  ];

  const series = {
    FAN: [1_000_000, 2_500_000, 5_000_000, 8_000_000, 12_000_000, 15_000_000, 17_000_000, 18_300_000, 19_000_000, 19_700_000, 20_000_000],
    ALEX: [2_000_000, 3_500_000, 5_500_000, 8_000_000, 9_500_000, 10_500_000, 10_800_000, 10_600_000, 10_400_000, 10_200_000, 10_000_000],
    LUO: [0, 0, 0, 200_000, 10_000_000, 18_000_000, 24_000_000, 28_000_000, 30_000_000, 32_200_000, 33_000_000],
    HE: [0, 0, 500_000, 2_000_000, 5_000_000, 8_000_000, 10_000_000, 11_000_000, 11_800_000, 12_500_000, 13_000_000],
    BI: [0, 500_000, 1_500_000, 3_000_000, 5_500_000, 8_000_000, 10_500_000, 12_000_000, 13_500_000, 14_500_000, 15_500_000],
    ZHOU: [0, 0, 0, 300_000, 1_500_000, 4_000_000, 7_000_000, 10_000_000, 12_000_000, 14_000_000, 15_000_000],
    MENG: [0, 0, 0, 500_000, 2_000_000, 5_000_000, 8_000_000, 11_000_000, 13_000_000, 14_000_000, 14_500_000],
    MUMU: [300_000, 800_000, 1_500_000, 3_000_000, 5_000_000, 7_000_000, 8_500_000, 9_500_000, 10_500_000, 11_000_000, 11_500_000],
    ZHU: [0, 0, 0, 2_000_000, 5_000_000, 7_000_000, 8_500_000, 9_200_000, 9_800_000, 10_200_000, 10_500_000],
    KAN: [200_000, 500_000, 900_000, 1_500_000, 2_500_000, 4_000_000, 6_000_000, 8_000_000, 9_500_000, 10_500_000, 11_000_000],
    CHAI: [500_000, 1_000_000, 2_000_000, 3_500_000, 5_000_000, 6_500_000, 7_500_000, 8_200_000, 8_800_000, 9_200_000, 9_500_000],
    BAN: [0, 0, 0, 500_000, 2_500_000, 5_500_000, 7_000_000, 8_000_000, 8_800_000, 9_100_000, 9_300_000],
  };

  return {
    slug: 'bilibili-creators-race',
    title: 'B站 UP 主粉丝排名变化',
    titleEn: 'Bilibili Creator Follower Race',
    summary: '从 2016 到 2026，看 B站头部 UP 主粉丝量如何从游戏、动画，转向知识、科技、影视和泛娱乐混战。',
    sourceLabel: 'Bilibili 公开主页 / 粉丝榜归档 / 维基百科条目',
    sourceLabelEn: 'Bilibili public pages / follower ranking archives / Wikipedia',
    sourceUrl: 'https://zh.wikipedia.org/wiki/%E7%B2%89%E4%B8%9D%E6%95%B0%E6%9C%80%E5%A4%9A%E7%9A%84%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9UP%E4%B8%BB',
    sourcePages: [
      {year: 2025, title: '粉丝数最多的哔哩哔哩UP主', url: 'https://zh.wikipedia.org/wiki/%E7%B2%89%E4%B8%9D%E6%95%B0%E6%9C%80%E5%A4%9A%E7%9A%84%E5%93%94%E5%93%A9%E5%93%94%E5%93%A9UP%E4%B8%BB'},
      {year: 2020, title: '老番茄粉丝破千万', url: 'https://zh.wikipedia.org/wiki/%E8%80%81%E7%95%AA%E8%8C%84'},
    ],
    sourceNote: 'B站未提供官方历史粉丝 API，逐年数据按公开里程碑、历史榜单视频、页面快照和当前公开粉丝量估算；排名趋势优先于单点精确值。',
    unit: '粉丝',
    unitShort: 'fans',
    valueKind: 'count',
    musicId: 'hd235-bright-life',
    themeId: 'tech-signal',
    startYear: 2016,
    endYear: 2026,
    entities,
    frames: buildFrames(years, entities, series),
    events: [
      event('laofanqie-fast', 2018, '老番茄进入头部', '游戏内容和高密度剪辑让老番茄成为 B站头部个人创作者。', 'FAN', '老番茄', 1, 5_000_000),
      event('he-hey', 2019, '何同学 5G 视频出圈', '科技视频从数码圈扩散到大众讨论。', 'HE', '老师好我叫何同学', null, 2_000_000),
      event('luoxiang-join', 2020, '罗翔入驻 B站', '法律知识内容快速破圈，知识区获得全民级入口。', 'LUO', '罗翔说刑法', 2, 10_000_000),
      event('laofanqie-10m', 2020, '老番茄破千万', '老番茄成为 B站首个粉丝破千万的 UP 主。', 'FAN', '老番茄', 1, 12_000_000),
      event('knowledge-rise', 2021, '知识区集体上升', '罗翔、半佛、看理想等账号继续推高知识内容天花板。'),
      event('luoxiang-first', 2022, '罗翔长期领跑', '罗翔说刑法成为 B站非站方账号粉丝第一梯队。', 'LUO', '罗翔说刑法', 1, 24_000_000),
    ],
  };
}

function buildAiYoutubeCreators() {
  const years = Array.from({length: 9}, (_, index) => 2018 + index);
  const entities = [
    creator('TMP', 'Two Minute Papers', 'AI 论文'),
    creator('FIRESHIP', 'Fireship', '开发者科普'),
    creator('WOLFE', 'Matt Wolfe', 'AI 工具'),
    creator('BERMAN', 'Matthew Berman', 'AI 工具'),
    creator('AIE', 'AI Explained', 'AI 分析'),
    creator('WES', 'Wes Roth', 'AI 新闻'),
    creator('YANNIC', 'Yannic Kilcher', 'ML 论文'),
    creator('KARPATHY', 'Andrej Karpathy', 'AI 教育'),
    creator('MATT', 'MattVidPro AI', 'AI 创作'),
    creator('SHA', 'David Shapiro', 'AI 评论'),
  ];

  const series = {
    TMP: [350_000, 500_000, 700_000, 950_000, 1_150_000, 1_350_000, 1_500_000, 1_650_000, 1_750_000],
    FIRESHIP: [200_000, 450_000, 900_000, 1_500_000, 2_000_000, 2_600_000, 3_100_000, 3_500_000, 3_800_000],
    WOLFE: [30_000, 50_000, 80_000, 120_000, 250_000, 550_000, 800_000, 1_050_000, 1_250_000],
    BERMAN: [5_000, 8_000, 15_000, 25_000, 70_000, 180_000, 350_000, 520_000, 650_000],
    AIE: [10_000, 15_000, 25_000, 40_000, 90_000, 250_000, 420_000, 550_000, 650_000],
    WES: [0, 0, 5_000, 10_000, 30_000, 120_000, 350_000, 600_000, 850_000],
    YANNIC: [20_000, 45_000, 100_000, 180_000, 230_000, 270_000, 310_000, 340_000, 360_000],
    KARPATHY: [20_000, 40_000, 70_000, 100_000, 160_000, 350_000, 650_000, 950_000, 1_200_000],
    MATT: [15_000, 25_000, 40_000, 80_000, 140_000, 250_000, 320_000, 400_000, 480_000],
    SHA: [5_000, 8_000, 12_000, 20_000, 50_000, 180_000, 300_000, 420_000, 500_000],
  };

  return {
    slug: 'ai-youtube-creators-race',
    title: 'AI 内容 YouTuber 订阅增长史',
    titleEn: 'AI YouTube Creator Subscriber Race',
    summary: '从 2018 到 2026，看 AI 内容创作者如何从论文讲解、机器学习教育，转向工具测评、模型新闻和开发者科普。',
    sourceLabel: 'YouTube 公开数据 / Social Blade / vidIQ / AI 频道榜单',
    sourceLabelEn: 'YouTube public data / Social Blade / vidIQ / AI channel rankings',
    sourceUrl: 'https://www.aidatahub.io/youtube',
    sourcePages: [
      {year: 2026, title: 'AI Data Hub: Best AI YouTube Channels', url: 'https://www.aidatahub.io/youtube'},
      {year: 2026, title: 'TubeScout AI and Technology Channels', url: 'https://tubescout.app/guides/best-ai-tech-youtube-channels'},
      {year: 2025, title: 'Skim AI: Top AI YouTubers', url: 'https://skimai.com/top-ten-ai-youtubers-you-need-to-follow-in-2025/'},
    ],
    sourceNote: '频道订阅为公开页面、第三方频道统计和历史里程碑估算。AI 垂类频道定义较宽，包含论文讲解、AI 新闻、AI 工具测评和开发者 AI 科普。',
    unit: '订阅者',
    unitShort: 'subs',
    valueKind: 'count',
    musicId: 'hd235-bright-life',
    themeId: 'tech-signal',
    startYear: 2018,
    endYear: 2026,
    entities,
    frames: buildFrames(years, entities, series),
    events: [
      event('gan-era', 2018, 'AI 论文视频时代', 'Two Minute Papers 把研究论文变成大众可看的短视频。', 'TMP', 'Two Minute Papers', 1, 350_000),
      event('gpt3', 2020, 'GPT-3 引发关注', '大模型能力开始把 AI 内容带出学术圈。'),
      event('chatgpt', 2022, 'ChatGPT 发布', 'AI 工具测评和模型新闻频道进入增长快车道。'),
      event('wolfe-rise', 2023, 'AI 工具频道爆发', 'Matt Wolfe、Matthew Berman、Wes Roth 等频道吃到生成式 AI 红利。', 'WOLFE', 'Matt Wolfe', 4, 550_000),
      event('karpathy-return', 2024, 'Karpathy 教程出圈', '深度学习和 LLM 教育内容重新获得大众关注。', 'KARPATHY', 'Andrej Karpathy', 4, 650_000),
      event('fireship-ai', 2025, '开发者科普继续领跑', 'Fireship 用高密度短视频承接 AI 开发者关注。', 'FIRESHIP', 'Fireship', 1, 3_500_000),
    ],
  };
}

function buildAiAgentGithub() {
  const years = Array.from({length: 8}, (_, index) => 2019 + index);
  const entities = [
    creator('LANG', 'LangChain', 'LLM 应用框架'),
    creator('AUTOGPT', 'AutoGPT', 'AI Agent'),
    creator('CREW', 'CrewAI', '多 Agent'),
    creator('DIFY', 'Dify', 'AI 应用平台'),
    creator('OPENWEB', 'Open WebUI', 'AI 应用'),
    creator('OLLAMA', 'Ollama', '本地模型'),
    creator('LLAMAI', 'LlamaIndex', 'RAG 框架'),
    creator('AIDER', 'Aider', 'AI 编程'),
    creator('OPENCLAW', 'OpenClaw', '个人 AI Agent'),
    creator('SWARM', 'OpenAI Swarm', '多 Agent 示例'),
    creator('AUTOGEN', 'AutoGen', '多 Agent'),
    creator('METAGPT', 'MetaGPT', '多 Agent'),
  ];

  const series = {
    LANG: [0, 0, 0, 5_000, 45_000, 75_000, 110_000, 125_000],
    AUTOGPT: [0, 0, 0, 0, 120_000, 160_000, 170_000, 175_000],
    CREW: [0, 0, 0, 0, 5_000, 25_000, 40_000, 55_000],
    DIFY: [0, 0, 0, 2_000, 15_000, 45_000, 85_000, 120_000],
    OPENWEB: [0, 0, 0, 0, 10_000, 45_000, 75_000, 95_000],
    OLLAMA: [0, 0, 0, 0, 35_000, 90_000, 130_000, 160_000],
    LLAMAI: [0, 0, 0, 3_000, 35_000, 55_000, 75_000, 90_000],
    AIDER: [0, 0, 0, 0, 6_000, 18_000, 35_000, 55_000],
    OPENCLAW: [0, 0, 0, 0, 0, 0, 9_000, 372_918],
    SWARM: [0, 0, 0, 0, 0, 20_000, 25_000, 28_000],
    AUTOGEN: [0, 0, 0, 0, 15_000, 35_000, 50_000, 62_000],
    METAGPT: [0, 0, 0, 0, 20_000, 38_000, 48_000, 55_000],
  };

  return {
    slug: 'ai-agent-github-stars-race',
    title: 'AI Agent 开源项目 Star 增长排名',
    titleEn: 'AI Agent GitHub Star Race',
    summary: '从 2019 到 2026，看 AI Agent、RAG、LLM 应用框架如何在 GitHub 上轮流爆发，直到 OpenClaw 把榜单彻底打穿。',
    sourceLabel: 'GitHub API / Star History / GH Archive / 项目公开报道',
    sourceLabelEn: 'GitHub API / Star History / GH Archive / public reports',
    sourceUrl: 'https://github.com/openclaw/openclaw',
    sourcePages: [
      {year: 2026, title: 'GitHub API: openclaw/openclaw', url: 'https://api.github.com/repos/openclaw/openclaw'},
      {year: 2026, title: 'OpenClaw public guide coverage', url: 'https://www.techradar.com/pro/what-is-openclaw'},
      {year: 2026, title: 'Star History', url: 'https://star-history.com/'},
    ],
    sourceNote: '当前 Star 使用 GitHub API/公开仓库页；历史节点按 Star History、GH Archive 趋势和项目报道估算。OpenClaw 为 2026 年突增项目，数值按 2026-05-19 GitHub API 快照写入。',
    unit: 'Stars',
    unitShort: 'stars',
    valueKind: 'count',
    musicId: 'hd235-bold-forward',
    themeId: 'tech-signal',
    startYear: 2019,
    endYear: 2026,
    entities,
    frames: buildFrames(years, entities, series),
    events: [
      event('langchain-start', 2022, 'LangChain 出现', 'LLM 应用开发开始出现统一框架。', 'LANG', 'LangChain', 1, 5_000),
      event('chatgpt-agent-boom', 2023, 'AutoGPT 引爆 Agent 热', 'AutoGPT 让“自主智能体”成为开发者社区热词。', 'AUTOGPT', 'AutoGPT', 1, 120_000),
      event('local-llm', 2024, '本地模型工具爆发', 'Ollama、Open WebUI 把本地 LLM 使用门槛大幅降低。', 'OLLAMA', 'Ollama', 2, 90_000),
      event('dify-rise', 2025, 'AI 应用平台上升', 'Dify、LlamaIndex、CrewAI 继续承接企业和个人开发者需求。', 'DIFY', 'Dify', 4, 85_000),
      event('openclaw-launch', 2025, 'OpenClaw 亮相', '个人 AI Agent 项目进入开发者视野。', 'OPENCLAW', 'OpenClaw', null, 9_000),
      event('openclaw-surge', 2026, 'OpenClaw 打穿榜单', 'OpenClaw 在数月内跃升到 37 万 Star 级别，超过传统 AI Agent 项目。', 'OPENCLAW', 'OpenClaw', 1, 372_918),
    ],
  };
}

function updateGithubStarsRace() {
  const filePath = join(DATA_DIR, 'github-stars-race.json');

  if (!existsSync(filePath)) {
    return;
  }

  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const openClawEntity = {
    code: 'OPENCLAW',
    name: 'OpenClaw',
    nameEn: 'OpenClaw',
    region: 'AI Agent',
    regionEn: 'AI Agent',
  };

  if (!data.entities.some((entity) => entity.code === openClawEntity.code)) {
    data.entities.push(openClawEntity);
  }

  for (const frame of data.frames) {
    frame.items = frame.items.filter((item) => item.code !== 'OPENCLAW');

    if (frame.year === 2025 || frame.year === 2026) {
      frame.items.push({
        ...openClawEntity,
        value: frame.year === 2025 ? 9_000 : 372_918,
        rank: 0,
        share: 0,
        rankDelta: 0,
      });
    }

    frame.items.sort((a, b) => b.value - a.value);
    const total = frame.items.reduce((sum, item) => sum + item.value, 0);
    frame.total = total;
    frame.items = frame.items.map((item, index) => ({
      ...item,
      rank: index + 1,
      share: total > 0 ? item.value / total : 0,
    }));
  }

  computeRankDeltas(data.frames);
  data.sourceNote = `${data.sourceNote ?? '历史 Star 数据基于公开数据整理。'} 2026 年加入 OpenClaw，当前值按 GitHub API 2026-05-19 快照。`;

  if (!data.events.some((item) => item.id === 'openclaw-surge')) {
    data.events.push(
      event('openclaw-launch', 2025, 'OpenClaw 亮相', 'OpenClaw 作为个人 AI Agent 项目进入开发者社区。', 'OPENCLAW', 'OpenClaw', null, 9_000),
      event('openclaw-surge', 2026, 'OpenClaw 冲到第一', 'OpenClaw 以 37 万 Star 级别超过 React、Vue、TensorFlow 等传统热门项目。', 'OPENCLAW', 'OpenClaw', 1, 372_918),
    );
  }

  writeJson('github-stars-race.json', data);
}

writeJson('global-youtube-channels-race.json', buildGlobalYoutubeChannels());
writeJson('bilibili-creators-race.json', buildBilibiliCreators());
writeJson('ai-youtube-creators-race.json', buildAiYoutubeCreators());
writeJson('ai-agent-github-stars-race.json', buildAiAgentGithub());
updateGithubStarsRace();
