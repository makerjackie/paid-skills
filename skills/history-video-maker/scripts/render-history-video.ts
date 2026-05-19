import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildHistoryVideoMarkdown, getHistoryVideoCopy} from '../src/lib/history-video-copy';
import {
  HISTORY_RACE_VIDEO_SECONDS_PER_TIMELINE_STEP,
  estimateHistoryRaceVideoDuration,
  resolveHistoryRaceVideoDuration,
} from '../src/lib/history-video-duration';
import {resolveHistoryVideoMusicTrack} from '../src/lib/history-video-music';
import {resolveHistoryVideoTheme} from '../src/lib/history-video-theme';
import type {HistoryRaceData} from '../src/types/history';

type CliOptions = {
  slug: string;
  all: boolean;
  copyOnly: boolean;
  durationSeconds?: number;
  musicId?: string;
  outputDir?: string;
  padHeight: number | null;
  renderLandscape: boolean;
  scale: string;
  themeId?: string;
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data/history');
const COPY_PATH = path.join(ROOT, 'docs/history-video-copy.md');
const PLAYWRIGHT_HEADLESS_SHELL_PATH =
  path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const MACOS_CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function main() {
  const options = parseArgs(process.argv.slice(2));
  const datasets = options.all ? loadAllDatasets() : [loadDataset(options.slug)];
  const outputDir = resolveOutputDir(options.outputDir);
  const propsDir = path.join(outputDir, 'props');

  writeCopyMarkdown(loadAllDatasets());

  if (options.copyOnly) {
    console.log(`Wrote ${COPY_PATH}`);
    return;
  }

  mkdirSync(propsDir, {recursive: true});

  for (const dataset of datasets) {
    const propsPath = path.join(propsDir, `${dataset.slug}.json`);
    const outputPath = path.join(outputDir, `${dataset.slug}.mp4`);
    const copy = getHistoryVideoCopy(dataset);
    const track = resolveHistoryVideoMusicTrack(dataset, options.musicId ?? dataset.musicId);
    const theme = resolveHistoryVideoTheme(dataset, options.themeId ?? dataset.themeId);
    const renderPanels = {
      showInsightPanel: false,
      showSourcePanel: false,
    };
    const estimatedDurationSeconds = estimateHistoryRaceVideoDuration(dataset, renderPanels);
    const durationSeconds = resolveHistoryRaceVideoDuration({
      data: dataset,
      durationSeconds: options.durationSeconds,
      ...renderPanels,
    });

    if (options.durationSeconds === undefined) {
      console.log(
        `Auto duration: ${durationSeconds}s (${Math.max(1, dataset.frames.length - 1)} timeline steps at ${HISTORY_RACE_VIDEO_SECONDS_PER_TIMELINE_STEP}s/step)`,
      );
    } else if (durationSeconds !== options.durationSeconds) {
      console.log(`Requested duration ${options.durationSeconds}s clamped to ${durationSeconds}s`);
    } else {
      console.log(`Manual duration: ${durationSeconds}s (auto estimate would be ${estimatedDurationSeconds}s)`);
    }

    writeFileSync(
      propsPath,
      JSON.stringify(
        {
          slug: dataset.slug,
          data: dataset,
          copy,
          durationSeconds,
          musicId: track.id,
          musicSrc: track.src,
          themeId: theme.id,
        },
        null,
        2,
      ),
    );

    console.log(`Rendering ${dataset.slug} with ${track.label} / ${theme.label}`);
    runRemotionRender({
      compositionId: 'HistoryRaceVideo',
      outputPath,
      propsPath,
      scale: options.scale,
      port: 3109,
    });
    console.log(`Wrote ${outputPath}`);

    if (options.padHeight) {
      const paddedOutputPath = getPaddedOutputPath(outputPath, options.padHeight);
      padVideoHeight({
        inputPath: outputPath,
        outputPath: paddedOutputPath,
        height: options.padHeight,
        color: theme.background,
      });
      console.log(`Wrote ${paddedOutputPath}`);
    }

    if (options.renderLandscape) {
      const landscapeOutputPath = getLandscapeOutputPath(outputPath);
      runRemotionRender({
        compositionId: 'HistoryRaceVideoLandscape',
        outputPath: landscapeOutputPath,
        propsPath,
        scale: options.scale,
        port: 3110,
      });
      console.log(`Wrote ${landscapeOutputPath}`);
    }
  }
}

function loadAllDatasets() {
  if (!existsSync(DATA_DIR)) {
    throw new Error(`Missing data directory: ${DATA_DIR}`);
  }

  return readdirSync(DATA_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(path.join(DATA_DIR, name), 'utf8')) as HistoryRaceData);
}

function loadDataset(slug: string) {
  const filePath = path.join(DATA_DIR, `${slug}.json`);

  if (!existsSync(filePath)) {
    throw new Error(`Unknown history race slug: ${slug}`);
  }

  return JSON.parse(readFileSync(filePath, 'utf8')) as HistoryRaceData;
}

function writeCopyMarkdown(datasets: HistoryRaceData[]) {
  const content = [
    '# Shape of World 历史视频发布文案',
    '',
    '这个文件用于批量发布 history race 视频。每个主题都保留互动地址和原始数据来源。',
    '',
    datasets.map((dataset) => buildHistoryVideoMarkdown(dataset)).join('\n\n'),
    '',
  ].join('\n');

  mkdirSync(path.dirname(COPY_PATH), {recursive: true});
  writeFileSync(COPY_PATH, content);
}

function runRemotionRender({
  compositionId,
  outputPath,
  propsPath,
  scale,
  port,
}: {
  compositionId: 'HistoryRaceVideo' | 'HistoryRaceVideoLandscape';
  outputPath: string;
  propsPath: string;
  scale: string;
  port: number;
}) {
  mkdirSync(path.dirname(outputPath), {recursive: true});

  const args = [
    'exec',
    'remotion',
    'render',
    'remotion/index.ts',
    compositionId,
    outputPath,
    `--props=${propsPath}`,
    '--codec=h264',
    '--audio-codec=aac',
    '--crf=18',
    '--overwrite',
    '--log=info',
    `--port=${port}`,
    '--ipv4',
  ];

  if (scale !== '1') {
    args.push(`--scale=${scale}`);
  }

  const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ??
    (existsSync(PLAYWRIGHT_HEADLESS_SHELL_PATH) ? PLAYWRIGHT_HEADLESS_SHELL_PATH : null) ??
    (existsSync(MACOS_CHROME_PATH) ? MACOS_CHROME_PATH : null);

  if (browserExecutable) {
    args.push(`--browser-executable=${browserExecutable}`);
  }

  const result = spawnSync('pnpm', args, {
    cwd: ROOT,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`Remotion render failed with exit code ${result.status}`);
  }
}

function getPaddedOutputPath(outputPath: string, height: number) {
  return outputPath.replace(/\.mp4$/, `-padded-1080x${height}.mp4`);
}

function getLandscapeOutputPath(outputPath: string) {
  return outputPath.replace(/\.mp4$/, '-landscape-1920x1080.mp4');
}

function padVideoHeight({
  inputPath,
  outputPath,
  height,
  color,
}: {
  inputPath: string;
  outputPath: string;
  height: number;
  color: string;
}) {
  const result = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      inputPath,
      '-vf',
      `pad=iw:${height}:0:(oh-ih)/2:color=${toFfmpegHexColor(color)}`,
      '-c:v',
      'libx264',
      '-crf',
      '18',
      '-preset',
      'medium',
      '-c:a',
      'copy',
      '-movflags',
      '+faststart',
      outputPath,
    ],
    {
      cwd: ROOT,
      stdio: 'inherit',
    },
  );

  if (result.status !== 0) {
    throw new Error(`ffmpeg padding failed with exit code ${result.status}`);
  }
}

function toFfmpegHexColor(color: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return `0x${color.slice(1)}`;
  }

  return color;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    slug: 'southeast-asia-gdp-race',
    all: false,
    copyOnly: false,
    padHeight: 2400,
    renderLandscape: true,
    scale: '1',
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === '--all') {
      options.all = true;
      continue;
    }

    if (arg === '--copy-only') {
      options.copyOnly = true;
      continue;
    }

    if (arg === '--slug' && next) {
      options.slug = next;
      index += 1;
      continue;
    }

    if (arg.startsWith('--slug=')) {
      options.slug = arg.slice('--slug='.length);
      continue;
    }

    if (arg === '--music' && next) {
      options.musicId = next;
      index += 1;
      continue;
    }

    if (arg.startsWith('--music=')) {
      options.musicId = arg.slice('--music='.length);
      continue;
    }

    if (arg === '--theme' && next) {
      options.themeId = next;
      index += 1;
      continue;
    }

    if (arg.startsWith('--theme=')) {
      options.themeId = arg.slice('--theme='.length);
      continue;
    }

    if (arg === '--duration' && next) {
      options.durationSeconds = parseDuration(next);
      index += 1;
      continue;
    }

    if (arg.startsWith('--duration=')) {
      options.durationSeconds = parseDuration(arg.slice('--duration='.length));
      continue;
    }

    if (arg === '--pad-height' && next) {
      options.padHeight = parsePadHeight(next);
      index += 1;
      continue;
    }

    if (arg.startsWith('--pad-height=')) {
      options.padHeight = parsePadHeight(arg.slice('--pad-height='.length));
      continue;
    }

    if (arg === '--output-dir' && next) {
      options.outputDir = next;
      index += 1;
      continue;
    }

    if (arg.startsWith('--output-dir=')) {
      options.outputDir = arg.slice('--output-dir='.length);
      continue;
    }

    if (arg === '--no-pad') {
      options.padHeight = null;
      continue;
    }

    if (arg === '--no-landscape') {
      options.renderLandscape = false;
      continue;
    }

    if (arg === '--scale' && next) {
      options.scale = next;
      index += 1;
      continue;
    }

    if (arg.startsWith('--scale=')) {
      options.scale = arg.slice('--scale='.length);
    }
  }

  return options;
}

function resolveOutputDir(outputDir?: string) {
  if (outputDir) {
    return path.resolve(process.cwd(), outputDir);
  }

  const invocationCwd = process.env.INIT_CWD;
  const baseDir = invocationCwd && path.resolve(invocationCwd) !== ROOT
    ? invocationCwd
    : process.cwd();

  return path.join(baseDir, 'output');
}

function parsePadHeight(value: string) {
  if (value === 'none' || value === 'false' || value === '0') {
    return null;
  }

  const height = Number(value);

  if (!Number.isInteger(height) || height <= 0) {
    throw new Error(`Invalid --pad-height value: ${value}`);
  }

  return height;
}

function parseDuration(value: string) {
  if (value === 'auto') {
    return undefined;
  }

  const duration = Number(value);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Invalid --duration value: ${value}`);
  }

  return duration;
}

main();
