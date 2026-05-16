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
  const total = interpolateNumber(
    lowerFrame?.total ?? 0,
    upperFrame?.total ?? lowerFrame?.total ?? 0,
    progress,
  );
  const easedProgress = easeInOutCubic(progress);
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
        displayRank: interpolateNumber(lowerRank - 1, upperRank - 1, easedProgress),
        rankShift: lowerRank - upperRank,
      } satisfies RaceDisplayItem<TItem>;
    })
    .filter((item): item is RaceDisplayItem<TItem> => Boolean(item))
    .sort((left, right) => valueOf(right) - valueOf(left))
    .map((item, index) => ({...item, rank: index + 1}));
  const items = [...rankedItems]
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

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - ((-2 * value + 2) ** 3) / 2;
}

function normalizeRaceYear(raceYear: number, startYear: number, endYear: number) {
  const finiteRaceYear = Number.isFinite(raceYear) ? raceYear : startYear;

  return Math.min(endYear, Math.max(startYear, finiteRaceYear));
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
