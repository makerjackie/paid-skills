import {Audio, AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CSSProperties} from 'react';

import {buildRaceSnapshot, createRaceFrameMap, interpolateNumber, type RaceSnapshot} from '../src/lib/race-engine';
import {getHistoryVideoCopy, type HistoryVideoCopy} from '../src/lib/history-video-copy';
import {
  HISTORY_RACE_VIDEO_FALLBACK_SECONDS,
  HISTORY_RACE_VIDEO_SECONDS_PER_TIMELINE_STEP,
  EVENT_BONUS_SECONDS,
  HISTORY_RACE_CLOSING_SECONDS,
  resolveHistoryRaceVideoDuration as resolveHistoryRaceVideoDurationValue,
} from '../src/lib/history-video-duration';
import {
  DEFAULT_HISTORY_VIDEO_MUSIC_ID,
  resolveHistoryVideoMusicTrack,
  toRemotionStaticFilePath,
} from '../src/lib/history-video-music';
import {resolveHistoryVideoTheme, type HistoryVideoTheme} from '../src/lib/history-video-theme';
import type {HistoryRaceData, HistoryRaceEvent, HistoryRaceItem} from '../src/types/history';
import sampleData from '../data/history/southeast-asia-gdp-race.json';

export const HISTORY_RACE_VIDEO_WIDTH = 1080;
export const HISTORY_RACE_VIDEO_HEIGHT = 1920;
export const HISTORY_RACE_VIDEO_LANDSCAPE_WIDTH = 1920;
export const HISTORY_RACE_VIDEO_LANDSCAPE_HEIGHT = 1080;
export const HISTORY_RACE_VIDEO_FPS = 30;
export const HISTORY_RACE_VIDEO_SECONDS = HISTORY_RACE_VIDEO_FALLBACK_SECONDS;

export type HistoryRaceVideoProps = {
  slug: string;
  data: HistoryRaceData;
  copy?: HistoryVideoCopy;
  durationSeconds?: number;
  musicId?: string;
  musicSrc?: string;
  themeId?: string;
};

export const DEFAULT_HISTORY_RACE_VIDEO_PROPS: HistoryRaceVideoProps = {
  slug: 'southeast-asia-gdp-race',
  data: sampleData as HistoryRaceData,
  musicId: DEFAULT_HISTORY_VIDEO_MUSIC_ID,
};

const TOP_COUNT = 12;
const EVENT_BASE_DURATION_YEARS = 1.4;
const EVENT_EXTENDED_DURATION_YEARS = 4.5;
const RACE_AXIS_PADDING = 1.3;
const COVER_END_SECONDS = 2.2;
const RACE_START_SECONDS = 3.2;
const RANK_TRANSITION_SECONDS = 0.78;
const VIDEO_BAR_INSIDE_LABEL_MIN_WIDTH = 118;
const CHART_TOP = 640;
const CHART_LEFT = 46;
const CHART_WIDTH = 906;
const EVENT_RIGHT_INSET = 110;
const AXIS_TOP = CHART_TOP - 16;
const AXIS_BOTTOM = 560;
const MIN_VISIBLE_BAR_WIDTH = 4;
const ENTITY_EVENT_MAX_CHARS = 14;
const GLOBAL_EVENT_MAX_CHARS = 18;
const ENTITY_EVENT_INSIDE_MIN_WIDTH = 420;
const LANDSCAPE_ENTITY_EVENT_INSIDE_MIN_WIDTH = 370;
const TITLE_MAX_CHARS = 24;
const LANDSCAPE_TITLE_MAX_CHARS = 30;
const COVER_HEADLINE_LINE_MAX_CHARS = 11;
const COVER_HEADLINE_MAX_LINES = 2;
const INTRO_MAX_CHARS = 58;
const COLOR_TONES = [
  '#3f6f9f',
  '#4f8073',
  '#b35d45',
  '#8a6546',
  '#6f7f4a',
  '#6d6f8f',
  '#9a5f74',
  '#9a6d3a',
  '#527fa5',
  '#5e8d72',
  '#b76782',
  '#b87542',
];
const FONT_FAMILY =
  '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Avenir Next",Arial,sans-serif';

export function resolveHistoryRaceVideoDuration(
  durationSeconds?: number,
  data?: HistoryRaceData | null,
  panels?: {showInsightPanel: boolean; showSourcePanel: boolean},
) {
  return resolveHistoryRaceVideoDurationValue({
    data,
    durationSeconds,
    showInsightPanel: panels?.showInsightPanel,
    showSourcePanel: panels?.showSourcePanel,
  });
}

export function resolveHistoryRaceVideoDurationFromProps(props: Pick<HistoryRaceVideoProps, 'data' | 'copy' | 'durationSeconds'>) {
  return resolveHistoryRaceVideoDuration(props.durationSeconds, props.data, {
    showInsightPanel: false,
    showSourcePanel: false,
  });
}

export function HistoryRaceVideo({data, copy: copyOverride, durationSeconds, musicId, musicSrc, themeId}: HistoryRaceVideoProps) {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const seconds = frame / fps;
  const frameMap = createRaceFrameMap(data.frames);
  const copy = copyOverride ?? getHistoryVideoCopy(data);
  const {showInsightPanel, showSourcePanel} = {
    showInsightPanel: false,
    showSourcePanel: false,
  };
  const resolvedDurationSeconds = resolveHistoryRaceVideoDuration(durationSeconds, data, {
    showInsightPanel,
    showSourcePanel,
  });
  const timing = getVideoTiming(resolvedDurationSeconds, {showInsightPanel, showSourcePanel});
  const raceProgress = getRaceProgress(seconds, timing, data);
  const raceYear = data.startYear + raceProgress * (data.endYear - data.startYear);
  const rankTransitionProgress = getRankTransitionProgress(seconds, timing, data);
  const snapshot = buildRaceSnapshot({
    startYear: data.startYear,
    endYear: data.endYear,
    frames: data.frames,
    frameMap,
    events: data.events,
    raceYear,
    topCount: TOP_COUNT,
    eventDurationYears: EVENT_BASE_DURATION_YEARS,
    axisPadding: RACE_AXIS_PADDING,
    axisRetreatThreshold: data.axisRetreatThreshold,
    rankTransitionProgress,
    valueOf: (item) => item.value ?? item.gdp ?? 0,
    interpolateItem: ({source, lower, upper, progress}) => ({
      ...source,
      value: interpolateNumber(lower?.value ?? lower?.gdp ?? 0, upper?.value ?? upper?.gdp ?? 0, progress),
      share: interpolateNumber(lower?.share ?? 0, upper?.share ?? 0, progress),
    }),
  });
  const activeGlobalEvent = getActiveGlobalEvent(data, raceYear);
  const track = resolveHistoryVideoMusicTrack(data, musicId ?? data.musicId);
  const theme = resolveHistoryVideoTheme(data, themeId ?? data.themeId);
  const audioPath = toRemotionStaticFilePath(musicSrc ?? track.src);
  const titleOpacity = interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS, timing.closingStart, timing.closingStart + 2], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleLift = interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS], [34, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const titleScale = interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS], [1.02, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const leadOpacity = interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS], [0, 0.92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const footerOpacity = interpolate(seconds, [timing.closingStart - 1, timing.closingStart], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleText = truncateDisplayText(copy.hook, TITLE_MAX_CHARS);
  const introText = truncateDisplayText(copy.intro, INTRO_MAX_CHARS);

  return (
    <AbsoluteFill style={{...styles.root, backgroundColor: theme.background, color: theme.text}}>
      <Audio
        src={staticFile(audioPath)}
        loop
        loopVolumeCurveBehavior="extend"
        volume={(audioFrame) => getMusicVolume(audioFrame, durationInFrames, fps)}
      />

      <div style={{...styles.backdropGrid, backgroundColor: theme.background}} />
      <ThemeMotif theme={theme} seconds={seconds} />
      <div style={styles.header}>
        <div style={styles.brandMark}>世界的形状</div>
        <div style={{...styles.brandEnglish, color: theme.accentDeep}}>Shape of World</div>
      </div>
      <CoverFrame data={data} copy={copy} seconds={seconds} theme={theme} />

      <div
        style={{
          ...styles.titleBlock,
          opacity: titleOpacity,
          transform: `translateY(${titleLift}px) scale(${titleScale})`,
        }}
      >
        <div style={{...styles.eyebrow, color: theme.accentDeep}}>ALL HISTORY · {formatRaceTimeValue(data.startYear, data)}-{formatRaceTimeValue(data.endYear, data)}</div>
        <h1 style={styles.title}>{titleText}</h1>
        <p style={{...styles.lead, color: theme.muted, opacity: leadOpacity}}>{introText}</p>
      </div>

      <EventCallout data={data} event={activeGlobalEvent} seconds={seconds} timing={timing} theme={theme} />
      <RaceChart data={data} snapshot={snapshot} seconds={seconds} timing={timing} />
      <YearStamp yearLabel={formatRaceTimeValue(snapshot.year, data)} seconds={seconds} timing={timing} />
      <ClosingCard copy={copy} seconds={seconds} timing={timing} theme={theme} />

      <div style={{...styles.footer, opacity: footerOpacity}}>
        <span>{copy.sourceLine}</span>
      </div>
    </AbsoluteFill>
  );
}

export function HistoryRaceVideoLandscape({data, copy: copyOverride, durationSeconds, musicId, musicSrc, themeId}: HistoryRaceVideoProps) {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const seconds = frame / fps;
  const frameMap = createRaceFrameMap(data.frames);
  const copy = copyOverride ?? getHistoryVideoCopy(data);
  const {showInsightPanel, showSourcePanel} = {
    showInsightPanel: false,
    showSourcePanel: false,
  };
  const resolvedDurationSeconds = resolveHistoryRaceVideoDuration(durationSeconds, data, {
    showInsightPanel,
    showSourcePanel,
  });
  const timing = getVideoTiming(resolvedDurationSeconds, {showInsightPanel, showSourcePanel});
  const raceProgress = getRaceProgress(seconds, timing, data);
  const raceYear = data.startYear + raceProgress * (data.endYear - data.startYear);
  const rankTransitionProgress = getRankTransitionProgress(seconds, timing, data);
  const snapshot = buildRaceSnapshot({
    startYear: data.startYear,
    endYear: data.endYear,
    frames: data.frames,
    frameMap,
    events: data.events,
    raceYear,
    topCount: TOP_COUNT,
    eventDurationYears: EVENT_BASE_DURATION_YEARS,
    axisPadding: RACE_AXIS_PADDING,
    axisRetreatThreshold: data.axisRetreatThreshold,
    rankTransitionProgress,
    valueOf: (item) => item.value ?? item.gdp ?? 0,
    interpolateItem: ({source, lower, upper, progress}) => ({
      ...source,
      value: interpolateNumber(lower?.value ?? lower?.gdp ?? 0, upper?.value ?? upper?.gdp ?? 0, progress),
      share: interpolateNumber(lower?.share ?? 0, upper?.share ?? 0, progress),
    }),
  });
  const activeGlobalEvent = getActiveGlobalEvent(data, raceYear);
  const track = resolveHistoryVideoMusicTrack(data, musicId ?? data.musicId);
  const theme = resolveHistoryVideoTheme(data, themeId ?? data.themeId);
  const audioPath = toRemotionStaticFilePath(musicSrc ?? track.src);
  const contentOpacity = interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS, timing.closingStart], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const footerOpacity = interpolate(seconds, [timing.closingStart - 1, timing.closingStart], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{...styles.root, backgroundColor: theme.background, color: theme.text}}>
      <Audio
        src={staticFile(audioPath)}
        loop
        loopVolumeCurveBehavior="extend"
        volume={(audioFrame) => getMusicVolume(audioFrame, durationInFrames, fps)}
      />

      <div style={{...styles.backdropGrid, backgroundColor: theme.background}} />
      <ThemeMotif theme={theme} seconds={seconds} />
      <div style={styles.landscapeHeader}>
        <div style={styles.brandMark}>世界的形状</div>
        <div style={{...styles.brandEnglish, color: theme.accentDeep}}>Shape of World</div>
      </div>
      <LandscapeCoverFrame data={data} copy={copy} seconds={seconds} theme={theme} />

      <div style={{...styles.landscapeInfoPanel, opacity: contentOpacity}}>
        <div style={{...styles.eyebrow, color: theme.accentDeep}}>ALL HISTORY · {formatRaceTimeValue(data.startYear, data)}-{formatRaceTimeValue(data.endYear, data)}</div>
        <h1 style={styles.landscapeTitle}>{truncateDisplayText(copy.hook, LANDSCAPE_TITLE_MAX_CHARS)}</h1>
        <p style={{...styles.landscapeLead, color: theme.muted}}>{truncateDisplayText(copy.intro, 74)}</p>
        <LandscapeEventCallout data={data} event={activeGlobalEvent} seconds={seconds} timing={timing} theme={theme} />
      </div>

      <LandscapeRaceChart data={data} snapshot={snapshot} seconds={seconds} timing={timing} theme={theme} />
      <LandscapeYearStamp yearLabel={formatRaceTimeValue(snapshot.year, data)} seconds={seconds} timing={timing} />
      <LandscapeClosingCard copy={copy} seconds={seconds} timing={timing} theme={theme} />

      <div style={{...styles.landscapeFooter, opacity: footerOpacity}}>
        <span>{copy.sourceLine}</span>
      </div>
    </AbsoluteFill>
  );
}

function ThemeMotif({theme, seconds}: {theme: HistoryVideoTheme; seconds: number}) {
  const opacity = interpolate(seconds, [0, RACE_START_SECONDS, RACE_START_SECONDS + 1.4], [0.72, 0.36, 0.16], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return <div style={{...styles.themeMotif, color: theme.accent, opacity}}>{theme.motif}</div>;
}

function CoverFrame({
  data,
  copy,
  seconds,
  theme,
}: {
  data: HistoryRaceData;
  copy: ReturnType<typeof getHistoryVideoCopy>;
  seconds: number;
  theme: HistoryVideoTheme;
}) {
  if (seconds > RACE_START_SECONDS + 0.4) {
    return null;
  }

  const firstFrame = data.frames[0];
  const lastFrame = data.frames[data.frames.length - 1];
  const compareRank = Math.max(1, copy.coverCompareRank ?? 1);
  const firstComparison = firstFrame?.items[compareRank - 1] ?? firstFrame?.items[0] ?? null;
  const lastComparison = lastFrame?.items[compareRank - 1] ?? lastFrame?.items[0] ?? null;
  const startLabel = compareRank === 1 ? '起点' : `第 ${compareRank} 名`;
  const endLabel = compareRank === 1 ? '现在' : `第 ${compareRank} 名`;
  const headlineLines = getCoverHeadlineLines(copy.coverHeadline);
  const longestHeadlineLine = Math.max(...headlineLines.map((line) => line.length));
  const headlineFontSize = headlineLines.length >= 3 || longestHeadlineLine >= 11 ? 88 : longestHeadlineLine >= 9 ? 96 : 108;
  const opacity = interpolate(seconds, [0, COVER_END_SECONDS + 0.15, RACE_START_SECONDS], [1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(seconds, [0, RACE_START_SECONDS], [0, -34], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const stripY = interpolate(seconds, [0, RACE_START_SECONDS], [0, 28], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{...styles.coverLayer, backgroundColor: theme.background, opacity}}>
      <div style={{...styles.coverGrid, backgroundColor: theme.background}} />
      <div style={{...styles.coverWatermark, color: theme.accentSoft}}>{theme.motif}</div>
      <div style={styles.coverHeader}>
        <div style={styles.coverBrand}>世界的形状</div>
        <div style={{...styles.coverRange, color: theme.accentDeep}}>{copy.coverKicker}</div>
      </div>
      <div style={{...styles.coverTitleGroup, transform: `translateY(${titleY}px)`}}>
        <div style={{...styles.coverBadge, backgroundColor: theme.text, color: theme.paper}}>{copy.coverBadge}</div>
        <div style={{...styles.coverHeadline, fontSize: headlineFontSize}}>
          {headlineLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div style={{...styles.coverSubline, color: theme.accentDeep}}>{copy.coverSubline}</div>
      </div>
      <div style={{...styles.coverLeaderStrip, transform: `translateY(${stripY}px)`}}>
        <CoverLeader label={startLabel} year={data.startYear} item={firstComparison} data={data} />
        <div style={{...styles.coverArrow, color: theme.accent}}>→</div>
        <CoverLeader label={endLabel} year={data.endYear} item={lastComparison} data={data} align="right" />
      </div>
    </div>
  );
}

function CoverLeader({
  label,
  year,
  item,
  data,
  align,
}: {
  label: string;
  year: number;
  item: HistoryRaceItem | null;
  data: HistoryRaceData;
  align?: 'right';
}) {
  return (
    <div style={{...styles.coverLeader, textAlign: align ?? 'left'}}>
      <div style={styles.coverLeaderLabel}>{label} · {formatRaceTimeValue(year, data)}</div>
      <div style={styles.coverLeaderName}>{item?.name ?? '未知'}</div>
      <div style={styles.coverLeaderValue}>{item ? formatRaceValue(item.value ?? item.gdp ?? 0, data) : ''}</div>
    </div>
  );
}

function LandscapeCoverFrame({
  data,
  copy,
  seconds,
  theme,
}: {
  data: HistoryRaceData;
  copy: ReturnType<typeof getHistoryVideoCopy>;
  seconds: number;
  theme: HistoryVideoTheme;
}) {
  if (seconds > RACE_START_SECONDS + 0.4) {
    return null;
  }

  const firstFrame = data.frames[0];
  const lastFrame = data.frames[data.frames.length - 1];
  const compareRank = Math.max(1, copy.coverCompareRank ?? 1);
  const firstComparison = firstFrame?.items[compareRank - 1] ?? firstFrame?.items[0] ?? null;
  const lastComparison = lastFrame?.items[compareRank - 1] ?? lastFrame?.items[0] ?? null;
  const headlineLines = getCoverHeadlineLines(copy.coverHeadline);
  const opacity = interpolate(seconds, [0, COVER_END_SECONDS + 0.15, RACE_START_SECONDS], [1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(seconds, [0, RACE_START_SECONDS], [0, -24], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{...styles.landscapeCoverLayer, backgroundColor: theme.background, opacity}}>
      <div style={{...styles.coverGrid, backgroundColor: theme.background}} />
      <div style={{...styles.landscapeCoverWatermark, color: theme.accentSoft}}>{theme.motif}</div>
      <div style={styles.landscapeCoverHeader}>
        <div style={styles.coverBrand}>世界的形状</div>
        <div style={{...styles.coverRange, color: theme.accentDeep}}>{copy.coverKicker}</div>
      </div>
      <div style={{...styles.landscapeCoverTitleGroup, transform: `translateY(${titleY}px)`}}>
        <div style={{...styles.coverBadge, backgroundColor: theme.text, color: theme.paper}}>{copy.coverBadge}</div>
        <div style={styles.landscapeCoverHeadline}>
          {headlineLines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div style={{...styles.landscapeCoverSubline, color: theme.accentDeep}}>{copy.coverSubline}</div>
      </div>
      <div style={styles.landscapeCoverLeaderStrip}>
        <CoverLeader label={compareRank === 1 ? '起点' : `第 ${compareRank} 名`} year={data.startYear} item={firstComparison} data={data} />
        <div style={{...styles.coverArrow, color: theme.accent}}>→</div>
        <CoverLeader label={compareRank === 1 ? '现在' : `第 ${compareRank} 名`} year={data.endYear} item={lastComparison} data={data} align="right" />
      </div>
    </div>
  );
}

function RaceChart({
  data,
  snapshot,
  seconds,
  timing,
}: {
  data: HistoryRaceData;
  snapshot: RaceSnapshot<HistoryRaceItem, HistoryRaceEvent>;
  seconds: number;
  timing: HistoryRaceVideoTiming;
}) {
  const chartTop = CHART_TOP;
  const chartLeft = CHART_LEFT;
  const chartWidth = CHART_WIDTH;
  const rowHeight = 58;
  const rowGap = 10;
  const rowStep = rowHeight + rowGap;
  const introLift = interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS + 1.8], [42, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        ...styles.chart,
        opacity: interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS, timing.closingStart], [0, 1, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        transform: `translateY(${introLift}px)`,
      }}
    >
      <AxisLabels data={data} axisMax={snapshot.axisMax} />
      {snapshot.items.map((item) => {
        const value = item.value ?? item.gdp ?? 0;
        const rawWidth = snapshot.axisMax > 0 ? (value / snapshot.axisMax) * chartWidth : 0;
        const width = value > 0 ? Math.max(MIN_VISIBLE_BAR_WIDTH, rawWidth) : 0;
        const y = chartTop + item.displayRank * rowStep;
        const color = getEntityColor(data, item.code);
        const formattedValue = formatRaceValue(value, data);
        const entityEvent = getActiveEntityEvent(data, snapshot.year, item.code);
        const entityEventText = entityEvent ? getEntityEventText(entityEvent, item) : null;
        const labelInside = width >= getCompactInsideLabelMinWidth(item.name);
        const barStyle = labelInside ? styles.bar : styles.compactBar;
        const labelPaddingLeft = width < 160 ? 14 : 22;
        const eventInsideWidth = entityEventText ? getEntityEventInsideWidth(entityEventText, 22, 360) : 0;
        const eventInsideBar = Boolean(
          entityEventText &&
            labelInside &&
            width >=
              getEntityEventInsideMinWidth({
                name: item.name,
                eventBoxWidth: eventInsideWidth,
                nameFontSize: 20,
                labelPaddingLeft,
                minWidth: ENTITY_EVENT_INSIDE_MIN_WIDTH,
              }),
        );
        const labelPaddingRight = eventInsideBar ? eventInsideWidth + 24 : 12;
        const labelWidth = Math.max(0, width - labelPaddingLeft - labelPaddingRight);
        const barNameFontSize = getAdaptiveInlineFontSize(item.name, labelWidth, 26, 18);
        const barMetaFontSize = width < 150 ? 13 : 16;
        const rankOpacity = interpolate(seconds, [RACE_START_SECONDS - 0.45, RACE_START_SECONDS + 0.1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={item.code}
            style={{
              ...styles.row,
              left: chartLeft,
              top: y,
              height: rowHeight,
              opacity: y < chartTop + TOP_COUNT * rowStep ? rankOpacity : 0,
            }}
          >
            <div style={styles.rank}>{item.rank}</div>
            <div style={{...barStyle, width, backgroundColor: color, position: 'relative', paddingLeft: labelInside ? labelPaddingLeft : undefined, paddingRight: labelInside ? labelPaddingRight : undefined}}>
              {labelInside ? (
                <>
                  <div style={{...styles.barName, fontSize: barNameFontSize}}>{item.name}</div>
                  <div style={{...styles.barMeta, fontSize: barMetaFontSize}}>{item.region}</div>
                  {eventInsideBar && entityEventText ? (
                    <div
                      style={{
                        ...styles.entityEventInside,
                        ...getEntityEventInsideStyle(color),
                        width: eventInsideWidth,
                      }}
                    >
                      {entityEventText}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            {!labelInside ? (
              <div style={styles.outsideLabel}>
                <div style={styles.outsideName}>{item.name}</div>
                <div style={styles.outsideMeta}>{item.region}</div>
              </div>
            ) : null}
            <div style={styles.outsideValueBlock}>
              <div style={styles.outsideValueRow}>
                <span style={styles.outsideValue}>{formattedValue}{data.valueKind === 'eggs-per-hour' ? <span style={styles.eggIcon}>🥚</span> : null}</span>
                {entityEventText && !eventInsideBar ? (
                  <>
                    <span style={styles.entityEventSeparator}>|</span>
                    <span style={{...styles.entityEventInline, ...getEntityEventInlineStyle(color)}}>{entityEventText}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LandscapeRaceChart({
  data,
  snapshot,
  seconds,
  timing,
  theme,
}: {
  data: HistoryRaceData;
  snapshot: RaceSnapshot<HistoryRaceItem, HistoryRaceEvent>;
  seconds: number;
  timing: HistoryRaceVideoTiming;
  theme: HistoryVideoTheme;
}) {
  const chartTop = 180;
  const chartLeft = 680;
  const chartWidth = 1120;
  const rowHeight = 48;
  const rowGap = 9;
  const rowStep = rowHeight + rowGap;
  const opacity = interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS, timing.closingStart], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lift = interpolate(seconds, [COVER_END_SECONDS, RACE_START_SECONDS + 1.4], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{...styles.landscapeChart, opacity, transform: `translateY(${lift}px)`}}>
      <LandscapeAxisLabels data={data} axisMax={snapshot.axisMax} chartLeft={chartLeft} chartWidth={chartWidth} />
      {snapshot.items.map((item) => {
        const value = item.value ?? item.gdp ?? 0;
        const rawWidth = snapshot.axisMax > 0 ? (value / snapshot.axisMax) * chartWidth : 0;
        const width = value > 0 ? Math.max(MIN_VISIBLE_BAR_WIDTH, rawWidth) : 0;
        const y = chartTop + item.displayRank * rowStep;
        const color = getEntityColor(data, item.code);
        const formattedValue = formatRaceValue(value, data);
        const entityEvent = getActiveEntityEvent(data, snapshot.year, item.code);
        const entityEventText = entityEvent ? getEntityEventText(entityEvent, item) : null;
        const labelInside = width >= Math.max(92, getCompactInsideLabelMinWidth(item.name) - 10);
        const barStyle = labelInside ? styles.landscapeBar : styles.landscapeCompactBar;
        const labelPaddingLeft = width < 150 ? 14 : 18;
        const eventInsideWidth = entityEventText ? getEntityEventInsideWidth(entityEventText, 22, 360) : 0;
        const eventInsideBar = Boolean(
          entityEventText &&
            labelInside &&
            width >=
              getEntityEventInsideMinWidth({
                name: item.name,
                eventBoxWidth: eventInsideWidth,
                nameFontSize: 18,
                labelPaddingLeft,
                minWidth: LANDSCAPE_ENTITY_EVENT_INSIDE_MIN_WIDTH,
              }),
        );
        const labelPaddingRight = eventInsideBar ? eventInsideWidth + 22 : 12;
        const labelWidth = Math.max(0, width - labelPaddingLeft - labelPaddingRight);
        const barNameFontSize = getAdaptiveInlineFontSize(item.name, labelWidth, 23, 17);
        const barMetaFontSize = width < 140 ? 12 : 14;

        return (
          <div
            key={item.code}
            style={{
              ...styles.landscapeRow,
              left: chartLeft,
              top: y,
              height: rowHeight,
            }}
          >
            <div style={styles.landscapeRank}>{item.rank}</div>
            <div style={{...barStyle, width, backgroundColor: color, position: 'relative', paddingLeft: labelInside ? labelPaddingLeft : undefined, paddingRight: labelInside ? labelPaddingRight : undefined}}>
              {labelInside ? (
                <>
                  <div style={{...styles.landscapeBarName, fontSize: barNameFontSize}}>{item.name}</div>
                  <div style={{...styles.landscapeBarMeta, fontSize: barMetaFontSize}}>{item.region}</div>
                  {eventInsideBar && entityEventText ? (
                    <div
                      style={{
                        ...styles.landscapeEntityEventInside,
                        ...getEntityEventInsideStyle(color),
                        width: eventInsideWidth,
                      }}
                    >
                      {entityEventText}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            {!labelInside ? (
              <div style={styles.landscapeOutsideLabel}>
                <div style={styles.landscapeOutsideName}>{item.name}</div>
                <div style={{...styles.landscapeOutsideMeta, color: theme.muted}}>{item.region}</div>
              </div>
            ) : null}
            <div style={styles.landscapeOutsideValueBlock}>
              <div style={styles.landscapeOutsideValueRow}>
                <span style={styles.landscapeOutsideValue}>{formattedValue}{data.valueKind === 'eggs-per-hour' ? <span style={styles.eggIcon}>🥚</span> : null}</span>
                {entityEventText && !eventInsideBar ? (
                  <>
                    <span style={styles.landscapeEntityEventSeparator}>|</span>
                    <span style={{...styles.landscapeEntityEventInline, ...getEntityEventInlineStyle(color)}}>{entityEventText}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AxisLabels({axisMax, data}: {axisMax: number; data: HistoryRaceData}) {
  const ticks = [0.25, 0.5, 0.75, 1].map((ratio) => axisMax * ratio);

  return (
    <div style={styles.axisLayer}>
      {ticks.map((tick) => (
        <div key={tick} style={{...styles.axisTick, left: CHART_LEFT + (tick / axisMax) * CHART_WIDTH}}>
          <div style={styles.axisLine} />
          <div style={styles.axisText}>{formatRaceValue(tick, data)}</div>
        </div>
      ))}
    </div>
  );
}

function LandscapeAxisLabels({
  axisMax,
  data,
  chartLeft,
  chartWidth,
}: {
  axisMax: number;
  data: HistoryRaceData;
  chartLeft: number;
  chartWidth: number;
}) {
  const ticks = [0.25, 0.5, 0.75, 1].map((ratio) => axisMax * ratio);

  return (
    <div style={styles.axisLayer}>
      {ticks.map((tick) => (
        <div key={tick} style={{...styles.landscapeAxisTick, left: chartLeft + (tick / axisMax) * chartWidth}}>
          <div style={styles.axisLine} />
          <div style={styles.landscapeAxisText}>{formatRaceValue(tick, data)}</div>
        </div>
      ))}
    </div>
  );
}

function EventCallout({
  data,
  event,
  seconds,
  timing,
  theme,
}: {
  data: HistoryRaceData;
  event: HistoryRaceEvent | null;
  seconds: number;
  timing: HistoryRaceVideoTiming;
  theme: HistoryVideoTheme;
}) {
  if (!event || seconds < RACE_START_SECONDS || seconds > timing.raceEnd + 2) {
    return null;
  }

  const opacity = interpolate(seconds, [RACE_START_SECONDS, RACE_START_SECONDS + 0.8, timing.raceEnd + 1.2, timing.raceEnd + 2], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{...styles.eventCallout, opacity}}>
      <div style={{...styles.eventYear, color: theme.accentDeep}}>{formatRaceTimeValue(event.year, data)}</div>
      <div style={styles.eventTitle}>{truncateDisplayText(event.title, GLOBAL_EVENT_MAX_CHARS)}</div>
      <div style={{...styles.eventDescription, color: theme.muted}}>{truncateDisplayText(event.description, 30)}</div>
    </div>
  );
}

function LandscapeEventCallout({
  data,
  event,
  seconds,
  timing,
  theme,
}: {
  data: HistoryRaceData;
  event: HistoryRaceEvent | null;
  seconds: number;
  timing: HistoryRaceVideoTiming;
  theme: HistoryVideoTheme;
}) {
  if (!event || seconds < RACE_START_SECONDS || seconds > timing.raceEnd + 2) {
    return null;
  }

  const opacity = interpolate(seconds, [RACE_START_SECONDS, RACE_START_SECONDS + 0.8, timing.raceEnd + 1.2, timing.raceEnd + 2], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{...styles.landscapeEventCallout, opacity}}>
      <div style={{...styles.eventYear, color: theme.accentDeep}}>{formatRaceTimeValue(event.year, data)}</div>
      <div style={styles.landscapeEventTitle}>{truncateDisplayText(event.title, GLOBAL_EVENT_MAX_CHARS)}</div>
      <div style={{...styles.landscapeEventDescription, color: theme.muted}}>{truncateDisplayText(event.description, 34)}</div>
    </div>
  );
}

function YearStamp({yearLabel, seconds, timing}: {yearLabel: string; seconds: number; timing: HistoryRaceVideoTiming}) {
  const opacity = interpolate(seconds, [RACE_START_SECONDS, RACE_START_SECONDS + 1, timing.closingStart], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return <div style={{...styles.year, opacity}}>{yearLabel}</div>;
}

function LandscapeYearStamp({yearLabel, seconds, timing}: {yearLabel: string; seconds: number; timing: HistoryRaceVideoTiming}) {
  const opacity = interpolate(seconds, [RACE_START_SECONDS, RACE_START_SECONDS + 1, timing.closingStart], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return <div style={{...styles.landscapeYear, opacity}}>{yearLabel}</div>;
}

function InsightPanel({
  insight,
  seconds,
  timing,
}: {
  insight: string;
  seconds: number;
  timing: HistoryRaceVideoTiming;
}) {
  const opacity = interpolate(seconds, [timing.insightStart, timing.insightStart + 2, timing.sourceStart], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (seconds < timing.insightStart || seconds > timing.sourceStart + 1) {
    return null;
  }

  return (
    <div style={{...styles.insightPanel, opacity}}>
      <div style={styles.panelLabel}>看到这里，榜单已经不只是榜单。</div>
      <div style={styles.panelText}>{insight}</div>
    </div>
  );
}

function SourceDisclosurePanel({
  disclosure,
  seconds,
  timing,
}: {
  disclosure?: string;
  seconds: number;
  timing: HistoryRaceVideoTiming;
}) {
  if (!disclosure || seconds < timing.sourceStart || seconds > timing.closingStart + 1) {
    return null;
  }

  const opacity = interpolate(seconds, [timing.sourceStart, timing.sourceStart + 1.4, timing.closingStart], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{...styles.sourcePanel, opacity}}>
      <div style={styles.sourcePanelLabel}>数据怎么来的</div>
      <div style={styles.sourcePanelText}>{disclosure}</div>
    </div>
  );
}

function ClosingCard({
  copy,
  seconds,
  timing,
  theme,
}: {
  copy: ReturnType<typeof getHistoryVideoCopy>;
  seconds: number;
  timing: HistoryRaceVideoTiming;
  theme: HistoryVideoTheme;
}) {
  if (seconds < timing.closingStart) {
    return null;
  }

  const opacity = interpolate(seconds, [timing.closingStart, timing.closingStart + 1.2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{...styles.closingLayer, opacity}}>
      <div style={{...styles.closingVeil, backgroundColor: theme.background}} />
      <div style={styles.closing}>
        <div style={styles.closingBrandRow}>
          <Img src={staticFile('logo-horizontal.svg')} style={styles.closingLogo} />
          <div style={{...styles.closingBrandText, color: theme.accentDeep}}>A Playable Universe of Human Knowledge</div>
        </div>
        <div style={styles.closingTitle}>{copy.closingTitle ?? '可游玩的知识宇宙'}</div>
        <div style={{...styles.closingBody, color: theme.accentDeep}}>{copy.closingBody ?? '像逛博物馆、翻地图、玩游戏一样，探索真实世界的数据与历史。'}</div>
        <div style={styles.closingNote}>{copy.sourceDisclosure ?? copy.sourceLine}</div>
        <div style={styles.closingDomain}>ShapeOf.World</div>
      </div>
    </div>
  );
}

function LandscapeClosingCard({
  copy,
  seconds,
  timing,
  theme,
}: {
  copy: ReturnType<typeof getHistoryVideoCopy>;
  seconds: number;
  timing: HistoryRaceVideoTiming;
  theme: HistoryVideoTheme;
}) {
  if (seconds < timing.closingStart) {
    return null;
  }

  const opacity = interpolate(seconds, [timing.closingStart, timing.closingStart + 1.2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{...styles.closingLayer, opacity}}>
      <div style={{...styles.closingVeil, backgroundColor: theme.background}} />
      <div style={styles.landscapeClosing}>
        <div style={styles.closingBrandRow}>
          <Img src={staticFile('logo-horizontal.svg')} style={styles.landscapeClosingLogo} />
          <div style={{...styles.closingBrandText, color: theme.accentDeep}}>A Playable Universe of Human Knowledge</div>
        </div>
        <div style={styles.landscapeClosingTitle}>{copy.closingTitle ?? '可游玩的知识宇宙'}</div>
        <div style={{...styles.landscapeClosingBody, color: theme.accentDeep}}>{copy.closingBody ?? '像逛博物馆、翻地图、玩游戏一样，探索真实世界的数据与历史。'}</div>
        <div style={styles.landscapeClosingNote}>{copy.sourceDisclosure ?? copy.sourceLine}</div>
        <div style={styles.closingDomain}>ShapeOf.World</div>
      </div>
    </div>
  );
}

type HistoryRaceVideoTiming = {
  durationSeconds: number;
  raceStart: number;
  raceEnd: number;
  insightStart: number;
  sourceStart: number;
  closingStart: number;
  eventBonusSeconds: number;
};

function getVideoTiming(
  durationSeconds: number,
  panels: {showInsightPanel: boolean; showSourcePanel: boolean},
): HistoryRaceVideoTiming {
  const closingStart = Math.max(RACE_START_SECONDS + HISTORY_RACE_CLOSING_SECONDS, durationSeconds - HISTORY_RACE_CLOSING_SECONDS);
  const sourceStart = panels.showSourcePanel
    ? Math.max(RACE_START_SECONDS + 14, closingStart - 14)
    : closingStart;
  const insightStart = panels.showInsightPanel
    ? Math.max(RACE_START_SECONDS + 8, (panels.showSourcePanel ? sourceStart : closingStart) - 12)
    : sourceStart;
  const raceEnd = panels.showInsightPanel
    ? Math.max(RACE_START_SECONDS + 4, insightStart - 4)
    : panels.showSourcePanel
      ? Math.max(RACE_START_SECONDS + 4, sourceStart - 4)
      : Math.max(RACE_START_SECONDS + 4, closingStart - 2);

  return {
    durationSeconds,
    raceStart: RACE_START_SECONDS,
    raceEnd: Math.min(raceEnd, closingStart - 2),
    insightStart: Math.min(insightStart, closingStart - 4),
    sourceStart,
    closingStart,
    eventBonusSeconds: EVENT_BONUS_SECONDS,
  };
}

function getRaceProgress(seconds: number, timing: HistoryRaceVideoTiming, data: HistoryRaceData) {
  if (seconds <= timing.raceStart) {
    return 0;
  }

  const elapsed = seconds - timing.raceStart;
  const raceDuration = timing.raceEnd - timing.raceStart;
  return Math.min(1, Math.max(0, elapsed / Math.max(0.001, raceDuration)));
}

function getRankTransitionProgress(seconds: number, timing: HistoryRaceVideoTiming, data: HistoryRaceData) {
  if (seconds <= timing.raceStart) {
    return 1;
  }

  const raceProgress = getRaceProgress(seconds, timing, data);
  const raceYear = data.startYear + raceProgress * (data.endYear - data.startYear);
  const {lowerYear, upperYear} = getRaceSegmentProgress(data, raceYear);

  if (upperYear <= lowerYear) {
    return 1;
  }

  const raceDuration = timing.raceEnd - timing.raceStart;
  const timelineSpan = Math.max(0.001, data.endYear - data.startYear);
  const segmentDuration = raceDuration * ((upperYear - lowerYear) / timelineSpan);
  return Math.min(1, RANK_TRANSITION_SECONDS / Math.max(0.001, segmentDuration));
}

function getRaceSegmentProgress(data: HistoryRaceData, raceYear: number) {
  let lowerFrame = data.frames[0];
  let upperFrame = data.frames[data.frames.length - 1] ?? lowerFrame;

  for (const frame of data.frames) {
    if (frame.year <= raceYear) {
      lowerFrame = frame;
    }

    if (frame.year > raceYear) {
      upperFrame = frame;
      break;
    }
  }

  const lowerYear = lowerFrame?.year ?? data.startYear;
  const upperYear = upperFrame?.year ?? lowerYear;
  const progress = upperYear === lowerYear ? 0 : (raceYear - lowerYear) / (upperYear - lowerYear);

  return {
    lowerYear,
    upperYear,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

function getMusicVolume(frame: number, durationInFrames: number, fps: number) {
  const fadeIn = interpolate(frame, [0, fps * 2], [0, 0.44], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(frame, [durationInFrames - fps * 5, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return fadeIn * fadeOut;
}

function getEntityColor(data: HistoryRaceData, entityCode: string) {
  const entityIndex = data.entities.findIndex((entity) => entity.code === entityCode);
  const index = entityIndex >= 0 ? entityIndex : hashEntityCode(entityCode);

  return COLOR_TONES[index % COLOR_TONES.length];
}

function hashEntityCode(entityCode: string) {
  let hash = 0;
  for (let index = 0; index < entityCode.length; index += 1) {
    hash = (hash * 31 + entityCode.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function formatRaceValue(value: number, data: HistoryRaceData) {
  const kind = data.valueKind ?? 'currency-usd';

  if (kind === 'people') {
    if (value >= 1e8) return `${formatCompact(value / 1e8)}亿人`;
    if (value >= 1e4) return `${formatCompact(value / 1e4)}万人`;
    return `${Math.round(value).toLocaleString('zh-CN')}人`;
  }

  if (kind === 'area-sqkm') {
    if (value >= 1e6) return `${formatCompact(value / 1e6)}百万 km²`;
    if (value >= 1e4) return `${formatCompact(value / 1e4)}万 km²`;
    return `${Math.round(value).toLocaleString('zh-CN')} km²`;
  }

  if (kind === 'energy-ej') return `${formatCompact(value)} EJ`;
  if (kind === 'oil-mbbl-d') return `${formatCompact(value)} 百万桶/日`;
  if (kind === 'steel-mt') return `${formatCompact(value)} 百万吨`;
  if (kind === 'hours-per-day') return `${formatCompact(value)} 小时/天`;
  if (kind === 'eggs-per-hour') return `${formatCompact(value)}`;
  if (kind === 'currency-cny') {
    if (value >= 1e12) return `${formatCompact(value / 1e12)}万亿`;
    if (value >= 1e8) return `${formatCompact(value / 1e8)}亿`;
    return `${Math.round(value).toLocaleString('zh-CN')}元`;
  }

  if (kind === 'per-capita-usd') return `$${Math.round(value).toLocaleString('zh-CN')}`;
  if (kind === 'count') return Math.round(value).toLocaleString('zh-CN');

  if (value >= 1e12) return `$${formatCompact(value / 1e12)}T`;
  if (value >= 1e9) return `$${formatCompact(value / 1e9)}B`;
  if (value >= 1e8) return `$${formatCompact(value / 1e8)}亿`;
  return `$${Math.round(value / 1e6).toLocaleString('zh-CN')}M`;
}

function formatRaceTimeValue(value: number, data: HistoryRaceData) {
  const normalizedValue = String(Math.floor(value));

  return `${data.timeValuePrefix ?? ''}${normalizedValue}${data.timeValueSuffix ?? ''}`;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: value >= 100 ? 0 : value >= 10 ? 1 : 2,
  }).format(value);
}

function truncateDisplayText(text: string, maxChars: number) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function getCoverHeadlineLines(text: string) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const headlineLines = lines.length > 1 ? lines : splitCoverHeadlineLine(lines[0] ?? '');

  return headlineLines
    .slice(0, COVER_HEADLINE_MAX_LINES)
    .map((line) => truncateDisplayText(line, COVER_HEADLINE_LINE_MAX_CHARS));
}

function splitCoverHeadlineLine(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= COVER_HEADLINE_LINE_MAX_CHARS) {
    return [normalized];
  }

  const parts = normalized
    .split(/[，,。；;：:？?！!]/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return parts;
  }

  return [
    normalized.slice(0, COVER_HEADLINE_LINE_MAX_CHARS),
    normalized.slice(COVER_HEADLINE_LINE_MAX_CHARS),
  ];
}

function getInsideLabelMinWidth(name: string) {
  return Math.max(
    VIDEO_BAR_INSIDE_LABEL_MIN_WIDTH,
    estimateInlineTextWidth(name, 26) + 52,
  );
}

function getCompactInsideLabelMinWidth(name: string) {
  return Math.max(
    70,
    Math.min(getInsideLabelMinWidth(name), estimateInlineTextWidth(name, 18) + 28),
  );
}

function getAdaptiveInlineFontSize(text: string, availableWidth: number, maxSize: number, minSize: number) {
  const estimatedWidth = estimateInlineTextWidth(text, maxSize);

  if (estimatedWidth <= availableWidth) {
    return maxSize;
  }

  return Math.max(minSize, Math.floor(maxSize * (availableWidth / Math.max(1, estimatedWidth))));
}

function getActiveGlobalEvent(data: HistoryRaceData, raceYear: number) {
  return getActiveEvents(data, raceYear, isGlobalEvent)
    .sort(sortEventsForDisplay)[0] ?? null;
}

function getActiveEntityEvent(data: HistoryRaceData, raceYear: number, entityCode: string) {
  return getActiveEvents(data, raceYear, (event) => isEntityEvent(event, entityCode))
    .sort(sortEventsForDisplay)[0] ?? null;
}

function getActiveEvents(
  data: HistoryRaceData,
  raceYear: number,
  matchesEventLane: (event: HistoryRaceEvent) => boolean,
) {
  const laneEvents = (data.events ?? [])
    .filter(matchesEventLane)
    .sort((left, right) => left.year - right.year || eventKindPriority(right.kind) - eventKindPriority(left.kind));

  return laneEvents.filter((event, index) => {
    const nextEvent = laneEvents.slice(index + 1).find((candidate) => candidate.year > event.year);
    const nextEventYear = nextEvent?.year ?? Number.POSITIVE_INFINITY;
    const displayEndYear = Math.min(
      event.year + EVENT_EXTENDED_DURATION_YEARS,
      Math.max(event.year + EVENT_BASE_DURATION_YEARS, nextEventYear),
    );

    return raceYear >= event.year && raceYear < displayEndYear;
  });
}

function sortEventsForDisplay(left: HistoryRaceEvent, right: HistoryRaceEvent) {
  return right.year - left.year || eventKindPriority(right.kind) - eventKindPriority(left.kind);
}

function eventKindPriority(kind: string) {
  if (kind === 'crisis' || kind === 'geopolitical') {
    return 3;
  }

  if (kind === 'trend') {
    return 2;
  }

  return 1;
}

function isGlobalEvent(event: HistoryRaceEvent) {
  return event.scope === 'global' || !event.entityCode;
}

function isEntityEvent(event: HistoryRaceEvent, entityCode: string) {
  return event.scope !== 'global' && event.entityCode === entityCode;
}

function getEntityEventText(event: HistoryRaceEvent, item: HistoryRaceItem) {
  const entityNames = [event.entityName, item.name].filter((name): name is string => Boolean(name));
  let text = event.title;

  for (const name of entityNames) {
    text = text.split(name).join('');
  }

  text = text.replace(/^[\s,，:：·\-]+/, '').trim();

  return truncateDisplayText(text || event.title, ENTITY_EVENT_MAX_CHARS);
}

function getEntityEventInsideMinWidth({
  name,
  eventBoxWidth,
  nameFontSize,
  labelPaddingLeft,
  minWidth,
}: {
  name: string;
  eventBoxWidth: number;
  nameFontSize: number;
  labelPaddingLeft: number;
  minWidth: number;
}) {
  return Math.max(minWidth, labelPaddingLeft + estimateInlineTextWidth(name, nameFontSize) + eventBoxWidth + 34);
}

function getEntityEventInsideWidth(text: string, fontSize: number, maxWidth: number) {
  return Math.min(maxWidth, Math.ceil(estimateInlineTextWidth(text, fontSize) + 34));
}

function getEntityEventInsideStyle(color: string): CSSProperties {
  return {
    color: '#573522',
    backgroundColor: 'rgba(255,250,240,0.9)',
    boxShadow: `inset 0 0 0 1px ${hexToRgba(color, 0.2)}`,
  };
}

function getEntityEventInlineStyle(color: string): CSSProperties {
  return {
    color,
  };
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');

  if (normalized.length !== 6) {
    return `rgba(63,111,159,${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red},${green},${blue},${alpha})`;
}

function estimateInlineTextWidth(text: string, fontSize: number) {
  let width = 0;

  for (const char of text) {
    if (/\s/.test(char)) {
      width += fontSize * 0.34;
    } else if (/[\u4e00-\u9fff]/.test(char)) {
      width += fontSize;
    } else {
      width += fontSize * 0.58;
    }
  }

  return width;
}

const styles: Record<string, CSSProperties> = {
  root: {
    backgroundColor: '#e9e2d6',
    color: '#15130f',
    fontFamily: FONT_FAMILY,
    overflow: 'hidden',
  },
  backdropGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(180deg, rgba(36,32,22,0.048) 1px, transparent 1px), linear-gradient(90deg, rgba(36,32,22,0.032) 1px, transparent 1px)',
    backgroundSize: '72px 72px',
  },
  themeMotif: {
    position: 'absolute',
    right: 56,
    top: 142,
    fontSize: 54,
    fontWeight: 900,
    letterSpacing: 0,
    lineHeight: 1,
  },
  landscapeHeader: {
    position: 'absolute',
    top: 38,
    left: 64,
    right: 64,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(36,32,22,0.16)',
    paddingBottom: 20,
  },
  landscapeInfoPanel: {
    position: 'absolute',
    left: 64,
    top: 170,
    width: 520,
    bottom: 116,
    overflow: 'hidden',
  },
  landscapeTitle: {
    margin: '18px 0 0',
    maxWidth: 520,
    maxHeight: 172,
    color: '#15130f',
    fontSize: 58,
    fontWeight: 900,
    lineHeight: 1.08,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  landscapeLead: {
    margin: '22px 0 0',
    maxWidth: 500,
    maxHeight: 92,
    color: '#50636b',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    fontSize: 23,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  landscapeCoverLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    overflow: 'hidden',
    backgroundColor: '#e9e2d6',
  },
  landscapeCoverWatermark: {
    position: 'absolute',
    right: 70,
    top: 190,
    color: 'rgba(21,19,15,0.07)',
    fontSize: 330,
    fontWeight: 900,
    lineHeight: 0.82,
  },
  landscapeCoverHeader: {
    position: 'absolute',
    top: 52,
    left: 64,
    right: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '4px solid #15130f',
    paddingBottom: 24,
  },
  landscapeCoverTitleGroup: {
    position: 'absolute',
    top: 220,
    left: 64,
    width: 960,
  },
  landscapeCoverHeadline: {
    marginTop: 28,
    maxWidth: 940,
    color: '#15130f',
    fontSize: 92,
    fontWeight: 900,
    lineHeight: 0.98,
  },
  landscapeCoverSubline: {
    marginTop: 28,
    maxWidth: 860,
    color: '#1e313c',
    fontSize: 32,
    fontWeight: 900,
    lineHeight: 1.28,
  },
  landscapeCoverLeaderStrip: {
    position: 'absolute',
    left: 64,
    right: 64,
    bottom: 96,
    display: 'grid',
    gridTemplateColumns: '1fr 104px 1fr',
    alignItems: 'center',
    borderTop: '5px solid #15130f',
    borderBottom: '1px solid rgba(36,32,22,0.2)',
    padding: '30px 0 34px',
  },
  coverLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    overflow: 'hidden',
    backgroundColor: '#e9e2d6',
  },
  coverGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(180deg, rgba(36,32,22,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(36,32,22,0.045) 1px, transparent 1px)',
    backgroundSize: '86px 86px',
  },
  coverWatermark: {
    position: 'absolute',
    right: -32,
    top: 380,
    color: 'rgba(21,19,15,0.07)',
    fontSize: 520,
    fontWeight: 900,
    lineHeight: 0.82,
  },
  coverHeader: {
    position: 'absolute',
    top: 92,
    left: 56,
    right: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '4px solid #15130f',
    paddingBottom: 28,
  },
  coverBrand: {
    color: '#15130f',
    fontSize: 36,
    fontWeight: 900,
  },
  coverRange: {
    color: '#8a6b42',
    fontSize: 24,
    fontWeight: 900,
    textAlign: 'right',
  },
  coverTitleGroup: {
    position: 'absolute',
    top: 320,
    left: 56,
    right: 56,
  },
  coverBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#15130f',
    color: '#fffaf0',
    borderRadius: 2,
    padding: '12px 18px 11px',
    fontSize: 25,
    fontWeight: 900,
    lineHeight: 1,
  },
  coverHeadline: {
    marginTop: 30,
    maxWidth: 940,
    color: '#15130f',
    fontSize: 108,
    fontWeight: 900,
    lineHeight: 0.98,
  },
  coverSubline: {
    marginTop: 34,
    maxWidth: 820,
    color: '#1e313c',
    fontSize: 36,
    fontWeight: 900,
    lineHeight: 1.34,
  },
  coverLeaderStrip: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 500,
    display: 'grid',
    gridTemplateColumns: '1fr 104px 1fr',
    alignItems: 'center',
    borderTop: '5px solid #15130f',
    borderBottom: '1px solid rgba(36,32,22,0.2)',
    padding: '34px 0 38px',
  },
  coverLeader: {
    minWidth: 0,
  },
  coverLeaderLabel: {
    color: '#8a6b42',
    fontSize: 23,
    fontWeight: 900,
  },
  coverLeaderName: {
    marginTop: 12,
    color: '#15130f',
    fontSize: 47,
    fontWeight: 900,
    lineHeight: 1.04,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  coverLeaderValue: {
    marginTop: 10,
    color: '#50636b',
    fontSize: 25,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  coverArrow: {
    color: '#b35d45',
    fontSize: 72,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 44,
    left: 56,
    right: 56,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(36,32,22,0.16)',
    paddingBottom: 22,
  },
  brandMark: {
    fontSize: 30,
    fontWeight: 800,
  },
  brandEnglish: {
    color: '#8a6b42',
    fontSize: 20,
    fontWeight: 800,
  },
  titleBlock: {
    position: 'absolute',
    top: 280,
    left: 56,
    right: 32,
    maxHeight: 326,
    overflow: 'hidden',
    transformOrigin: 'left top',
  },
  eyebrow: {
    color: '#8a6b42',
    fontSize: 24,
    fontWeight: 900,
  },
  title: {
    margin: '20px 0 0',
    maxWidth: 992,
    maxHeight: 164,
    fontSize: 76,
    fontWeight: 900,
    lineHeight: 1.08,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  lead: {
    margin: '24px 0 0',
    maxWidth: 960,
    maxHeight: 84,
    color: '#50636b',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    fontSize: 29,
    fontWeight: 600,
    lineHeight: 1.42,
  },
  chart: {
    position: 'absolute',
    inset: 0,
  },
  landscapeChart: {
    position: 'absolute',
    inset: 0,
  },
  axisLayer: {
    position: 'absolute',
    inset: 0,
  },
  axisTick: {
    position: 'absolute',
    top: AXIS_TOP,
    bottom: AXIS_BOTTOM,
    width: 1,
  },
  axisLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(36,32,22,0.12)',
  },
  axisText: {
    position: 'absolute',
    bottom: -34,
    left: -42,
    width: 84,
    textAlign: 'center',
    color: '#8b7c67',
    fontSize: 18,
    fontWeight: 800,
  },
  landscapeAxisTick: {
    position: 'absolute',
    top: 164,
    bottom: 164,
    width: 1,
  },
  landscapeAxisText: {
    position: 'absolute',
    bottom: -32,
    left: -52,
    width: 104,
    textAlign: 'center',
    color: '#8b7c67',
    fontSize: 18,
    fontWeight: 800,
  },
  row: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    transition: 'none',
  },
  rank: {
    width: 44,
    color: '#8b7c67',
    fontSize: 24,
    fontWeight: 900,
    textAlign: 'right',
    marginRight: 18,
  },
  landscapeRow: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    transition: 'none',
  },
  landscapeRank: {
    width: 42,
    color: '#8b7c67',
    fontSize: 22,
    fontWeight: 900,
    textAlign: 'right',
    marginRight: 18,
  },
  bar: {
    height: 62,
    minWidth: 0,
    borderRadius: 4,
    boxShadow: '0 12px 26px rgba(35,45,46,0.16)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 22,
    paddingRight: 84,
    overflow: 'hidden',
  },
  landscapeBar: {
    height: 48,
    minWidth: 0,
    borderRadius: 4,
    boxShadow: '0 10px 24px rgba(35,45,46,0.14)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 18,
    paddingRight: 122,
    overflow: 'hidden',
  },
  landscapeCompactBar: {
    height: 48,
    minWidth: 0,
    borderRadius: 4,
    boxShadow: '0 10px 24px rgba(35,45,46,0.14)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  compactBar: {
    height: 62,
    minWidth: 0,
    borderRadius: 4,
    boxShadow: '0 12px 26px rgba(35,45,46,0.16)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  barName: {
    color: '#fffaf0',
    fontSize: 26,
    fontWeight: 900,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  landscapeBarName: {
    color: '#fffaf0',
    fontSize: 23,
    fontWeight: 900,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  landscapeBarMeta: {
    color: 'rgba(255,250,240,0.76)',
    fontSize: 14,
    fontWeight: 700,
    marginTop: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  landscapeBarValue: {
    position: 'absolute',
    right: 16,
    top: 14,
    color: 'rgba(255,250,240,0.92)',
    fontSize: 19,
    fontWeight: 900,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  barMeta: {
    color: 'rgba(255,250,240,0.76)',
    fontSize: 16,
    fontWeight: 700,
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  barValue: {
    position: 'absolute',
    right: 18,
    top: 18,
    color: 'rgba(255,250,240,0.92)',
    fontSize: 21,
    fontWeight: 900,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  },
  outsideLabel: {
    minWidth: 0,
    width: 'fit-content',
    maxWidth: 280,
    marginLeft: 14,
    overflow: 'hidden',
  },
  landscapeOutsideLabel: {
    minWidth: 0,
    width: 'fit-content',
    maxWidth: 300,
    marginLeft: 14,
    overflow: 'hidden',
  },
  landscapeOutsideName: {
    color: '#15130f',
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1.08,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  landscapeOutsideMeta: {
    marginTop: 3,
    color: '#6a5a45',
    fontSize: 14,
    fontWeight: 800,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  landscapeOutsideValueBlock: {
    marginLeft: 12,
    minWidth: 132,
    maxWidth: 380,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  landscapeOutsideValue: {
    color: 'rgba(21,19,15,0.78)',
    fontSize: 18,
    fontWeight: 900,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    fontFeatureSettings: '"tnum"',
  },
  landscapeOutsideValueRow: {
    minWidth: 0,
    maxWidth: 380,
    display: 'grid',
    gridTemplateColumns: '104px 14px minmax(0, 1fr)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  landscapeEntityEventSeparator: {
    color: 'rgba(36,32,22,0.32)',
    fontSize: 17,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: 'center',
  },
  landscapeEntityEventInline: {
    minWidth: 0,
    maxWidth: 230,
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  landscapeEntityEventInside: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: 3,
    padding: '9px 13px 8px',
    boxSizing: 'border-box',
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  outsideName: {
    color: '#15130f',
    fontSize: 23,
    fontWeight: 900,
    lineHeight: 1.08,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  outsideMeta: {
    marginTop: 3,
    color: '#6a5a45',
    fontSize: 14,
    fontWeight: 800,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  outsideValueBlock: {
    marginLeft: 12,
    minWidth: 148,
    maxWidth: 420,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  outsideValue: {
    color: 'rgba(21,19,15,0.82)',
    fontSize: 20,
    fontWeight: 900,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    fontFeatureSettings: '"tnum"',
  },
  eggIcon: {
    fontSize: 26,
    marginLeft: 4,
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
    lineHeight: 1,
  },
  outsideValueRow: {
    minWidth: 0,
    maxWidth: 420,
    display: 'grid',
    gridTemplateColumns: '112px 18px minmax(0, 1fr)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  entityEventSeparator: {
    color: 'rgba(36,32,22,0.32)',
    fontSize: 19,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: 'center',
  },
  entityEventInline: {
    minWidth: 0,
    maxWidth: 250,
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  entityEventInside: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    borderRadius: 3,
    padding: '9px 13px 8px',
    boxSizing: 'border-box',
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  value: {
    color: '#29251b',
    fontSize: 24,
    fontWeight: 900,
    marginLeft: 18,
    minWidth: 145,
  },
  eventCallout: {
    position: 'absolute',
    right: EVENT_RIGHT_INSET,
    bottom: 620,
    maxWidth: 560,
    padding: 0,
    textAlign: 'right',
  },
  year: {
    position: 'absolute',
    right: EVENT_RIGHT_INSET,
    bottom: 570,
    color: 'rgba(21,19,15,0.056)',
    fontSize: 172,
    fontWeight: 900,
    lineHeight: 1,
  },
  landscapeEventCallout: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 74,
    maxWidth: 500,
    paddingTop: 28,
    borderTop: '1px solid rgba(36,32,22,0.16)',
    textAlign: 'left',
  },
  eventYear: {
    color: 'rgba(138,107,66,0.78)',
    fontSize: 25,
    fontWeight: 900,
  },
  eventTitle: {
    marginTop: 6,
    color: 'rgba(21,19,15,0.58)',
    fontSize: 38,
    fontWeight: 900,
    lineHeight: 1.08,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  landscapeEventTitle: {
    marginTop: 8,
    color: 'rgba(21,19,15,0.64)',
    fontSize: 38,
    fontWeight: 900,
    lineHeight: 1.08,
  },
  landscapeEventDescription: {
    marginTop: 12,
    color: 'rgba(80,99,107,0.74)',
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.34,
  },
  eventDescription: {
    marginTop: 12,
    color: 'rgba(80,99,107,0.72)',
    fontSize: 23,
    fontWeight: 800,
    lineHeight: 1.38,
  },
  landscapeYear: {
    position: 'absolute',
    left: 500,
    bottom: 126,
    color: 'rgba(21,19,15,0.082)',
    fontSize: 170,
    fontWeight: 900,
    lineHeight: 1,
  },
  insightPanel: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 540,
    borderTop: '4px solid #15130f',
    backgroundColor: 'rgba(255,250,240,0.96)',
    padding: '32px 36px 36px',
    boxShadow: '0 28px 70px rgba(45,38,24,0.18)',
  },
  panelLabel: {
    color: '#8a6b42',
    fontSize: 24,
    fontWeight: 900,
  },
  panelText: {
    marginTop: 14,
    maxWidth: 900,
    fontSize: 37,
    fontWeight: 900,
    lineHeight: 1.35,
  },
  sourcePanel: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 520,
    borderTop: '4px solid #15130f',
    backgroundColor: 'rgba(255,250,240,0.98)',
    padding: '30px 36px 34px',
    boxShadow: '0 28px 70px rgba(45,38,24,0.18)',
  },
  sourcePanelLabel: {
    color: '#8a6b42',
    fontSize: 24,
    fontWeight: 900,
  },
  sourcePanelText: {
    marginTop: 14,
    maxWidth: 900,
    color: '#15130f',
    fontSize: 32,
    fontWeight: 900,
    lineHeight: 1.42,
    whiteSpace: 'pre-line',
  },
  closingLayer: {
    position: 'absolute',
    inset: 0,
  },
  closingVeil: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#e9e2d6',
  },
  closing: {
    position: 'absolute',
    inset: '470px 76px 620px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderTop: '5px solid #15130f',
    borderBottom: '1px solid rgba(36,32,22,0.18)',
    padding: '48px 0',
  },
  landscapeClosing: {
    position: 'absolute',
    inset: '190px 240px 190px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderTop: '5px solid #15130f',
    borderBottom: '1px solid rgba(36,32,22,0.18)',
    padding: '42px 0',
  },
  closingBrandRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  closingLogo: {
    width: 430,
    height: 108,
    objectFit: 'contain',
  },
  landscapeClosingLogo: {
    width: 390,
    height: 98,
    objectFit: 'contain',
  },
  closingBrandText: {
    maxWidth: 350,
    color: '#8a6b42',
    fontSize: 21,
    fontWeight: 900,
    lineHeight: 1.2,
    textAlign: 'right',
  },
  closingTitle: {
    marginTop: 54,
    color: '#15130f',
    fontSize: 64,
    fontWeight: 900,
    lineHeight: 1.05,
  },
  landscapeClosingTitle: {
    marginTop: 42,
    color: '#15130f',
    fontSize: 58,
    fontWeight: 900,
    lineHeight: 1.05,
  },
  closingBody: {
    marginTop: 26,
    maxWidth: 820,
    color: '#1e313c',
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1.42,
  },
  landscapeClosingBody: {
    marginTop: 22,
    maxWidth: 980,
    color: '#1e313c',
    fontSize: 31,
    fontWeight: 800,
    lineHeight: 1.36,
  },
  closingNote: {
    marginTop: 26,
    maxWidth: 880,
    color: '#6a5a45',
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.36,
    whiteSpace: 'pre-line',
  },
  landscapeClosingNote: {
    marginTop: 22,
    maxWidth: 1160,
    color: '#6a5a45',
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.34,
    whiteSpace: 'pre-line',
  },
  closingDomain: {
    marginTop: 28,
    color: '#15130f',
    fontSize: 34,
    fontWeight: 900,
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  },
  footer: {
    position: 'absolute',
    left: 56,
    right: 250,
    bottom: 48,
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 26,
    borderTop: '1px solid rgba(36,32,22,0.16)',
    paddingTop: 20,
    color: '#6a5a45',
    fontSize: 18,
    fontWeight: 800,
  },
  landscapeFooter: {
    position: 'absolute',
    left: 64,
    right: 64,
    bottom: 38,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 26,
    borderTop: '1px solid rgba(36,32,22,0.16)',
    paddingTop: 18,
    color: '#6a5a45',
    fontSize: 17,
    fontWeight: 800,
  },
};
