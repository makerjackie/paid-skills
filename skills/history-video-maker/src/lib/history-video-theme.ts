import type {HistoryRaceData} from '../types/history';

export type HistoryVideoTheme = {
  id: string;
  label: string;
  accent: string;
  accentSoft: string;
  accentDeep: string;
  background: string;
  paper: string;
  text: string;
  muted: string;
  motif: string;
};

const DEFAULT_THEME: HistoryVideoTheme = {
  id: 'atlas',
  label: 'World Atlas',
  accent: '#b35d45',
  accentSoft: 'rgba(179,93,69,0.11)',
  accentDeep: '#8a6b42',
  background: '#e9e2d6',
  paper: '#fffaf0',
  text: '#15130f',
  muted: '#50636b',
  motif: 'GLOBAL',
};

const THEMES: HistoryVideoTheme[] = [
  DEFAULT_THEME,
  {
    id: 'russian-north',
    label: 'Russian North',
    accent: '#9b2f2f',
    accentSoft: 'rgba(155,47,47,0.12)',
    accentDeep: '#2f5264',
    background: '#e8ece8',
    paper: '#fff7ec',
    text: '#171915',
    muted: '#4d6873',
    motif: 'RU',
  },
  {
    id: 'war-room',
    label: 'War Room',
    accent: '#c7342a',
    accentSoft: 'rgba(199,52,42,0.12)',
    accentDeep: '#5a4934',
    background: '#e6dfd0',
    paper: '#fff8e8',
    text: '#17130f',
    muted: '#59615d',
    motif: 'OPS',
  },
  {
    id: 'trade-route',
    label: 'Trade Route',
    accent: '#1f6f8b',
    accentSoft: 'rgba(31,111,139,0.12)',
    accentDeep: '#8a6546',
    background: '#e6e5d8',
    paper: '#fffaf0',
    text: '#141712',
    muted: '#50636b',
    motif: 'TRADE',
  },
  {
    id: 'tech-signal',
    label: 'Tech Signal',
    accent: '#4d6f5d',
    accentSoft: 'rgba(77,111,93,0.12)',
    accentDeep: '#3f6f9f',
    background: '#e7e5dc',
    paper: '#fffaf0',
    text: '#15130f',
    muted: '#52605b',
    motif: 'TECH',
  },
];

const THEME_RULES: Array<{id: string; keywords: string[]}> = [
  {
    id: 'war-room',
    keywords: ['战争', '军费', '军事', '军力', '冲突', 'war', 'military', 'defense', 'ukraine'],
  },
  {
    id: 'russian-north',
    keywords: ['俄罗斯', '俄国', '苏联', 'russia', 'russian', 'soviet', 'moscow', 'ru'],
  },
  {
    id: 'trade-route',
    keywords: ['贸易', '航运', '海运', '出口', '进口', 'trade', 'export', 'import', 'shipping', 'oil', 'energy'],
  },
  {
    id: 'tech-signal',
    keywords: ['github', 'youtube', 'creator', 'ai', 'product', 'mau', '编程', '开发者', '科技'],
  },
];

export function getHistoryVideoTheme(id?: string | null) {
  return THEMES.find((theme) => theme.id === id) ?? DEFAULT_THEME;
}

export function resolveHistoryVideoTheme(data: HistoryRaceData, overrideId?: string | null) {
  if (overrideId) {
    return getHistoryVideoTheme(overrideId);
  }

  const primaryThemeText = getHistoryVideoPrimaryThemeText(data);
  const primaryRule = THEME_RULES.find(({keywords}) => keywords.some((keyword) => primaryThemeText.includes(keyword.toLowerCase())));

  if (primaryRule) {
    return getHistoryVideoTheme(primaryRule.id);
  }

  const themeText = getHistoryVideoThemeText(data);
  const rule = THEME_RULES.find(({keywords}) => keywords.some((keyword) => themeText.includes(keyword.toLowerCase())));

  return getHistoryVideoTheme(rule?.id);
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
