import assert from 'node:assert/strict';
import {test} from 'node:test';

import russiaTradeData from '../../data/history/russia-trade-race.json';
import militarySpendingData from '../../data/history/global-military-spending-race.json';
import {resolveHistoryVideoMusicTrack} from './history-video-music';
import {resolveHistoryVideoTheme} from './history-video-theme';
import type {HistoryRaceData} from '../types/history';

const russiaTrade = russiaTradeData as HistoryRaceData;
const militarySpending = militarySpendingData as HistoryRaceData;

test('resolves culturally specific music and UI theme for Russia datasets', () => {
  const track = resolveHistoryVideoMusicTrack(russiaTrade);
  const theme = resolveHistoryVideoTheme(russiaTrade);

  assert.equal(track.id, 'hd235-violin-epic');
  assert.equal(theme.id, 'russian-north');
});

test('manual music override wins over dataset theme', () => {
  const track = resolveHistoryVideoMusicTrack(russiaTrade, 'hd235-bright-life');

  assert.equal(track.id, 'hd235-bright-life');
});

test('war and military datasets use a heavier treatment', () => {
  const track = resolveHistoryVideoMusicTrack(militarySpending);
  const theme = resolveHistoryVideoTheme(militarySpending);

  assert.equal(track.id, 'hd235-epic-inspire');
  assert.equal(theme.id, 'war-room');
});
