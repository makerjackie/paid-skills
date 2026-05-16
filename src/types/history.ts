export type HistoryRaceValueKind = 'currency-usd' | 'currency-cny' | 'people' | 'area-sqkm' | 'energy-ej' | 'oil-mbbl-d' | 'steel-mt' | 'military-spending' | 'military-personnel' | 'hours-per-day' | 'count';

export type HistoryRaceEntity = {
  code: string;
  iso2: string;
  name: string;
  nameEn: string;
  region: string;
};

export type HistoryRaceItem = HistoryRaceEntity & {
  value?: number;
  gdp?: number;
  rank: number;
  share: number;
  rankDelta: number;
};

export type HistoryRaceFrame = {
  year: number;
  total: number;
  items: HistoryRaceItem[];
};

export type HistoryRaceEvent = {
  id: string;
  year: number;
  entityCode: string | null;
  kind: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  entityName: string | null;
  rank: number | null;
  value?: number | null;
  gdp?: number | null;
};

export type HistoryRaceSourcePage = {
  year: number;
  title: string;
  url: string;
};

export type HistoryRaceData = {
  slug: string;
  title: string;
  titleEn: string;
  summary?: string;
  summaryEn?: string;
  sourceLabel: string;
  sourceLabelEn: string;
  sourceUrl: string;
  sourceNote?: string;
  sourceNoteEn?: string;
  sourcePages?: HistoryRaceSourcePage[];
  unit: string;
  unitShort: string;
  valueKind?: HistoryRaceValueKind;
  timeLabel?: string;
  timeLabelEn?: string;
  timeValuePrefix?: string;
  timeValuePrefixEn?: string;
  timeValueSuffix?: string;
  timeValueSuffixEn?: string;
  showFlags?: boolean;
  axisRetreatThreshold?: number;
  startYear: number;
  endYear: number;
  entities: HistoryRaceEntity[];
  frames: HistoryRaceFrame[];
  events: HistoryRaceEvent[];
};

export type GdpRaceEntity = HistoryRaceEntity;
export type GdpRaceItem = HistoryRaceItem;
export type GdpRaceFrame = HistoryRaceFrame;
export type GdpRaceEvent = HistoryRaceEvent;
export type GdpRaceData = HistoryRaceData;
