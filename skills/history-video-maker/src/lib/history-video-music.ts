import type {HistoryRaceData} from '../types/history';

export const HISTORY_VIDEO_MUSIC_TRACKS = [
  {
    id: 'hd235-epic-inspire',
    label: '大气震撼史诗宣传励志',
    src: '/music/HD235大气震撼史诗宣传励志.mp3',
  },
  {
    id: 'hd235-bold-forward',
    label: '大气宣传勇往直前',
    src: '/music/HD235大气宣传勇往直前.mp3',
  },
  {
    id: 'hd235-violin-epic',
    label: '大气宣传小提琴史诗',
    src: '/music/HD235大气宣传小提琴史诗.mp3',
  },
  {
    id: 'hd235-riding-waves',
    label: '大气震撼宣传乘风破浪',
    src: '/music/HD235大气震撼宣传乘风破浪.mp3',
  },
  {
    id: 'hd235-uplifting-2',
    label: '大气震撼宣传鼓舞人心2',
    src: '/music/HD235大气震撼宣传鼓舞人心2.mp3',
  },
  {
    id: 'hd235-bright-life',
    label: '轻快愉悦美好生活',
    src: '/music/HD235轻快愉悦美好生活.mp3',
  },
] as const;

export const DEFAULT_HISTORY_VIDEO_MUSIC_ID = 'hd235-epic-inspire';

export type HistoryVideoMusicTrack = (typeof HISTORY_VIDEO_MUSIC_TRACKS)[number];
export type HistoryVideoMusicTrackId = HistoryVideoMusicTrack['id'];

const THEME_MUSIC_RULES: Array<{
  id: HistoryVideoMusicTrackId;
  keywords: string[];
}> = [
  {
    id: 'hd235-epic-inspire',
    keywords: ['战争', '军费', '军事', '军力', '冲突', 'war', 'military', 'defense', 'ukraine'],
  },
  {
    id: 'hd235-violin-epic',
    keywords: ['俄罗斯', '俄国', '苏联', 'russia', 'russian', 'soviet', 'moscow', 'ru'],
  },
  {
    id: 'hd235-riding-waves',
    keywords: ['贸易', '航运', '海运', '出口', '进口', 'trade', 'export', 'import', 'shipping'],
  },
  {
    id: 'hd235-bold-forward',
    keywords: ['gdp', '经济', '人口', '城市', 'market', 'cap', '市值', 'stock'],
  },
  {
    id: 'hd235-bright-life',
    keywords: ['生活', '时间', 'youtube', 'creator', 'github', 'ai', 'product', 'mau', '编程'],
  },
];

export function getHistoryVideoMusicTrack(id?: string | null) {
  const track =
    HISTORY_VIDEO_MUSIC_TRACKS.find((track) => track.id === id) ??
    HISTORY_VIDEO_MUSIC_TRACKS.find((track) => track.id === DEFAULT_HISTORY_VIDEO_MUSIC_ID) ??
    HISTORY_VIDEO_MUSIC_TRACKS[0];

  if (!track) {
    throw new Error('No history video music tracks configured');
  }

  return track;
}

export function resolveHistoryVideoMusicTrack(data: HistoryRaceData, overrideId?: string | null) {
  const overrideTrack = overrideId ? HISTORY_VIDEO_MUSIC_TRACKS.find((track) => track.id === overrideId) : null;

  if (overrideTrack) {
    return overrideTrack;
  }

  const primaryThemeText = getHistoryVideoPrimaryThemeText(data);
  const primaryRule = THEME_MUSIC_RULES.find(({keywords}) => keywords.some((keyword) => primaryThemeText.includes(keyword.toLowerCase())));

  if (primaryRule) {
    return getHistoryVideoMusicTrack(primaryRule.id);
  }

  const themeText = getHistoryVideoThemeText(data);
  const rule = THEME_MUSIC_RULES.find(({keywords}) => keywords.some((keyword) => themeText.includes(keyword.toLowerCase())));

  return getHistoryVideoMusicTrack(rule?.id);
}

export function toRemotionStaticFilePath(src: string) {
  return src.replace(/^\//, '');
}

function getHistoryVideoThemeText(data: HistoryRaceData) {
  return [
    data.slug,
    data.title,
    data.titleEn,
    data.summary,
    data.summaryEn,
    data.valueKind,
    data.unit,
    data.unitShort,
    ...data.entities.flatMap((entity) => [entity.code, entity.iso2, entity.name, entity.nameEn, entity.region]),
    ...data.events.flatMap((event) => [event.kind, event.title, event.titleEn, event.description, event.descriptionEn, event.entityName]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getHistoryVideoPrimaryThemeText(data: HistoryRaceData) {
  return [
    data.slug,
    data.title,
    data.titleEn,
    data.valueKind,
    data.unit,
    data.unitShort,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
