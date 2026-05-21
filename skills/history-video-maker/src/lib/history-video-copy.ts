import type {HistoryRaceData} from '../types/history';

export type HistoryVideoCopy = {
  platformTitle: string;
  coverKicker: string;
  coverHeadline: string;
  coverSubline: string;
  coverBadge: string;
  coverCompareRank?: number;
  hook: string;
  intro: string;
  insight: string;
  sourceDisclosure?: string;
  showInsightPanel?: boolean;
  showSourcePanel?: boolean;
  cta: string;
  siteLine: string;
  sourceLine: string;
  closingTitle?: string;
  closingBody?: string;
};

export function getHistoryVideoPanelFlags(
  copy: Pick<HistoryVideoCopy, 'insight' | 'sourceDisclosure' | 'showInsightPanel' | 'showSourcePanel'>,
) {
  return {
    showInsightPanel: copy.showInsightPanel !== false && Boolean(copy.insight),
    showSourcePanel: copy.showSourcePanel !== false && Boolean(copy.sourceDisclosure),
  };
}

const SITE_LINE =
  '「世界的形状 Shape of World」把动态排名、时间轴和事件节点，做成可以探索的真实世界历史。';

const SITE_CTA =
  '像逛博物馆、翻地图、玩游戏一样，打开一个主题，看看世界原来是怎么动的。';
const COVER_HEADLINE_MAX_LINES = 2;
const COVER_HEADLINE_LINE_MAX_CHARS = 11;
const RACE_HOOK_MAX_CHARS = 22;

const COPY_OVERRIDES: Record<string, Partial<HistoryVideoCopy>> = {
  'southeast-asia-gdp-race': {
    platformTitle: '东南亚 GDP 排名 60 多年怎么变？印度尼西亚一直这么大吗？',
    coverKicker: '1960 → 2024 · 东南亚 GDP',
    coverHeadline: '东南亚经济排名\n谁在重新洗牌？',
    coverSubline: '印度尼西亚、新加坡、越南、菲律宾的长期变化',
    coverBadge: '60 多年浓缩成 90 秒',
    coverCompareRank: 2,
    hook: '东南亚 GDP 排名，60 多年里怎么变化？',
    intro: '从 1960 到 2024，看东南亚主要经济体的体量变化。',
    insight:
      '这条线索背后，是资源、制造业、港口贸易、人口规模和全球供应链位置的长期变化。',
    sourceDisclosure:
      '示例数据：按 World Bank 现价美元 GDP 指标量级整理，并用插值补足展示年份。\n这个视频用于展示 Skill 的生成效果。',
  },
  'us-stock-market-cap-race': {
    platformTitle: '美国最大公司30年换了几次王？最后一个太离谱',
    coverKicker: '1996 → 2026 · 美国公司市值',
    coverHeadline: '美国第一巨头\n彻底换人了',
    coverSubline: '从通用电气到英伟达，30 年资本重心迁移',
    coverBadge: 'AI 把榜首改写了',
    hook: '美国最大公司，30 年后完全换了一批',
    intro: '从 1996 年的通用电气、可口可乐、埃克森，到 2026 年的英伟达、Alphabet、苹果和微软。',
    insight:
      '这张榜单像一张美国经济重心迁移图：工业、能源和消费巨头退到后面，平台、软件、云计算和 AI 芯片站到舞台中央。',
    cta: '去 shapeof.world 拖动时间线，看完整互动数据。',
  },
  'china-stock-market-cap-race': {
    platformTitle: '中国市值第一的26年：移动、石油、银行、互联网轮流坐上王座',
    coverKicker: '2000 → 2026 · 中国公司市值',
    coverHeadline: '中国市值第一\n换过哪些时代？',
    coverSubline: '移动、石油、银行、互联网轮流登顶',
    coverBadge: '26 年产业王座',
    hook: '中国公司市值第一，26 年里换过哪些时代？',
    intro: '从 2000 到 2026，看中国公司市值榜的王座更替。',
    insight:
      '这条市值线索背后，是通信、能源、金融、消费互联网和新能源产业的接力。',
  },
  'global-billionaires-race': {
    platformTitle: '世界首富这30年怎么换人的？财富榜其实是时代地图',
    coverKicker: '1987 → 2026 · 全球富豪',
    coverHeadline: '世界首富\n换人有多快？',
    coverSubline: '零售、科技、奢侈品、电动车，财富中心不断改道',
    coverBadge: '首富榜就是时代地图',
    hook: '世界首富这 30 年，是怎么换人的？',
  },
  'nev-sales-race': {
    platformTitle: '新能源车销量榜：比亚迪怎么把差距拉这么大？',
    coverKicker: '2011 → 2025 · 新能源车销量',
    coverHeadline: '新能源车销量\n差距有多夸张？',
    coverSubline: '从 1500 辆到 460 万辆，产业加速比想象快得多',
    coverBadge: '电动车战局重排',
    hook: '新能源车销量榜，差距是怎么被拉开的？',
  },
  'gdp-race': {
    platformTitle: '世界GDP排名正在重新洗牌，一眼看完60多年变化',
    coverKicker: '1960 → 2024 · 世界 GDP',
    coverHeadline: '世界经济排名\n正在重新洗牌',
    coverSubline: '把时间拉长，熟悉的强弱关系会变得很陌生',
    coverBadge: '60 多年浓缩成 90 秒',
    coverCompareRank: 2,
    hook: '世界 GDP 排名，60 多年里怎么重新洗牌？',
  },
  'world-population-race': {
    platformTitle: '世界人口第一真的换人了：印度超过中国那一刻意味着什么？',
    coverKicker: '1960 → 2024 · 世界人口',
    coverHeadline: '世界人口第一\n真的换人了',
    coverSubline: '中国到印度，64 年拐点',
    coverBadge: '64 年人口史',
    hook: '世界人口第一，怎么从中国移到印度？',
    intro: '从 1960 到 2024，人口大国排位被重新改写。',
    insight:
      '人口榜不是静态规模，而是出生率、城市化和代际结构的长期回声。',
  },
  'empire-area-race': {
    platformTitle: '谁才是历史上最大的帝国？2500年版图王座不断易主',
    coverKicker: '公元前 500 → 2024 · 帝国版图',
    coverHeadline: '谁才是\n历史上最大的帝国？',
    coverSubline: '波斯、罗马、蒙古都曾登顶',
    coverBadge: '2500 年版图王座',
    hook: '谁才是历史上最大的帝国？2500 年里不断易主',
    intro: '从公元前 500 年到今天，看最大帝国与国家版图轮换。',
    insight:
      '版图扩张从来不只是面积，它背后是军事、交通、财政和治理半径。',
  },
  'city-population-race': {
    platformTitle: '世界最大城市为什么一路向东？1000年城市王座迁移史',
    coverKicker: '1000 → 2025 · 世界城市人口',
    coverHeadline: '世界最大城市\n为什么一路向东？',
    coverSubline: '从开封、伦敦到东京与德里',
    coverBadge: '1000 年城市史',
    hook: '世界最大城市，1000 年里为什么一路向东？',
    intro: '从公元 1000 年到今天，看世界最大城市排位迁移。',
    insight:
      '城市榜是一张文明重心地图，贸易、工业、制造业和人口流动都写在里面。',
  },
  'energy-consumption-race': {
    platformTitle: '谁在消耗世界能源？第一名从美国变成了中国',
    coverKicker: '1965 → 2024 · 能源消费',
    coverHeadline: '谁在消耗\n世界能源？',
    coverSubline: '美国到中国，工业化改写格局',
    coverBadge: '60 年能源史',
    hook: '谁在消耗世界能源？第一名从美国变成了中国',
    intro: '从 1965 到 2024，看能源消费大国排位变化。',
    insight:
      '能源消费记录的是工业化、城市化和全球制造链的位置变化。',
  },
  'steel-production-race': {
    platformTitle: '钢铁产量第一怎么变成中国？这是一条工业化迁移线',
    coverKicker: '1967 → 2024 · 钢铁产量',
    coverHeadline: '钢铁产量第一\n怎么变成中国？',
    coverSubline: '美国、苏联、日本之后的工业迁移',
    coverBadge: '57 年工业史',
    hook: '钢铁产量第一，怎么从美国、日本变成中国？',
    intro: '从 1967 到 2024，看钢铁产量排位如何改写。',
    insight:
      '钢铁榜像一张工业化进度条，基建、制造业和城市扩张都会留下痕迹。',
  },
  'human-time-use-race': {
    platformTitle: '人一生中不同活动的时间占比：1岁到100岁的24小时分配',
    coverKicker: '1岁 → 100岁 · 一天24小时',
    coverHeadline: '一生中不同活动\n时间占比',
    coverSubline: '睡觉、上学、工作、刷手机和陪伴',
    coverBadge: '公开统计 + AI 估算',
    hook: '人一生中不同活动的时间占比',
    intro: '从 1 岁到 100 岁，看每天 24 小时在睡眠、学习、工作、刷手机和陪伴之间怎么分配。',
    insight:
      '一岁时睡眠占大头，成年后工作和通勤抬升，晚年休闲与陪伴回到前排。',
    sourceDisclosure:
      '公开统计：BLS ATUS、CDC 睡眠建议、Pew / Common Sense 青少年媒体使用。\nAI 估算：逐岁曲线、刷手机/陪伴/通勤等细分类目。\n仅供娱乐和参考。',
    showInsightPanel: false,
    showSourcePanel: false,
    cta: '去 shapeof.world 拖动年龄线，自己看看每一岁的一天。',
    sourceLine: '数据：公开统计 + AI 估算，仅供娱乐参考',
    closingTitle: '祝大家人生美满，幸福开心',
    closingBody: '数据参考 BLS ATUS、CDC、Pew、Common Sense；逐岁细分由 AI 估算，仅供娱乐参考。祝大家玩得开心。',
  },
  'jiangsu-gdp-race': {
    platformTitle: '江苏13市GDP排位赛：苏州如何超越南京无锡，46年稳坐第一？',
    coverKicker: '1978 → 2024 · 江苏城市 GDP',
    coverHeadline: '江苏城市GDP\n苏州一骑绝尘',
    coverSubline: '苏州称霸46年，镇江滑落，5城跻身万亿',
    coverBadge: '改革开放 46 年浓缩',
    coverCompareRank: 2,
    hook: '江苏13市GDP排名，46年里从三强争霸变成苏州一骑绝尘',
    intro: '从1978年改革开放到2024年，看江苏13市经济排位如何被产业变迁和区域政策改写。',
    insight:
      '苏州从乡镇工业起步，中新合作工业园让它稳坐江苏第一；南京无锡紧随其后，南通和常州在2020年代相继突破万亿。曾经位居中游的镇江不断滑落，盐城和扬州反复争夺第八。经济版图背后，是苏南模式、沿江开发和长三角一体化的时代印记。',
  },
  'russia-trade-race': {
    platformTitle: '俄罗斯贸易版图重写：从欧洲全面转向中国和印度',
    coverKicker: '2000 → 2025 · 俄罗斯贸易伙伴',
    coverHeadline: '俄罗斯贸易版图\n全面东转',
    coverSubline: '从德国、荷兰到中国、印度，一场地缘剧变',
    coverBadge: '25 年贸易版图重写',
    hook: '俄罗斯最大贸易伙伴，25 年里从德国变成了中国',
    intro: '从 2000 年到 2025 年，看俄罗斯主要贸易伙伴如何被地缘政治改写。',
    insight:
      '2022 年之前，德国和荷兰是俄罗斯最大的贸易伙伴。战争与制裁之后，欧洲全面撤退，中国和印度接盘——一场由硬地缘力量推动的全球贸易版图大洗牌。',
    sourceDisclosure:
      '数据为估算序列，基于 IMF DOTS、俄罗斯联邦海关署及各贸易伙伴国公开数据整理。\n部分年份数据为趋势估计，具体数值可能存在偏差，排名趋势可靠。',
  },
  'global-military-spending-race': {
    platformTitle: '全球军费排名：俄乌战争如何引爆俄罗斯和乌克兰军费开支',
    coverKicker: '2000 → 2025 · 全球军费',
    coverHeadline: '全球军费\n重新洗牌',
    coverSubline: '俄乌战争引爆俄罗斯与乌克兰军费飙升',
    coverBadge: '26 年军费史',
    hook: '全球军费排名，俄乌战争如何改写一切？',
    intro: '从 2000 年到 2025 年，看全球军费排名在战争推动下的剧烈变化。',
    insight:
      '俄乌战争让俄罗斯军费从 2021 年的 660 亿美元飙升至 1900 亿，乌克兰从 68 亿暴增至 840 亿。战争改写的不只是地图，还有每个国家的钱袋子。全球军费在 2025 年突破 2.5 万亿美元，创历史新高。',
    sourceDisclosure:
      '数据基于 SIPRI Military Expenditure Database 现价美元序列。\n2000-2024 年为 SIPRI 官方数据；2025 年为 SIPRI 初步估计。乌克兰 2000-2019 年数据为合理估值。',
  },
  'china-trade-race': {
    platformTitle: '中国 40 年贸易伙伴排名：日本交棒美国，越韩俄后来居上',
    coverKicker: '1978 → 2025 · 中国主要贸易伙伴',
    coverHeadline: '中国最大贸易伙伴\n40年换了谁？',
    coverSubline: '从日本称霸到美国登顶，越南韩国俄罗斯改写排名',
    coverBadge: '改革开放 47 年浓缩',
    coverCompareRank: 2,
    hook: '中国最大贸易伙伴，40 年里从日本变成美国，越韩俄一路追赶',
    intro: '从 1978 年改革开放到 2025 年，看中国与主要贸易伙伴的进出口排名更替。',
    insight:
      '从日本称霸到美国登顶，再到韩越崛起、俄罗斯冲入前五——贸易排名背后是全球化格局、供应链转移和地缘政治的长期演变。',
    sourceDisclosure:
      '数据为中国进出口总额（出口+进口）估算序列，基于中国海关总署、IMF DOTS 及历年统计年鉴公开数据整理。\n1978-1991 年部分数据为趋势估计，仅供参考。',
  },
  'grandma-letter-nanyang-gdp': {
    platformTitle: '《给阿嬷的情书》· 木生为什么要下南洋？—— 东南亚人均GDP排位赛（1948-2018）',
    coverKicker: '1948 → 2018 · 人均GDP',
    coverHeadline: '《给阿嬷的情书》\n木生为什么要下南洋？',
    coverSubline: '七十年后，中国跃升至第二。这就是下南洋的理由。',
    coverBadge: '71 年经济逆袭史',
    coverCompareRank: 2,
    hook: '东南亚人均GDP排位赛，中国从最穷到第二',
    intro: '1948年，潮汕青年郑木生挤上红头船漂向大海。那一年，中国是这片海域最穷的国家，人均GDP不足马来西亚的四分之一。',
    insight:
      '七十年间，中国的人均GDP从$45飙升至$10,086，增长224倍。这场逆袭背后，是工业化、改革开放和全球化的力量。而那些侨批里的情义——咸猪肉、自行车、布料——无法用数字丈量。',
    sourceDisclosure:
      '1948-1959年数据基于AI估算补全（反向外推+插值）。越南1985年前、印尼1967年前为AI估算。\n1960年以后源自世界银行WDI（NY.GDP.PCAP.CD）及中国国家统计局。',
    showInsightPanel: false,
    showSourcePanel: false,
  },
  'programming-youtubers-race': {
    platformTitle: 'YouTube 编程类频道订阅排名：AI 时代谁在爆发？',
    coverKicker: '2014 → 2026 · YouTube 编程类频道',
    coverHeadline: '编程 YouTuber\n谁在爆发？',
    coverSubline: 'Tom Scott 到 Fireship，编程知识消费方式的演变',
    coverBadge: '12 年订阅排名',
    hook: '编程类 YouTuber，12 年里谁增长最快？',
    intro: '从 2014 到 2026，编程创作者如何在 YouTube 上重新洗牌？',
    insight: '从长篇教育到速食知识，编程内容在 YouTube 上发生了根本变化。',
    cta: '去 shapeof.world 看更完整的互动数据。',
  },
  'chinese-creators-youtube-race': {
    platformTitle: '华语自媒体 YouTube 订阅排名：十年王座更替，短视频账号追上来了',
    coverKicker: '2017 → 2026 · 华语自媒体 YouTube 订阅排名',
    coverHeadline: '华语创作者\n十年王座更替',
    coverSubline: '李子柒、办公室小野、滇西小哥之后，短视频账号追上来了',
    coverBadge: '10 年订阅排名',
    hook: '华语创作者十年王座更替',
    intro: '从李子柒到短视频新账号，海外订阅榜一路改写。',
    insight: '早期是美食、乡村生活和知识故事占据前排；2022 年后，语言门槛更低、节奏更快的短视频账号开始大规模追上来。',
    sourceDisclosure:
      '数据：公开频道页与订阅榜；历史序列为可视化估算',
    sourceLine: '数据：公开频道页与订阅榜；历史序列为可视化估算',
    cta: '看华语创作者的海外订阅榜如何改写。',
  },
  'ai-products-mau-race': {
    platformTitle: 'AI 产品月活排名：ChatGPT 一骑绝尘，谁能追得上？',
    coverKicker: '2022 → 2026 · AI 产品月活用户',
    coverHeadline: 'AI 产品月活\n谁在领跑？',
    coverSubline: 'ChatGPT、Gemini、Claude 的 AI 用户争夺战',
    coverBadge: 'AI 时代月活排名',
    hook: 'ChatGPT 两个月达到 1 亿月活，这个纪录至今无人能破。',
    intro: '从 2022 到 2026，AI 产品月活用户排名发生了哪些剧变？ChatGPT 一骑绝尘，Gemini 和 Grok 奋力追赶。',
    insight: 'ChatGPT 用 2 个月达到 1 亿 MAU，成为历史上增长最快的消费级应用；Gemini 借助 Google 生态迅速崛起。',
    cta: '去 shapeof.world 看更完整的互动数据。',
  },
  'github-stars-race': {
    platformTitle: 'GitHub Star 排名：OpenClaw 怎么突然冲到第一？',
    coverKicker: '2014 → 2026 · GitHub Stars',
    coverHeadline: 'GitHub Stars\nOpenClaw 冲顶',
    coverSubline: 'React、Vue、TensorFlow 之后，AI Agent 改写榜单',
    coverBadge: '2014-2026 · 13 年 Star 排名',
    hook: '13 年里，GitHub Star 榜从前端框架，变成了 AI Agent 战场。',
    intro: '从 2014 到 2026，React、Vue、TensorFlow、VS Code 到 OpenClaw，GitHub Star 排名经历了多次反转。',
    insight: 'Star 不是用户数，但它记录了开发者注意力的迁移：前端框架、机器学习框架、云原生工具之后，AI Agent 开始把榜单推向新的极端。',
    cta: '去 shapeof.world 看更完整的互动数据。',
  },
  'global-youtube-channels-race': {
    platformTitle: '全球 YouTube 订阅排名：MrBeast 怎么从个人创作者打穿全站？',
    coverKicker: '2012 → 2026 · 全球 YouTube 订阅',
    coverHeadline: 'YouTube 王座\n又换人了',
    coverSubline: 'PewDiePie、T-Series、MrBeast 的平台权力迁移',
    coverBadge: '14 年订阅王座',
    hook: '全球 YouTube 第一，怎么从 PewDiePie 变成 T-Series，又变成 MrBeast？',
    intro: '从 2012 到 2026，看 YouTube 订阅榜如何从个人创作者，转向机构媒体，再被 MrBeast 改写。',
    insight: '这条榜单不是单纯的粉丝数，它同时记录了平台内容形态的变化：游戏个人创作者、印度音乐厂牌、儿童内容、超级制作型创作者轮流站上中心。',
    sourceDisclosure: '逐年订阅数由公开榜单、频道里程碑、Social Blade 和频道页面快照估算整理；2019 年后 YouTube 公开订阅数缩写会降低精度。',
    cta: '去 shapeof.world 看更完整的互动数据。',
  },
  'bilibili-creators-race': {
    platformTitle: 'B站 UP 主粉丝排名：一哥怎么从老番茄变成罗翔？',
    coverKicker: '2016 → 2026 · B站 UP 主粉丝',
    coverHeadline: 'B站一哥\n怎么换人了？',
    coverSubline: '老番茄、罗翔、何同学背后的内容品类迁移',
    coverBadge: '10 年粉丝王座',
    hook: 'B站头部 UP 主粉丝排名，为什么从游戏转向知识和科技？',
    intro: '从 2016 到 2026，看 B站头部 UP 主粉丝量如何从游戏、动画，转向知识、科技、影视和泛娱乐混战。',
    insight: 'B站的头部创作者变化，背后是平台从二次元和游戏社区，扩展为知识、科技、商业、影视和泛娱乐内容平台的过程。',
    sourceDisclosure: 'B站没有公开历史粉丝 API；逐年数据按公开里程碑、历史榜单视频、页面快照和当前公开粉丝量估算，排名趋势优先于单点精确值。',
    cta: '去 shapeof.world 看更完整的互动数据。',
  },
  'ai-youtube-creators-race': {
    platformTitle: 'AI 内容 YouTuber 订阅增长：ChatGPT 之后谁吃到最大红利？',
    coverKicker: '2018 → 2026 · AI 内容 YouTuber',
    coverHeadline: 'AI 内容频道\n谁吃到红利？',
    coverSubline: '论文讲解、工具测评、模型新闻一起爆发',
    coverBadge: '生成式 AI 订阅战',
    hook: 'AI 内容 YouTuber，ChatGPT 之后谁增长最快？',
    intro: '从 2018 到 2026，看 AI 内容创作者如何从论文讲解，转向工具测评、模型新闻和开发者科普。',
    insight: 'AI 内容的增长不是一条线：Two Minute Papers 代表研究传播，Fireship 代表开发者科普，Matt Wolfe 和 Matthew Berman 则抓住了生成式 AI 工具浪潮。',
    sourceDisclosure: '频道订阅数来自公开页面、Social Blade/vidIQ 类第三方统计和 AI 频道榜单估算；AI 垂类定义包含论文、工具、新闻和开发者科普。',
    cta: '去 shapeof.world 看更完整的互动数据。',
  },
  'ai-agent-github-stars-race': {
    platformTitle: 'AI Agent 开源项目 Star 排名：OpenClaw 怎么打穿 GitHub？',
    coverKicker: '2019 → 2026 · AI Agent GitHub Stars',
    coverHeadline: 'AI Agent 开源\nOpenClaw 冲顶',
    coverSubline: 'AutoGPT、LangChain、Dify 之后，榜单被重新改写',
    coverBadge: 'Agent 项目 Star 战',
    hook: 'AI Agent 开源项目，为什么最后被 OpenClaw 打穿？',
    intro: '从 2019 到 2026，看 AI Agent、RAG、LLM 应用框架如何在 GitHub 上轮流爆发。',
    insight: '这张榜单最适合看开发者注意力：AutoGPT 引爆概念，LangChain 和 Dify 承接应用开发，Ollama 和 Open WebUI 推动本地模型，OpenClaw 则把个人 Agent 叙事推到极端。',
    sourceDisclosure: '当前 Star 来自 GitHub API/公开仓库页；历史节点按 Star History、GH Archive 趋势和项目报道估算。Star 是开发者注意力指标，不等同于真实用户或安装量。',
    cta: '去 shapeof.world 看更完整的互动数据。',
  },
  'guangdong-city-gdp-race': {
    platformTitle: '广东经济版图 40 年：珠三角赢家通吃，非珠三角城市掉队',
    coverKicker: '1978 → 2025 · 广东城市 GDP',
    coverHeadline: '广东经济版图\n珠三角赢家通吃',
    coverSubline: '广深佛莞珠领跑，非珠三角差距拉大',
    coverBadge: '47 年经济洗牌',
    coverCompareRank: 2,
    hook: '广东城市排位战，珠三角如何赢家通吃',
    intro: '从 1978 年到 2025 年，看广东城市经济版图如何被产业革命和区域政策改写。',
    insight:
      '1978 年广州一城就占了广东近一半的 GDP。1980 年深圳 GDP 只有 3 亿，排第 9。2017 年，深圳反超广州登顶。到 2025 年，深圳 GDP 接近 4 万亿，是广州的 1.2 倍。佛山稳居第三，东莞守在第四——珠三角四城撑起广东的脊梁。曾经的珠西重镇江门从第 2 滑到第 7，非珠三角城市的增长差距持续拉大。',
  },
  'eggs-per-hour-race': {
    platformTitle: '工作1小时各国能买几个鸡蛋？75年购买力排名变化 — AI 估算',
    coverKicker: '1950 → 2024 · 工作1小时能买几个蛋？',
    coverHeadline: '工作1小时\n各国能买几个鸡蛋？',
    coverSubline: '德国最短工时换最多鸡蛋，中国从1个涨到30个',
    coverBadge: 'AI 估算 · 75 年购买力变迁',
    hook: '工作1小时，各国能买几个蛋？',
    intro: '以鸡蛋为标尺，看各国工作1小时的购买力如何随着经济发展而变化。',
    insight:
      '德国人用最短的工作时间（1335小时/年）换来了最高的鸡蛋购买力。中国的鸡蛋从1950年的1个/小时涨到2024年的30个/小时。韩国的变化最戏剧性：从1950年的1个到2024年的89个。',
    sourceDisclosure:
      '⚠️ 数据为 AI 估算，仅供娱乐参考，不构成经济分析。\n\n方法：基于Maddison Project人均GDP（购买力平价）、OWID年均工作小时数计算。\n\n工资调整：按各国劳动报酬占GDP比例将人均GDP折算为估算工资（发达经济体≈52%、中国≈48%、印度≈40%），使数字更贴近实际收入。\n\n鸡蛋价格：统一使用$0.15/个。鸡蛋是全球性基础商品，2011年各国购买力平价价格差异极小（美国$0.15 vs 中国$0.14）。\n\n参考数据源：Maddison Project Database 2020、World Bank WDI、OWID / Penn World Table、OECD/ILO labor share estimates。',
    showInsightPanel: true,
    showSourcePanel: true,
    cta: '去 shapeof.world 用鸡蛋标尺探索各国的实际购买力。',
    sourceLine: 'AI估算 · 基于Maddison + World Bank + OWID数据，仅供娱乐参考',
  },
};

export function getHistoryVideoCopy(data: HistoryRaceData): HistoryVideoCopy {
  const override = COPY_OVERRIDES[data.slug] ?? {};
  const defaultCover = buildDefaultCoverCopy(data);
  const sourceLine = `原始数据：${data.sourceLabel}`;

  return {
    platformTitle: override.platformTitle ?? defaultCover.platformTitle,
    coverKicker: override.coverKicker ?? defaultCover.coverKicker,
    coverHeadline: limitCoverHeadline(override.coverHeadline ?? defaultCover.coverHeadline),
    coverSubline: override.coverSubline ?? defaultCover.coverSubline,
    coverBadge: override.coverBadge ?? defaultCover.coverBadge,
    coverCompareRank: override.coverCompareRank,
    hook: limitRaceHook(override.hook ?? buildDefaultHook(data)),
    intro: override.intro ?? buildDefaultIntro(data),
    insight: override.insight ?? buildDefaultInsight(data),
    sourceDisclosure: override.sourceDisclosure,
    showInsightPanel: override.showInsightPanel,
    showSourcePanel: override.showSourcePanel,
    cta: override.cta ?? '去 shapeof.world 打开互动数据，拖动时间线继续探索。',
    siteLine: override.siteLine ?? SITE_LINE,
    sourceLine: override.sourceLine ?? sourceLine,
    closingTitle: override.closingTitle,
    closingBody: override.closingBody,
  };
}

function buildDefaultCoverCopy(data: HistoryRaceData) {
  const firstLeader = data.frames[0]?.items[0]?.name;
  const lastLeader = data.frames[data.frames.length - 1]?.items[0]?.name;
  const hasChanged = firstLeader && lastLeader && firstLeader !== lastLeader;
  const coverHeadline = hasChanged ? `${lastLeader}\n怎么冲到第一？` : `${data.title}\n谁守住第一？`;

  return {
    platformTitle: hasChanged
      ? `${data.title}：${formatYear(data.startYear)}到${formatYear(data.endYear)}的王座更替`
      : `${data.title}：谁守住了第一？`,
    coverKicker: `${formatYear(data.startYear)} → ${formatYear(data.endYear)} · 动态排名`,
    coverHeadline,
    coverSubline: hasChanged
      ? `从${firstLeader}到${lastLeader}，时代正在改写`
      : '把时间轴拉长，看谁守住王座',
    coverBadge: '历史浓缩成 90 秒',
  };
}

function buildDefaultIntro(data: HistoryRaceData) {
  return compactSentence(
    data.summary ?? `从 ${formatYear(data.startYear)} 到 ${formatYear(data.endYear)}，看排名如何变化。`,
    56,
  );
}

function buildDefaultHook(data: HistoryRaceData) {
  return normalizeRaceTitle(data.title);
}

function buildDefaultInsight(data: HistoryRaceData) {
  const firstLeader = data.frames[0]?.items[0]?.name;
  const lastLeader = data.frames[data.frames.length - 1]?.items[0]?.name;

  if (firstLeader && lastLeader && firstLeader !== lastLeader) {
    return `一开始站在榜首的是${firstLeader}，最后变成了${lastLeader}。排名变化背后，是人口、产业、技术、资源和时代节奏的变化。`;
  }

  return '排名不是静止的数字，而是一段长期变化的轨迹。把时间拉长以后，很多熟悉的世界会变得陌生起来。';
}

export function buildHistoryVideoMarkdown(data: HistoryRaceData) {
  const copy = getHistoryVideoCopy(data);
  const interactiveUrl = `https://shapeof.world/history/${data.slug}`;
  const sourcePages = data.sourcePages
    ?.slice(0, 8)
    .map((page) => `- ${page.title}: ${page.url}`)
    .join('\n');

  const lines = [
    `## ${data.slug}`,
    '',
    `发布标题：${copy.platformTitle}`,
    '',
    '封面文案：',
    copy.coverKicker,
    copy.coverHeadline.replace(/\n/g, ' / '),
    copy.coverSubline,
    copy.coverBadge,
    '',
    `视频内标题：${copy.hook}`,
    '',
    '短视频描述：',
    copy.intro,
  ];

  if (copy.insight) {
    lines.push(copy.insight);
  }

  if (copy.sourceDisclosure) {
    lines.push(`数据说明：${copy.sourceDisclosure}`);
  }

  lines.push(
    '',
    '站点介绍：',
    copy.siteLine,
    copy.cta,
    '',
    `数据互动地址：${interactiveUrl}`,
    '',
    `原始数据来源：${data.sourceLabel}`,
    data.sourceUrl,
  );

  if (sourcePages) {
    lines.push('', '参考页面：', sourcePages);
  }

  return lines.join('\n');
}

function formatYear(year: number) {
  return year < 0 ? `公元前 ${Math.abs(year)}` : String(year);
}

function compactSentence(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const firstSentence = normalized.split(/[。！？]/)[0];

  if (firstSentence.length > 0 && firstSentence.length <= maxLength) {
    return `${firstSentence}。`;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1))}…`;
}

function limitCoverHeadline(text: string) {
  const lines = text
    .split(/\n+/)
    .map((line) => normalizeTitleText(line))
    .filter(Boolean);
  const headlineLines = lines.length > 1 ? lines : splitHeadlineLine(lines[0] ?? '');

  return headlineLines
    .slice(0, COVER_HEADLINE_MAX_LINES)
    .map((line) => compactTitleLine(line, COVER_HEADLINE_LINE_MAX_CHARS))
    .join('\n');
}

function splitHeadlineLine(text: string) {
  const normalized = normalizeTitleText(text);

  if (normalized.length <= COVER_HEADLINE_LINE_MAX_CHARS) {
    return [normalized];
  }

  const punctuated = normalized
    .split(/[，,。；;：:？?！!]/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (punctuated.length >= 2) {
    return punctuated;
  }

  return [
    normalized.slice(0, COVER_HEADLINE_LINE_MAX_CHARS),
    normalized.slice(COVER_HEADLINE_LINE_MAX_CHARS),
  ];
}

function limitRaceHook(text: string) {
  const normalized = normalizeTitleText(text);

  if (normalized.length <= RACE_HOOK_MAX_CHARS) {
    return normalized;
  }

  const firstClause = normalized.split(/[，,。；;：:？?！!]/)[0]?.trim();

  if (firstClause && firstClause.length >= 6) {
    return compactTitleLine(firstClause, RACE_HOOK_MAX_CHARS);
  }

  return compactTitleLine(normalized, RACE_HOOK_MAX_CHARS);
}

function normalizeRaceTitle(title: string) {
  return normalizeTitleText(title)
    .replace(/排位赛/g, '排名')
    .replace(/动态排名/g, '排名')
    .replace(/\s+Race$/i, '')
    .trim();
}

function compactTitleLine(text: string, maxLength: number) {
  const normalized = normalizeTitleText(text);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function normalizeTitleText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}
