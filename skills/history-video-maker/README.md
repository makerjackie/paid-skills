# History Video Maker

Standalone Remotion workflow for producing Shape of World style vertical history race videos.

## Install

```bash
npx skills add makerjackie/paid-skills --skill history-video-maker
```

## Render

```bash
pnpm install
pnpm video:history -- --slug southeast-asia-gdp-race
```

Add new datasets as `data/history/<slug>.json`, then render with `--slug <slug>`.
