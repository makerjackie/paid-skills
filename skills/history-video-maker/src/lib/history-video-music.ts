export const HISTORY_VIDEO_MUSIC_TRACKS = [
  {
    id: 'hd235-epic-inspire',
    label: '大气震撼史诗宣传励志',
    src: '/music/HD235大气震撼史诗宣传励志.mp3',
  },
  {
    id: 'hd235-bold-forward',
    label: '大气宣传勇往直前',
    src: '/music/HD235大气宣传勇往直前.mp3',
  },
  {
    id: 'hd235-violin-epic',
    label: '大气宣传小提琴史诗',
    src: '/music/HD235大气宣传小提琴史诗.mp3',
  },
  {
    id: 'hd235-riding-waves',
    label: '大气震撼宣传乘风破浪',
    src: '/music/HD235大气震撼宣传乘风破浪.mp3',
  },
  {
    id: 'hd235-uplifting-2',
    label: '大气震撼宣传鼓舞人心2',
    src: '/music/HD235大气震撼宣传鼓舞人心2.mp3',
  },
  {
    id: 'hd235-bright-life',
    label: '轻快愉悦美好生活',
    src: '/music/HD235轻快愉悦美好生活.mp3',
  },
] as const;

export const DEFAULT_HISTORY_VIDEO_MUSIC_ID = 'hd235-epic-inspire';

export type HistoryVideoMusicTrack = (typeof HISTORY_VIDEO_MUSIC_TRACKS)[number];
export type HistoryVideoMusicTrackId = HistoryVideoMusicTrack['id'];

export function getHistoryVideoMusicTrack(id?: string | null) {
  return (
    HISTORY_VIDEO_MUSIC_TRACKS.find((track) => track.id === id) ??
    HISTORY_VIDEO_MUSIC_TRACKS.find((track) => track.id === DEFAULT_HISTORY_VIDEO_MUSIC_ID) ??
    HISTORY_VIDEO_MUSIC_TRACKS[0]
  );
}

export function toRemotionStaticFilePath(src: string) {
  return src.replace(/^\//, '');
}
