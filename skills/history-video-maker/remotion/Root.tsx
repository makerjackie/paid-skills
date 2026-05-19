import {Composition, type CalculateMetadataFunction} from 'remotion';

import {
  DEFAULT_HISTORY_RACE_VIDEO_PROPS,
  HISTORY_RACE_VIDEO_FPS,
  HISTORY_RACE_VIDEO_HEIGHT,
  HISTORY_RACE_VIDEO_LANDSCAPE_HEIGHT,
  HISTORY_RACE_VIDEO_LANDSCAPE_WIDTH,
  HISTORY_RACE_VIDEO_WIDTH,
  HistoryRaceVideo,
  HistoryRaceVideoLandscape,
  type HistoryRaceVideoProps,
  resolveHistoryRaceVideoDurationFromProps,
} from './HistoryRaceVideo';

const calculateMetadata: CalculateMetadataFunction<HistoryRaceVideoProps> = ({props}) => ({
  durationInFrames: resolveHistoryRaceVideoDurationFromProps(props) * HISTORY_RACE_VIDEO_FPS,
});

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="HistoryRaceVideo"
        component={HistoryRaceVideo}
        calculateMetadata={calculateMetadata}
        durationInFrames={resolveHistoryRaceVideoDurationFromProps(DEFAULT_HISTORY_RACE_VIDEO_PROPS) * HISTORY_RACE_VIDEO_FPS}
        fps={HISTORY_RACE_VIDEO_FPS}
        height={HISTORY_RACE_VIDEO_HEIGHT}
        width={HISTORY_RACE_VIDEO_WIDTH}
        defaultProps={DEFAULT_HISTORY_RACE_VIDEO_PROPS}
      />
      <Composition
        id="HistoryRaceVideoLandscape"
        component={HistoryRaceVideoLandscape}
        calculateMetadata={calculateMetadata}
        durationInFrames={resolveHistoryRaceVideoDurationFromProps(DEFAULT_HISTORY_RACE_VIDEO_PROPS) * HISTORY_RACE_VIDEO_FPS}
        fps={HISTORY_RACE_VIDEO_FPS}
        height={HISTORY_RACE_VIDEO_LANDSCAPE_HEIGHT}
        width={HISTORY_RACE_VIDEO_LANDSCAPE_WIDTH}
        defaultProps={DEFAULT_HISTORY_RACE_VIDEO_PROPS}
      />
    </>
  );
}
