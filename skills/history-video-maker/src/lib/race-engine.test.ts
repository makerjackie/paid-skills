import assert from 'node:assert/strict';
import {test} from 'node:test';

import {buildRaceSnapshot, createRaceFrameMap, interpolateNumber, type RaceEngineItem} from './race-engine';

type TestItem = RaceEngineItem & {
  value: number;
};

test('display rank interpolates between frame ranks at a constant pace', () => {
  const frames = [
    {
      year: 0,
      items: [
        {code: 'a', rank: 1, value: 100},
        {code: 'b', rank: 2, value: 90},
        {code: 'c', rank: 3, value: 80},
      ],
    },
    {
      year: 1000,
      items: [
        {code: 'c', rank: 1, value: 1000},
        {code: 'b', rank: 2, value: 400},
        {code: 'a', rank: 3, value: 300},
      ],
    },
  ];

  const snapshot = buildRaceSnapshot<TestItem, {year: number}>({
    startYear: 0,
    endYear: 1000,
    frames,
    frameMap: createRaceFrameMap(frames),
    events: [],
    raceYear: 250,
    topCount: 3,
    eventDurationYears: 1,
    valueOf: (item) => item.value,
    interpolateItem: ({source, lower, upper, progress}) => ({
      ...source,
      value: interpolateNumber(lower?.value ?? 0, upper?.value ?? 0, progress),
    }),
  });

  const itemA = snapshot.items.find((item) => item.code === 'a');
  const itemC = snapshot.items.find((item) => item.code === 'c');

  assert.equal(itemA?.displayRank, 0.5);
  assert.equal(itemC?.displayRank, 1.5);
  assert.equal(snapshot.items[0]?.code, 'a');
});
