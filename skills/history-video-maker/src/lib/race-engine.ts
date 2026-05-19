export type RaceEngineItem = {
  code: string;
  rank: number;
};

export type RaceEngineFrame<TItem extends RaceEngineItem> = {
  year: number;
  total?: number;
  items: TItem[];
};

export type RaceEngineEvent = {
  year: number;
};

export type RaceDisplayItem<TItem extends RaceEngineItem> = TItem & {
  displayRank: number;
  rankShift: number;
};

export type RaceSnapshot<TItem extends RaceEngineItem, TEvent extends RaceEngineEvent> = {
  year: number;
  yearLabel: string;
  total: number;
  axisMax: number;
  items: RaceDisplayItem<TItem>[];
  event: TEvent | null;
};

export type BuildRaceSnapshotOptions<TItem extends RaceEngineItem, TEvent extends RaceEngineEvent> = {
  startYear: number;
  endYear: number;
  frames: RaceEngineFrame<TItem>[];
  frameMap: Map<number, RaceEngineFrame<TItem>>;
  events: TEvent[];
  raceYear: number;
  topCount: number;
  eventDurationYears: number;
  axisPadding?: number;
  axisRetreatThreshold?: number;
  rankTransitionProgress?: number;
  valueOf: (item: TItem) => number;
  interpolateItem: (input: {
    source: TItem;
    lower: TItem | undefined;
    upper: TItem | undefined;
    progress: number;
  }) => TItem;
};

export function createRaceFrameMap<TItem extends RaceEngineItem>(
  frames: RaceEngineFrame<TItem>[],
) {
  return new Map(frames.map((frame) => [frame.year, frame]));
}

export function buildRaceSnapshot<TItem extends RaceEngineItem, TEvent extends RaceEngineEvent>({
  startYear,
  endYear,
  frames,
  frameMap,
  events,
  raceYear,
  topCount,
  eventDurationYears,
  axisPadding = 1.08,
  axisRetreatThreshold = 0.2,
  rankTransitionProgress,
  valueOf,
  interpolateItem,
}: BuildRaceSnapshotOptions<TItem, TEvent>): RaceSnapshot<TItem, TEvent> {
  const normalizedRaceYear = normalizeRaceYear(raceYear, startYear, endYear);
  const {lowerFrame, upperFrame} = getBoundingFrames(frames, frameMap, normalizedRaceYear);
  const lowerYear = lowerFrame?.year ?? startYear;
  const upperYear = upperFrame?.year ?? lowerYear;
  const progress = upperYear === lowerYear ? 0 : (normalizedRaceYear - lowerYear) / (upperYear - lowerYear);
  const lowerItems = new Map((lowerFrame?.items ?? []).map((item) => [item.code, item]));
  const upperItems = new Map((upperFrame?.items ?? []).map((item) => [item.code, item]));
  const codes = getRaceCodes(lowerItems, upperItems, progress);
  const rankChangeBoundaries = getRankChangeBoundaries(codes, lowerItems, upperItems, valueOf);
  const total = interpolateNumber(
    lowerFrame?.total ?? 0,
    upperFrame?.total ?? lowerFrame?.total ?? 0,
    progress,
  );
  const offChartRank = Math.max(lowerFrame?.items.length ?? 0, upperFrame?.items.length ?? 0, topCount) + 1;
  const rankedItems = [...codes]
    .map((code) => {
      const lower = lowerItems.get(code);
      const upper = upperItems.get(code);
      const source = upper ?? lower;

      if (!source) {
        return null;
      }

      const lowerRank = lower?.rank ?? offChartRank;
      const upperRank = upper?.rank ?? offChartRank;
      const item = interpolateItem({source, lower, upper, progress});

      return {
        ...item,
        rank: 0,
        displayRank: 0,
        rankShift: lowerRank - upperRank,
      } satisfies RaceDisplayItem<TItem>;
    })
    .filter((item): item is RaceDisplayItem<TItem> => Boolean(item))
    .sort((left, right) => valueOf(right) - valueOf(left))
    .map((item, index) => ({...item, rank: index + 1}));
  const displayItems = rankedItems.map((item) => ({
    ...item,
    displayRank: getCrossingAwareDisplayRank({
      code: item.code,
      codes,
      lowerItems,
      upperItems,
      offChartRank,
      progress,
      transitionProgress: rankTransitionProgress ?? 0.2,
      rankChangeBoundaries,
      valueOf,
    }),
  }));
  const items = [...displayItems]
    .sort((left, right) => left.displayRank - right.displayRank)
    .slice(0, topCount);
  const topValue = rankedItems[0] ? valueOf(rankedItems[0]) : 1;
  const axisTopValue = getStableAxisTopValue({
    frames,
    raceYear: normalizedRaceYear,
    currentTopValue: topValue,
    retreatThreshold: axisRetreatThreshold,
    valueOf,
  });
  const event =
    events
      .filter((item) => normalizedRaceYear >= item.year && normalizedRaceYear < item.year + eventDurationYears)
      .sort((left, right) => right.year - left.year)[0] ?? null;

  return {
    year: normalizedRaceYear,
    yearLabel: String(Math.floor(normalizedRaceYear)),
    total,
    axisMax: axisTopValue * axisPadding,
    items,
    event,
  };
}

export function getRaceAxisTicks(axisMax: number) {
  return getStableTickCandidates(axisMax);
}

export function interpolateNumber(left: number, right: number, progress: number) {
  return left + (right - left) * progress;
}

function normalizeRaceYear(raceYear: number, startYear: number, endYear: number) {
  const finiteRaceYear = Number.isFinite(raceYear) ? raceYear : startYear;

  return Math.min(endYear, Math.max(startYear, finiteRaceYear));
}

function normalizeProgress(progress: number) {
  const finiteProgress = Number.isFinite(progress) ? progress : 0;

  return Math.min(1, Math.max(0, finiteProgress));
}

function getCrossingAwareDisplayRank<TItem extends RaceEngineItem>({
  code,
  codes,
  lowerItems,
  upperItems,
  offChartRank,
  progress,
  transitionProgress,
  rankChangeBoundaries,
  valueOf,
}: {
  code: string;
  codes: Set<string>;
  lowerItems: Map<string, TItem>;
  upperItems: Map<string, TItem>;
  offChartRank: number;
  progress: number;
  transitionProgress: number;
  rankChangeBoundaries: number[];
  valueOf: (item: TItem) => number;
}) {
  const normalizedProgress = normalizeProgress(progress);
  const segmentStart = getRankChangeStartForCode({
    code,
    codes,
    lowerItems,
    upperItems,
    offChartRank,
    progress: normalizedProgress,
    rankChangeBoundaries,
    valueOf,
  });
  const targetRank = getValueRankAtProgress(code, codes, lowerItems, upperItems, offChartRank, normalizedProgress, valueOf);

  if (segmentStart <= 0) {
    return targetRank - 1;
  }

  const rankBefore = getValueRankAtProgress(
    code,
    codes,
    lowerItems,
    upperItems,
    offChartRank,
    Math.max(0, segmentStart - 0.00001),
    valueOf,
  );
  const rankAfter = getValueRankAtProgress(
    code,
    codes,
    lowerItems,
    upperItems,
    offChartRank,
    Math.min(1, segmentStart + 0.00001),
    valueOf,
  );

  if (rankBefore === rankAfter) {
    return targetRank - 1;
  }

  const localProgress = normalizeProgress((normalizedProgress - segmentStart) / Math.max(0.001, transitionProgress));

  return interpolateNumber(rankBefore - 1, rankAfter - 1, easeOutCubic(localProgress));
}

function getRankChangeStartForCode<TItem extends RaceEngineItem>({
  code,
  codes,
  lowerItems,
  upperItems,
  offChartRank,
  progress,
  rankChangeBoundaries,
  valueOf,
}: {
  code: string;
  codes: Set<string>;
  lowerItems: Map<string, TItem>;
  upperItems: Map<string, TItem>;
  offChartRank: number;
  progress: number;
  rankChangeBoundaries: number[];
  valueOf: (item: TItem) => number;
}) {
  let rankChangeStart = 0;

  for (const boundary of rankChangeBoundaries) {
    if (boundary > progress) {
      break;
    }

    const rankBefore = getValueRankAtProgress(
      code,
      codes,
      lowerItems,
      upperItems,
      offChartRank,
      Math.max(0, boundary - 0.00001),
      valueOf,
    );
    const rankAfter = getValueRankAtProgress(
      code,
      codes,
      lowerItems,
      upperItems,
      offChartRank,
      Math.min(1, boundary + 0.00001),
      valueOf,
    );

    if (rankBefore !== rankAfter) {
      rankChangeStart = boundary;
    }
  }

  return rankChangeStart;
}

function getRankChangeBoundaries<TItem extends RaceEngineItem>(
  codes: Set<string>,
  lowerItems: Map<string, TItem>,
  upperItems: Map<string, TItem>,
  valueOf: (item: TItem) => number,
) {
  const codeList = [...codes];
  const boundaries: number[] = [];

  for (let leftIndex = 0; leftIndex < codeList.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < codeList.length; rightIndex += 1) {
      const leftCode = codeList[leftIndex];
      const rightCode = codeList[rightIndex];
      const leftStart = getRaceValueAtProgress(leftCode, lowerItems, upperItems, 0, valueOf);
      const leftEnd = getRaceValueAtProgress(leftCode, lowerItems, upperItems, 1, valueOf);
      const rightStart = getRaceValueAtProgress(rightCode, lowerItems, upperItems, 0, valueOf);
      const rightEnd = getRaceValueAtProgress(rightCode, lowerItems, upperItems, 1, valueOf);
      const startDelta = leftStart - rightStart;
      const endDelta = leftEnd - rightEnd;

      if (startDelta === 0 || endDelta === 0 || Math.sign(startDelta) === Math.sign(endDelta)) {
        continue;
      }

      const denominator = startDelta - endDelta;
      const boundary = denominator === 0 ? null : startDelta / denominator;

      if (boundary !== null && boundary > 0 && boundary < 1) {
        boundaries.push(boundary);
      }
    }
  }

  return [...new Set(boundaries.map((boundary) => Number(boundary.toFixed(5))))].sort((left, right) => left - right);
}

function getValueRankAtProgress<TItem extends RaceEngineItem>(
  code: string,
  codes: Set<string>,
  lowerItems: Map<string, TItem>,
  upperItems: Map<string, TItem>,
  offChartRank: number,
  progress: number,
  valueOf: (item: TItem) => number,
) {
  const rankedCodes = [...codes].sort((leftCode, rightCode) => {
    const valueDelta =
      getRaceValueAtProgress(rightCode, lowerItems, upperItems, progress, valueOf) -
      getRaceValueAtProgress(leftCode, lowerItems, upperItems, progress, valueOf);

    if (Math.abs(valueDelta) > Number.EPSILON) {
      return valueDelta;
    }

    return (lowerItems.get(leftCode)?.rank ?? offChartRank) - (lowerItems.get(rightCode)?.rank ?? offChartRank);
  });

  const index = rankedCodes.indexOf(code);

  return index >= 0 ? index + 1 : offChartRank;
}

function getRaceValueAtProgress<TItem extends RaceEngineItem>(
  code: string,
  lowerItems: Map<string, TItem>,
  upperItems: Map<string, TItem>,
  progress: number,
  valueOf: (item: TItem) => number,
) {
  const lower = lowerItems.get(code);
  const upper = upperItems.get(code);
  const lowerValue = lower ? valueOf(lower) : 0;
  const upperValue = upper ? valueOf(upper) : 0;

  return interpolateNumber(lowerValue, upperValue, progress);
}

function easeOutCubic(progress: number) {
  const inverted = 1 - normalizeProgress(progress);

  return 1 - inverted * inverted * inverted;
}

function getBoundingFrames<TItem extends RaceEngineItem>(
  frames: RaceEngineFrame<TItem>[],
  frameMap: Map<number, RaceEngineFrame<TItem>>,
  raceYear: number,
) {
  const exactFrame = frameMap.get(Math.floor(raceYear));

  if (exactFrame) {
    const nextFrame = frames.find((frame) => frame.year > exactFrame.year);

    return {
      lowerFrame: exactFrame,
      upperFrame: nextFrame ?? exactFrame,
    };
  }

  let lowerFrame = frames[0];
  let upperFrame = frames[frames.length - 1] ?? lowerFrame;

  for (const frame of frames) {
    if (frame.year <= raceYear) {
      lowerFrame = frame;
    }

    if (frame.year >= raceYear) {
      upperFrame = frame;
      break;
    }
  }

  return {
    lowerFrame,
    upperFrame,
  };
}

function getRaceCodes<TItem>(
  lowerItems: Map<string, TItem>,
  upperItems: Map<string, TItem>,
  progress: number,
) {
  if (progress <= 0) {
    return new Set(lowerItems.keys());
  }

  if (progress >= 1) {
    return new Set(upperItems.keys());
  }

  return new Set([...lowerItems.keys(), ...upperItems.keys()]);
}

function getStableAxisTopValue<TItem extends RaceEngineItem>({
  frames,
  raceYear,
  currentTopValue,
  retreatThreshold,
  valueOf,
}: {
  frames: RaceEngineFrame<TItem>[];
  raceYear: number;
  currentTopValue: number;
  retreatThreshold: number;
  valueOf: (item: TItem) => number;
}) {
  const finiteCurrentTopValue = Number.isFinite(currentTopValue) && currentTopValue > 0 ? currentTopValue : 1;
  const normalizedThreshold = Number.isFinite(retreatThreshold)
    ? Math.min(0.95, Math.max(0, retreatThreshold))
    : 0;
  const historicalTopValue = frames.reduce((maxValue, frame) => {
    if (frame.year > raceYear) {
      return maxValue;
    }

    const frameTopValue = frame.items.reduce(
      (frameMaxValue, item) => {
        const itemValue = valueOf(item);

        return Number.isFinite(itemValue)
          ? Math.max(frameMaxValue, itemValue)
          : frameMaxValue;
      },
      0,
    );

    return Math.max(maxValue, frameTopValue);
  }, finiteCurrentTopValue);

  if (normalizedThreshold === 0) {
    return finiteCurrentTopValue;
  }

  const holdFloor = historicalTopValue * (1 - normalizedThreshold);

  if (finiteCurrentTopValue >= holdFloor) {
    return historicalTopValue;
  }

  return finiteCurrentTopValue / (1 - normalizedThreshold);
}

function getStableTickCandidates(axisMax: number) {
  const ticks: number[] = [];
  const minExponent = 8;
  const maxExponent = Math.ceil(Math.log10(axisMax)) + 1;

  for (let exponent = minExponent; exponent <= maxExponent; exponent += 1) {
    const base = 10 ** exponent;

    for (const multiplier of [1, 2, 5]) {
      const tick = multiplier * base;

      if (tick < axisMax) {
        ticks.push(tick);
      }
    }
  }

  return ticks.sort((left, right) => left - right);
}
