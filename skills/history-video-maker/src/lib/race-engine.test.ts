import assert from 'node:assert/strict';
import {test} from 'node:test';

import {buildRaceSnapshot, createRaceFrameMap, interpolateNumber, type RaceEngineItem} from './race-engine';

type TestItem = RaceEngineItem & {
  value: number;
};

test('display rank waits until interpolated values cross', () => {
  const frames = [
    {
      year: 0,
      items: [
        {code: 'a', rank: 1, value: 100},
        {code: 'b', rank: 2, value: 0},
      ],
    },
    {
      year: 10,
      items: [
        {code: 'b', rank: 1, value: 200},
        {code: 'a', rank: 2, value: 100},
      ],
    },
  ];

  const snapshot = buildRaceSnapshot<TestItem, {year: number}>({
    startYear: 0,
    endYear: 10,
    frames,
    frameMap: createRaceFrameMap(frames),
    events: [],
    raceYear: 4,
    topCount: 2,
    eventDurationYears: 1,
    rankTransitionProgress: 0.2,
    valueOf: (item) => item.value,
    interpolateItem: ({source, lower, upper, progress}) => ({
      ...source,
      value: interpolateNumber(lower?.value ?? 0, upper?.value ?? 0, progress),
    }),
  });

  const itemA = snapshot.items.find((item) => item.code === 'a');
  const itemB = snapshot.items.find((item) => item.code === 'b');

  assert.equal(itemA?.displayRank, 0);
  assert.equal(itemB?.displayRank, 1);
  assert.equal(snapshot.items[0]?.code, 'a');
});

test('display rank animates quickly after the value crossing point', () => {
  const frames = [
    {
      year: 0,
      items: [
        {code: 'a', rank: 1, value: 100},
        {code: 'b', rank: 2, value: 0},
      ],
    },
    {
      year: 10,
      items: [
        {code: 'b', rank: 1, value: 200},
        {code: 'a', rank: 2, value: 100},
      ],
    },
  ];

  const snapshot = buildRaceSnapshot<TestItem, {year: number}>({
    startYear: 0,
    endYear: 10,
    frames,
    frameMap: createRaceFrameMap(frames),
    events: [],
    raceYear: 6,
    topCount: 2,
    eventDurationYears: 1,
    rankTransitionProgress: 0.2,
    valueOf: (item) => item.value,
    interpolateItem: ({source, lower, upper, progress}) => ({
      ...source,
      value: interpolateNumber(lower?.value ?? 0, upper?.value ?? 0, progress),
    }),
  });

  const itemA = snapshot.items.find((item) => item.code === 'a');
  const itemB = snapshot.items.find((item) => item.code === 'b');

  assert.ok(itemA && Math.abs(itemA.displayRank - 0.875) < 0.001);
  assert.ok(itemB && Math.abs(itemB.displayRank - 0.125) < 0.001);
  assert.equal(snapshot.items[0]?.code, 'b');
});
