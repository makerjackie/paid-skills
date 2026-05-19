import type {HistoryRaceData} from '../types/history';

export type HistoryVideoPanelFlags = {
  showInsightPanel: boolean;
  showSourcePanel: boolean;
};

export const HISTORY_RACE_VIDEO_FALLBACK_SECONDS = 120;
export const HISTORY_RACE_VIDEO_MIN_SECONDS = 30;
export const HISTORY_RACE_VIDEO_MAX_SECONDS = 240;
export const HISTORY_RACE_VIDEO_SECONDS_PER_TIMELINE_STEP = 1.35;
export const EVENT_BONUS_SECONDS = 1.5;
export const HISTORY_RACE_CLOSING_SECONDS = 7;

const RACE_START_SECONDS = 3.2;
const RACE_TO_CLOSING_GAP_SECONDS = 2;
const PANEL_GAP_SECONDS = 4;
const INSIGHT_PANEL_SECONDS = 12;
const SOURCE_PANEL_SECONDS = 14;

export function resolveHistoryRaceVideoDuration({
  data,
  durationSeconds,
  showInsightPanel,
  showSourcePanel,
}: {
  data?: HistoryRaceData | null;
  durationSeconds?: number;
} & Partial<HistoryVideoPanelFlags>) {
  if (Number.isFinite(durationSeconds)) {
    return clampHistoryRaceVideoDuration(durationSeconds!);
  }

  if (!data) {
    return HISTORY_RACE_VIDEO_FALLBACK_SECONDS;
  }

  return estimateHistoryRaceVideoDuration(data, {
    showInsightPanel: Boolean(showInsightPanel),
    showSourcePanel: Boolean(showSourcePanel),
  });
}

export function estimateHistoryRaceVideoDuration(data: HistoryRaceData, panels: HistoryVideoPanelFlags) {
  const timelineSteps = Math.max(1, data.frames.length - 1);
  const uniqueEventYears = new Set(data.events?.map((e) => e.year) ?? []).size;
  const eventBonus = uniqueEventYears * EVENT_BONUS_SECONDS;
  const raceSeconds = timelineSteps * HISTORY_RACE_VIDEO_SECONDS_PER_TIMELINE_STEP + eventBonus;
  const postRaceSeconds =
    panels.showInsightPanel || panels.showSourcePanel
      ? PANEL_GAP_SECONDS +
        (panels.showInsightPanel ? INSIGHT_PANEL_SECONDS : 0) +
        (panels.showSourcePanel ? SOURCE_PANEL_SECONDS : 0) +
        HISTORY_RACE_CLOSING_SECONDS
      : RACE_TO_CLOSING_GAP_SECONDS + HISTORY_RACE_CLOSING_SECONDS;

  return clampHistoryRaceVideoDuration(RACE_START_SECONDS + raceSeconds + postRaceSeconds);
}

export function clampHistoryRaceVideoDuration(durationSeconds: number) {
  return Math.round(
    Math.min(HISTORY_RACE_VIDEO_MAX_SECONDS, Math.max(HISTORY_RACE_VIDEO_MIN_SECONDS, durationSeconds)),
  );
}
