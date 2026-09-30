# `<Shot>`: API and capture conventions

Component: `canopy_site/src/components/Shot.astro`. Phase 3 (screenshot capture) builds on this.

## Usage

```mdx
import Shot from '../../../components/Shot.astro';

<Shot name="channel-conversation" alt="…" caption="…" />
```

| Prop | Default | Meaning |
|---|---|---|
| `name` | required | Base file name in `src/assets/shots/`, without the theme suffix |
| `alt` | required | Alt text |
| `caption` | none | `<figcaption>`. Don't write "dark theme" or "light theme" in it; the image follows the reader's theme |
| `scale` | `2` | Capture DPR. The existing upstream 1x images use `scale={1}` until they're re-shot |
| `eager` | `false` | Above the fold: `loading="eager"` + `fetchpriority="high"` |
| `chrome` | `false` | Faux window title bar (28px, three dots), design §4.3 |
| `sizes` | `(min-width: Wpx) Wpx, 100vw` | Override when the column is much narrower than the viewport |

## File lookup (`src/assets/shots/`)

| File | Used for |
|---|---|
| `{name}-dark.png` + `{name}-light.png` | Swapped by `[data-theme]`. Docs follow the toggle; the landing page (no `data-theme`) shows dark |
| `{name}.png` | Theme-neutral, used when there's no pair |
| `{name}-mobile-dark.png` / `-light.png` (or `{name}-mobile.png`) | Optional art-directed crop, used below 768px |

A missing name fails the build with a clear error. Output is AVIF + WebP `srcset`s (640/960/1280/1920/2560 plus native width) with `width`/`height` set, so nothing shifts while loading.

## Sizing rule

**Display width = min(container, file width ÷ scale).** A 2x capture is never shown larger than its CSS size, so UI text is never upscaled. Legibility check: effective text size = app text size × displayed width ÷ CSS width. The target is ≥11px (app body text is 13–14px).

| Kind | CSS size (file = 2×) | Where | Notes |
|---|---|---|---|
| `full` | 1440×900 | Homepage scroll-story frame (pan/zoom), anything spanning ≥1000px | The only full-window size |
| `wide` crop | ≤1200 wide | Homepage sections and bento | |
| `docs` crop | **≤800 wide** (aim for 640–760) | Docs column (`--sl-content-width` 42rem = 672px) | 14px text stays ≥11.7px at 672px |
| `detail` | ≤480 wide | One card, chip, or panel: permission card, budget meter, question card | Readable at 390px without a mobile variant |
| `-mobile` | ≤440 wide, portrait | Optional; needed for any `wide`/`docs` crop that must be readable at 390px | Below 768px |

## Capture conventions

- Playwright `deviceScaleFactor: 2`, acme seed, **dark and light** for every shot. PNG output; `astro:assets` handles AVIF/WebP.
- Crop to element boundaries plus 16–24px of app background. No browser chrome (use `chrome` for a frame instead). Hide the composer hint line and the cursor.
- Names: kebab-case from design §9.3 (`story-03-delegate-dark.png`, `memory-panel-light.png`, …).
- Frame, radius, border, and shadow come from the component. Don't bake them into the PNG.
