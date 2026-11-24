# Simulario · landing page

**Live:** https://ferasmed-dev.github.io/simulario-site/ · English: https://ferasmed-dev.github.io/simulario-site/en/

The website of **Simulario**, a collection of interactive simulators for learning medicine: instead of only reading notes, students explore realistic models, change a parameter and watch what happens. Spanish first, with an English version.

![Simulario landing page](docs/screenshot.png)

## What's on the page

- **Hero showcase**: a browser window that plays smooth 24–30 fps screen recordings of the real apps, one tab each. They play at 1.6× speed; each clip starts mid-motion and the next tab's recording fades in 0.15 s after the previous one ends (no sliding):
  1. **Atlas TC** — the [whole-body CT atlas](https://github.com/ferasmed-dev/whole-body-ct-atlas) in triple view, scrolling from the aortic arch to the heart with its segmentations and labels, ending on the hover tooltip.
  2. **Neuroatlas** — the 3D brain model and the 7 T MRI slice from the neuroanatomy atlas (preview, not public yet, so this tab has no link).
  3. **Hiperfiltración** — the [glomerular hyperfiltration simulator](https://github.com/ferasmed-dev/simulator-glomerular-of-hyperfiltration) running its *HTA mantenida* scenario over 30 years.
  4. **Examen** — the CT atlas exam mode: "¿Qué lesión es?", answered correctly.

  Visitors can click any tab; the address bar opens the live app. The progress line follows the video's own clock. With *reduce motion* switched on, nothing autoplays and each tab shows its final frame; if a browser blocks autoplay (e.g. iOS Low Power Mode), the slides still advance on a timer.
- **Cómo funciona** (explore · change · observe), the **simulator catalogue**, a CT-atlas section, **for students / for teachers**, a final call to action and the footer.
- Scroll-in and hover animations are CSS only and stay subtle.

## Layout

```
index.html            Spanish page (default)
en/index.html         English page
src/styles.css        all styles (Simulario brand colours, type and radii)
src/main.js           hero showcase player (no libraries)
assets/brand/         logo, favicons, app icon
assets/video/         showcase videos (H.264 MP4, 1280 × 800) + first/last-frame posters
assets/og.jpg         social preview image
tests/site.test.js    static checks (links, assets, both languages)
docs/screenshot.png
```

Plain HTML, CSS and JavaScript: no build step, no frameworks. Fonts (Space Grotesk, Inter, JetBrains Mono) load from Google Fonts, as the brand guidelines specify; system fonts are the fallback.

## Editing

- **Copy**: edit the text in `index.html` and `en/index.html` directly. Keep the two pages in step (the tests check that both have the same sections and showcase).
- **Links**: the *Autorregulación renal* card still points to `#`; replace it with the simulator's URL when it is published.
- **Showcase timing**: `RATE` (playback speed, 1.6×), `HOLD` (gap after each video, 150 ms) and `APPEAR` (fade-in, 220 ms) at the top of `src/main.js`; keep the `appear` animation on `.wslide.cur` in `src/styles.css` the same length.
- **New recordings**: replace a video in `assets/video/` keeping its name (1280 × 800, H.264, muted, `-movflags +faststart`), and update its `-first.webp` / `-last.webp` posters. Any length works: the player waits for the video to end.

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000  (English: http://localhost:8000/en/)
```

## Tests

```
npm test
```

Checks that every local file the pages point to exists, that the Spanish and English pages have the same structure and showcase (4 tabs, one muted inline video per tab with posters), that language links and `hreflang` alternates are in place, and that the showcase script parses. GitHub Actions runs them on every push.

## Deploy (GitHub Pages)

1. Create an empty **public** repository named `simulario-site` (no README or licence).
2. Push these files to `main` (they must sit at the root, with `index.html` at the top).
3. **Settings → Pages → Deploy from a branch → `main` / `(root)`**.
4. After 1–2 minutes the site is live at `https://ferasmed-dev.github.io/simulario-site/`.

To use a custom domain later (e.g. `simulario.es`), add it under Settings → Pages and update the `canonical`, `hreflang` and `og:` URLs in both pages.

## Credits

- CT images: TotalSegmentator dataset, case s0591 (Wasserthal J. et al., *Radiology: AI* 2023), CC BY 4.0, as used in the whole-body CT atlas.
- Brain images: Lüsebrink F, Mattern H, Yakupov R, et al. *Comprehensive ultrahigh resolution whole brain in vivo MRI dataset as a human phantom.* Sci Data 2021;8:138 (data CC0); segmentation with SynthSeg (Billot B, et al. *Med Image Anal* 2023).

Teaching tools · not for clinical use.

© 2026 Feras Elhissi. All rights reserved (see `LICENSE`).
