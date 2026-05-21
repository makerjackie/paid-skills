import assert from 'node:assert/strict';
import {test} from 'node:test';

import {getHistoryVideoCopy} from './history-video-copy';
import type {HistoryRaceData} from '../types/history';

function createTestData(input?: Partial<HistoryRaceData>): HistoryRaceData {
  const baseEntity = {
    code: 'a',
    iso2: 'AA',
    name: '甲城',
    nameEn: 'City A',
    region: '测试',
  };

  return {
    slug: 'test-long-title-race',
    title: '一个非常非常长的城市 GDP 排位赛标题',
    titleEn: 'Test Race',
    sourceLabel: 'Test source',
    sourceLabelEn: 'Test source',
    sourceUrl: 'https://example.com',
    unit: '元',
    unitShort: '元',
    startYear: 2000,
    endYear: 2020,
    entities: [baseEntity],
    frames: [
      {
        year: 2000,
        total: 100,
        items: [{...baseEntity, value: 100, rank: 1, share: 1, rankDelta: 0}],
      },
      {
        year: 2020,
        total: 200,
        items: [{...baseEntity, value: 200, rank: 1, share: 1, rankDelta: 0}],
      },
    ],
    events: [],
    ...input,
  };
}

test('default cover headline stays within two compact lines', () => {
  const copy = getHistoryVideoCopy(createTestData());
  const lines = copy.coverHeadline.split('\n');

  assert.ok(lines.length <= 2);
  assert.ok(lines.every((line) => line.length <= 11));
});

test('in-video race title uses a compact first clause', () => {
  const copy = getHistoryVideoCopy(
    createTestData({
      slug: 'jiangsu-gdp-race',
      title: '江苏不同城市 GDP 排位赛',
    }),
  );

  assert.equal(copy.hook, '江苏13市GDP排名');
});
