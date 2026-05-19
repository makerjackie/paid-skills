---
name: history-video-maker
description: Generate self-contained 9:20 vertical data ranking videos from topics or time-series datasets using the bundled Remotion renderer, sample data, music, logo, and publishing-safe mobile layout.
---

# History Video Maker

Use this skill to generate vertical data ranking videos. The skill folder is self-contained: renderer code, sample data, logo, music, and scripts live beside this `SKILL.md`. Do not depend on the original `shapeof.world` repository.

## Workflow

1. Locate the installed skill directory, usually `~/.agents/skills/history-video-maker` for Codex-style installs. If this skill is installed elsewhere, use the directory containing this `SKILL.md`.
2. Run `pnpm install` in the skill directory before the first render.
3. Use the bundled Remotion composition in `remotion/HistoryRaceVideo.tsx` and entrypoint `scripts/render-history-video.ts`.
4. Use music from `public/music/` only when the file name starts with `HD235`. Treat these as the default commercial-safe tracks for this package.
5. Match audio to the dataset theme instead of reusing one default track. The renderer auto-selects a track from the dataset title, summary, entities, events, and `valueKind`; use `--music` only for a deliberate manual override. Region-specific topics should feel culturally specific where the bundle allows it: Russia / Soviet / Russian datasets should use `hd235-violin-epic`; war or military datasets should use `hd235-epic-inspire`; trade and shipping datasets should use `hd235-riding-waves`; tech / creator / AI datasets can use the lighter track.
6. Let small UI accents follow the same theme. The renderer auto-selects a visual theme such as `russian-north`, `war-room`, `trade-route`, or `tech-signal`, changing accent colors, the cover watermark, and the small motif. Use `--theme` only when the automatic theme is wrong.
7. Keep the default video exports native quality: render the core `1080x1920` (9:16) video, generate the default padded `1080x2400` (9:20) export for WeChat Channels and similar platforms, and render a separate `1920x1080` (16:9) landscape export for desktop/video sites. Use `30fps`, `h264`, `aac`, CRF around `18`. Do not pass `--scale` for final renders.
8. Do not force every final video into the same duration. By default, render without `--duration`; the script will estimate duration from the number of timeline steps at about `1.65s` per timeline step, plus cover and closing. Use `--duration` only when the user explicitly wants a fixed length.
9. For previews, use `--scale 0.5` and a short duration only when speed matters.
10. Keep core content inside a conservative TikTok/Douyin safe area. On a 1080x1920 canvas, titles, years, bars, event text, source notes, and CTAs should stay roughly within y=280-1400. Leave about 280px at the top and 500px+ at the bottom for platform UI overlays. The bottom footer, URL, and secondary branding may remain lower because they are not critical.
11. Default to a padded export with equal blank top/bottom space: `--pad-height 2400` for `1080x2400` (9:20). Critical content should remain in the centered 1080x1920 region so platform crops mostly hit blank space. Use `--no-pad` only when the user explicitly wants 9:16 only.
12. Treat the first frame as a distribution thumbnail. It needs a platform-native hook, not a dataset title. Prefer conflict, reversal, historical turnover, or curiosity: "王座易主", "时代迁移", "彻底换人了", "正在重新洗牌".
13. Separate copy surfaces: `platformTitle` for the post title, `coverHeadline` for the thumbnail, and `hook` for the in-video title after playback starts.
14. Give titles a historical feel, but do not make them abstract labels. A cover headline must reveal the subject plus the tension in 2 lines: "谁才是 / 历史上最大的帝国？", "世界人口第一 / 真的换人了", "钢铁产量第一 / 怎么变成中国？". Avoid vague labels like "最大帝国不断易主" because viewers cannot tell why they should click.
15. For explanatory or distribution datasets that are not actually a ranking contest, use a literal title that names the subject and measure, such as "人一生中不同活动的时间占比". Do not force "race", "排位赛", "王座易主", or historical-turnover framing onto topics where viewers mainly need to understand what is being measured.
16. Use a clear information split: `coverHeadline` is the click reason, `coverSubline` is the historical hint, and `platformTitle` can be longer and more searchable. `coverHeadline` should usually be 10-18 Chinese characters across 2 lines, not 4-8 characters.
17. Keep cover and intro text controlled. `coverSubline` should be one compact phrase; visible `intro` should fit two lines above the bars. Long descriptions belong in the Markdown publishing copy, not on screen.
18. Keep the first 3 seconds fast: cover title should fill the screen, then fade quickly as the race starts. Avoid a long static intro.
19. Pick or create datasets in `data/history/*.json` with clear first-frame appeal: long time span, obvious rank turnover, strong before/after contrast, or a historically recognizable entity. The bundled `southeast-asia-gdp-race` dataset is the install-test example.
20. Separate event types clearly in data. Use `entityCode: null` for global era/context events that describe the whole ranking at that year; these appear near the year stamp. Use `entityCode` for one entity's milestone; these appear as a short second line under that entity's value. Do not encode global trend events as one account's event just because a representative account exists.
21. Keep event copy short enough for mobile. Global event titles should fit one line, usually 8-14 Chinese characters and no more than 18 display characters. Entity event titles should be even tighter, usually 6-12 Chinese characters and no more than 14 display characters after the entity name is removed. Prefer "突破千万", "继续领跑", "短视频上冲" over full-sentence explanations.
22. Event timing must not change the race animation. The year/value progress should stay continuous and smooth from start to end. Rank switching should be triggered by the actual value crossing point, then complete quickly at a fixed pace, around 0.8 seconds. Do not move an entity above another entity before its interpolated value has actually passed it. Event metadata only controls what appears near the year or under an entity value; it must never make bars pause, speed up, or slow down.
23. Add dataset events when the story feels sparse. Use neutral, scoped wording and values/ranks from the matching frame where available.
24. Do not show separate insight/source cards before closing. Put data notes and source disclosure on the final closing page.
25. Closing should stay simple: larger `世界的形状` logo, `可游玩的知识宇宙`, short positioning copy, source note, and `ShapeOf.World`.
26. Batch renders should run sequentially to avoid Remotion cache and CPU contention.

## Copywriting Examples

### 地缘政治类：俄罗斯贸易版图全面东转

```text
platformTitle:  俄罗斯贸易版图重写：从欧洲全面转向中国和印度
coverKicker:    2000 → 2025 · 俄罗斯贸易伙伴
coverHeadline:  俄罗斯贸易版图 / 全面东转
coverSubline:   从德国、荷兰到中国、印度，一场地缘剧变
coverBadge:     25 年贸易版图重写
hook:           俄罗斯最大贸易伙伴，25 年里从德国变成了中国
intro:          从 2000 年到 2025 年，看俄罗斯主要贸易伙伴如何被地缘政治改写。
insight:        2022 年之前，德国和荷兰是俄罗斯最大的贸易伙伴。战争与制裁之后，欧洲全部撤退……
```

写法要点：
- **`platformTitle`** 用冒号分隔事件 + 结果，30 字以内可直接用作短视频标题
- **`coverHeadline`** 两行（/ 分隔），每行 5-8 字，必含"从 → 到"的戏剧张力
- **`coverSubline`** 一句点明关键对手和时代转变，不可模糊
- **`hook`** 用问句或"从…到…"结构，在视频内作为播放后的开篇句
- **`insight`** 以具体数字和对比收束，提炼变化的底层推力

### 战争影响类：全球军费重新洗牌

```text
platformTitle:  全球军费排名：俄乌战争如何引爆俄罗斯和乌克兰军费开支
coverKicker:    2000 → 2025 · 全球军费
coverHeadline:  全球军费 / 重新洗牌
coverSubline:   俄乌战争引爆俄罗斯与乌克兰军费飙升
coverBadge:     26 年军费史
hook:           全球军费排名，俄乌战争如何改写一切？
intro:          从 2000 年到 2025 年，看全球军费排名在战争推动下的剧烈变化。
insight:        俄乌战争让俄罗斯军费从 2021 年的 660 亿美元飙升至 1900 亿……
```

写法要点：
- 战争/冲突类标题用"引爆"、"改写"等动态动词
- **`coverHeadline`** 讲趋势而非实体（"重新洗牌"而非某个国家名）
- **`insight`** 用具体金额对比（660亿→1900亿），让观众直观感受量级

### ❌ 负面案例：无信息量的模糊标题

```text
coverSubline: 把时间轴拉长，看谁守住王座
```

**致命问题：完全看不出在讲什么。** 观众看完标题都不知道这是 GDP、军费、人口还是钢铁产量，也不知道涉及哪些国家/实体。

**原因：** 代码中的 `buildDefaultCoverCopy` 在首位未变化时（如美国稳居军费第一），fallback 生成了这种模糊措辞——看起来像有信息量，实际上一无所有。

**规则：** 每一条 `coverSubline` 和 `coverHeadline` 必须包含**具体的实体名 + 衡量指标**。宁可直白（"美国军费 25 年稳居第一"），也不要抽象（"看谁守住王座"）。所有数据集都必须在 `COPY_OVERRIDES` 中手写文案，禁止使用自动 fallback。

| ❌ 不好的 | 问题 | ✅ 好的 |
|-----------|------|--------|
| 把时间轴拉长，看谁守住王座 | 根本没说是关于什么数据 | 俄乌战争引爆俄罗斯与乌克兰军费飙升 |
| 时代正在改写 | 无实体、无指标 | 从德国、荷兰到中国、印度，一场地缘剧变 |
| 谁在上升，谁被时间改写？ | 无实体、无地域 | 俄罗斯最大贸易伙伴，25 年里从德国变成了中国 |
| 1948 年，中国是**这里**最穷的 | "这里"是哪里？观众要猜 dataset | 1948 年，中国是**东南亚**最穷的 |

写 `coverHeadline`/`hook` 时，如果涉及地域/数据集范围，**必须明确写出地域名**（东南亚、东亚、全球等），不要用"这里"、"这个区域"等指代词。观众看封面的那一瞬间必须知道是什么地理范围。其他"这里"、"这个"、"该区域"等指代一并禁止。

## Commands

Install dependencies in the skill directory:

```bash
cd ~/.agents/skills/history-video-maker
pnpm install
```

Render one final video from the project folder where the output should be saved. This writes the core 9:16 video, the default 9:20 padded export, and the 16:9 landscape export to `./output/` in the invoking folder:

```bash
pnpm --dir ~/.agents/skills/history-video-maker video:history -- --slug us-stock-market-cap-race
```

Render one 9:16-only video without the 9:20 padded export. The 16:9 landscape export is still written unless `--no-landscape` is also passed:

```bash
pnpm --dir ~/.agents/skills/history-video-maker video:history -- --slug us-stock-market-cap-race --no-pad
```

Render only the vertical outputs without the 16:9 landscape export:

```bash
pnpm --dir ~/.agents/skills/history-video-maker video:history -- --slug us-stock-market-cap-race --no-landscape
```

Render one preview:

```bash
pnpm --dir ~/.agents/skills/history-video-maker video:history -- --slug us-stock-market-cap-race --duration 45 --scale 0.5
```

Render to an explicit folder:

```bash
pnpm --dir ~/.agents/skills/history-video-maker video:history -- --slug us-stock-market-cap-race --output-dir ./history-output
```

Batch render selected slugs:

```bash
set -e
for slug in world-population-race empire-area-race city-population-race energy-consumption-race steel-production-race; do
  pnpm --dir ~/.agents/skills/history-video-maker video:history -- --slug "$slug"
done
```

Render the bundled standalone example:

```bash
pnpm --dir ~/.agents/skills/history-video-maker video:history -- --slug southeast-asia-gdp-race
```

Files are written to the current directory's `output/` folder:

```text
output/<slug>-padded-1080x2400.mp4
output/<slug>-landscape-1920x1080.mp4
```

## Verification

Run focused checks after code or data changes:

```bash
pnpm typecheck
pnpm test
```

Check rendered files with `ffprobe`:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of json output/us-stock-market-cap-race.mp4
```

If Remotion prints a Zod deprecation warning, note it but do not update dependencies unless the user asks for dependency work.
