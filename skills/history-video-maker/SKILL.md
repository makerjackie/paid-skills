---
name: history-video-maker
description: Produce Shape of World vertical history race videos with the standalone Remotion bar-race renderer, HD235 music, event overlays, and batch rendering workflow.
---

# History Video Maker

Use this skill when creating or refining `shapeof.world` style history race videos from standalone `data/history/*.json` datasets.

## Workflow

1. Check `git status --short` first. Do not overwrite unrelated changes from other agents.
2. Use the standalone Remotion composition in `remotion/HistoryRaceVideo.tsx` and the render entrypoint in `scripts/render-history-video.ts`.
3. Use music from `public/music/` only when the file name starts with `HD235`. Treat these as the default commercial-safe tracks for this project.
4. Keep the default video vertical and native quality for final output: render the core `1080x1920` (9:16) video, then generate the default padded `1080x2400` (9:20) export for WeChat Channels and similar platforms. Use `30fps`, `h264`, `aac`, CRF around `18`. Do not pass `--scale` for final renders.
5. Do not force every final video into the same duration. By default, render without `--duration`; the script will estimate duration from the number of timeline steps at about `1.05s` per step, plus cover and closing. Use `--duration` only when the user explicitly wants a fixed length.
6. For previews, use `--scale 0.5` and a short duration only when speed matters.
7. Keep core content inside a conservative TikTok/Douyin safe area. On a 1080x1920 canvas, titles, years, bars, event text, source notes, and CTAs should stay roughly within y=280-1400. Leave about 280px at the top and 500px+ at the bottom for platform UI overlays. The bottom footer, URL, and secondary branding may remain lower because they are not critical.
8. Default to a padded export with equal blank top/bottom space: `--pad-height 2400` for `1080x2400` (9:20). Critical content should remain in the centered 1080x1920 region so platform crops mostly hit blank space. Use `--no-pad` only when the user explicitly wants 9:16 only.
9. Treat the first frame as a distribution thumbnail. It needs a platform-native hook, not a dataset title. Prefer conflict, reversal, historical turnover, or curiosity: "王座易主", "时代迁移", "彻底换人了", "正在重新洗牌".
10. Separate copy surfaces: `platformTitle` for the post title, `coverHeadline` for the thumbnail, and `hook` for the in-video title after playback starts.
11. Give titles a historical feel, but do not make them abstract labels. A cover headline must reveal the subject plus the tension in 2 lines: "谁才是 / 历史上最大的帝国？", "世界人口第一 / 真的换人了", "钢铁产量第一 / 怎么变成中国？". Avoid vague labels like "最大帝国不断易主" because viewers cannot tell why they should click.
12. For explanatory or distribution datasets that are not actually a ranking contest, use a literal title that names the subject and measure, such as "人一生中不同活动的时间占比". Do not force "race", "排位赛", "王座易主", or historical-turnover framing onto topics where viewers mainly need to understand what is being measured.
13. Use a clear information split: `coverHeadline` is the click reason, `coverSubline` is the historical hint, and `platformTitle` can be longer and more searchable. `coverHeadline` should usually be 10-18 Chinese characters across 2 lines, not 4-8 characters.
14. Keep cover and intro text controlled. `coverSubline` should be one compact phrase; visible `intro` should fit two lines above the bars. Long descriptions belong in the Markdown publishing copy, not on screen.
15. Keep the first 3 seconds fast: cover title should fill the screen, then fade quickly as the race starts. Avoid a long static intro.
16. Pick or create datasets in `data/history/*.json` with clear first-frame appeal: long time span, obvious rank turnover, strong before/after contrast, or a historically recognizable entity.
17. Events should feel like background context, not cards. Prefer right-middle or lower-right placement with low-contrast text, pulled inward from platform UI edges; keep one event per year unless the renderer supports prioritization.
18. Add dataset events when the story feels sparse. Use neutral, scoped wording and values/ranks from the matching frame where available.
19. Do not show separate insight/source cards before closing. Put data notes and source disclosure on the final closing page.
20. Closing should stay simple: larger `世界的形状` logo, `可游玩的知识宇宙`, short positioning copy, source note, and `shapeof.world`.
21. Batch renders should run sequentially to avoid Remotion cache and CPU contention.

## Commands

Render one final video. This writes both the core 9:16 video and the default 9:20 padded export:

```bash
pnpm video:history -- --slug us-stock-market-cap-race
```

Render one 9:16-only video:

```bash
pnpm video:history -- --slug us-stock-market-cap-race --no-pad
```

Render one preview:

```bash
pnpm video:history -- --slug us-stock-market-cap-race --duration 45 --scale 0.5
```

Batch render selected slugs:

```bash
set -e
for slug in world-population-race empire-area-race city-population-race energy-consumption-race steel-production-race; do
  pnpm video:history -- --slug "$slug"
done
```

Render the bundled standalone example:

```bash
pnpm video:history -- --slug southeast-asia-gdp-race
```

## Verification

Run focused checks after code or data changes:

```bash
pnpm typecheck
pnpm test
```

Check rendered files with `ffprobe`:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of json output/history-videos/us-stock-market-cap-race.mp4
```

If Remotion prints a Zod deprecation warning, note it but do not update dependencies unless the user asks for dependency work.
