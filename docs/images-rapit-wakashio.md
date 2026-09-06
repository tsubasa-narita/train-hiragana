# Train illustration generation notes

## Nankai 50000 Rapi:t

- Output: `assets/trains/rapit.png`
- Use case: `illustration-story`
- Generation mode: built-in `image_gen` (one brand-new generation call)
- Style references inspected: `assets/trains/hayabusa.jpg`, `assets/trains/komachi.jpg` (reference only)
- Source output: `C:\\Users\\narit\\.codex\\generated_images\\01a0769e-de29-76f3-b03a-68e83cc60721\\exec-82c6f7d1-32e7-4527-8614-0cb9b9aa9215.png`
- Verified dimensions: 1536 × 1024 px (3:2 landscape)
- Visual QA: complete deep-blue Rapi:t fully inside frame in three-quarter view; rounded streamlined nose and oval passenger windows readable; green Japanese suburban landscape; two tiny rabbit bystanders and three tiny animal passengers; no visible text, logos, lettering, or watermarks.

### Prompt

```text
Use case: illustration-story
Asset type: project train illustration
Primary request: a brand-new landscape 3:2 illustration of a Nankai 50000 Rapi:t train, accurately recognizable with a deep blue streamlined rounded retro-futuristic nose and oval passenger windows
Scene/backdrop: lush green Japanese suburban landscape with low hills, tidy homes, fields, and a calm railway corridor
Subject: one complete Rapi:t train as the main subject, fully visible in a dynamic three-quarter view, with the leading cab and enough cars visible to read the train's real shape and proportions; 2-3 tiny cats, rabbits, or bears as friendly passengers visible through windows or small bystanders near the railway
Style/medium: softly hand-painted anime watercolor storybook illustration, fine ink outlines, gentle paper texture, pastel washes, warm and inviting, closely matching the visual language of the inspected hayabusa and komachi references while remaining an original scene
Composition/framing: wide 3:2 landscape composition, train clearly dominant and entirely inside the frame, readable silhouette, natural perspective, no cropped nose or cars
Lighting/mood: clear gentle daylight, cheerful peaceful travel mood
Color palette: deep navy and cobalt blue train body with subtle silver/white trim, fresh greens, sky blue, warm earth tones
Constraints: no text, no logos, no lettering, no watermarks; accurate train-like construction; keep the animals tiny and secondary; style reference only, do not reproduce the reference composition
Avoid: cropped train, front-facing flat view, incorrect bright red or green train livery, oversized animals, fantasy locomotive, extra trains, signage, captions, branding
```

## E257-500 Wakashio

- Output: `assets/trains/wakashio.png`
- Use case: `illustration-story`
- Generation mode: built-in `image_gen` (one brand-new generation call)
- Style references inspected: `assets/trains/hayabusa.jpg`, `assets/trains/komachi.jpg` (reference only)
- Source output: `C:/Users/narit/.codex/generated_images/01a0769e-eef2-7752-a35b-65d36be54377/exec-7c3f626f-7543-4e82-b9fc-5e75c670530a.png`
- Verified dimensions: 1536 × 1024 px (3:2 landscape)
- Visual QA: complete train fully inside frame in three-quarter view; white body with distinct blue and yellow accents; front cab and front door readable; blue ocean, green coastal vegetation, shoreline, and seaside town present; three tiny animal bystanders; no visible text, logos, lettering, or watermarks.
- Copy verification: workspace output SHA-256 matches the generated source (`35ED9ABC036DE1968A187844C15E7AA796CA36EA955FA3B936BE7FA1EABC98BC`).

### Prompt

```text
Use case: illustration-story
Asset type: project train illustration
Primary request: a brand-new landscape 3:2 illustration of an E257-500 Wakashio train, accurately recognizable as a white Japanese limited express with blue and yellow accents and a cab with a front door
Scene/backdrop: pleasant Chiba coastal scene in Japan, with blue ocean glimpsed beyond green coastal vegetation, gentle shoreline, seaside town details, and a calm railway corridor
Subject: one complete E257-500 Wakashio train as the main subject, fully visible in a dynamic three-quarter view, with the front cab and front door clearly readable and enough cars visible to communicate the real train's shape and proportions; 2-3 tiny cats, rabbits, or bears as friendly passengers visible through windows or small bystanders near the railway
Style/medium: softly hand-painted anime watercolor storybook illustration, fine ink outlines, gentle paper texture, pastel washes, warm and inviting, closely matching the visual language of the inspected hayabusa and komachi references while remaining an original scene
Composition/framing: wide 3:2 landscape composition, train clearly dominant and entirely inside the frame, readable silhouette, natural perspective, no cropped nose or cars
Lighting/mood: soft bright coastal daylight, peaceful seaside travel mood
Color palette: clean white train body with distinct blue and yellow accent bands, ocean blues, coastal greens, sandy warm tones
Constraints: no text, no logos, no lettering, no watermarks; accurate train-like construction; keep the animals tiny and secondary; style reference only, do not reproduce the reference composition
Avoid: cropped train, front-facing flat view, all-blue train, wrong livery, missing front door, oversized animals, fantasy locomotive, extra trains, signage, captions, branding
```

## Additional train illustrations

- Yokosuka Line: [`docs/yokosuka.md`](yokosuka.md), output `assets/trains/yokosuka.png` (1536 × 1024). Its QA record notes that the rear consist reaches the right edge of the frame.
- Dog watching Keikyu: [`docs/dog-train.md`](dog-train.md), output `assets/trains/dog-train.png` (1536 × 1024). Its QA record confirms the dog is safely behind the fence and the train is fully visible.

## Reward Rapi:t

- Output: `assets/rewards/reward_rapit.png`
- Use case: `illustration-story`
- Generation mode: built-in `image_gen` (one brand-new generation call)
- Style references inspected: `assets/trains/hayabusa.jpg`, `assets/trains/komachi.jpg` (reference only; not passed as edit targets)
- Source output: `C:/Users/narit/.codex/generated_images/01a076a3-d57c-7c22-be4c-0bf2bd89ae00/exec-6f31fd48-068f-42b7-ad66-efb90a9ab376.png`
- Final output: `C:/Users/narit/OneDrive/ドキュメント/ChatGPT/電車ひらがな/assets/rewards/reward_rapit.png`
- Verified dimensions: 1672 × 941 px
- Alpha verification: PNG decoded as `Format32bppArgb`; 777,398 fully transparent pixels, 795,432 partial-alpha pixels, 522 fully opaque pixels; minimum alpha 0 and maximum alpha 255; 0 opaque white pixels; sampled outer background points all had alpha 0.
- Visual QA: complete deep-blue Rapi:t train fully inside a long landscape frame, clearly facing right in front three-quarter view, with rounded streamlined nose, oval windows, clean transparent margins, and exactly two tiny cat passengers; no scenery, ground, text, logos, lettering, or watermark.

### Prompt

```text
Use case: illustration-story
Asset type: transparent reward train cutout for a CSS scene
Primary request: a single full Nankai 50000 Rapi:t train facing RIGHT, moving left to right, shown in a front three-quarter view with the rounded streamlined retro-futuristic nose on the right
Scene/backdrop: none; genuinely transparent background with an actual alpha channel
Subject: the complete deep-blue Nankai 50000 Rapi:t passenger train, with recognizable accurate proportions and its characteristic rounded bulbous nose, deep navy/royal blue body, silver-blue lower body, pale cream accents, and oval passenger windows; include only 1-2 tiny secondary animal passengers (a cat or rabbit or bear) peeking through train windows
Style/medium: softly hand-painted anime picture-book watercolor, fine ink contours, gentle paper texture, warm storybook illustration language
Composition/framing: long landscape canvas, train dominant and unobstructed, complete vehicle entirely within frame with visible padding on every side, clear right-facing silhouette, front three-quarter perspective rather than a flat side profile
Lighting/mood: soft even watercolor illumination, calm whimsical storybook mood
Color palette: deep blue Rapi:t livery with cool silver-blue and pale cream accents, restrained natural watercolor colors
Materials/textures: delicate watercolor washes, subtle paper grain, fine hand-inked edges while keeping the silhouette clean for CSS motion
Text (verbatim): ""
Constraints: exactly one train and only 1-2 tiny animals; preserve a clean silhouette and transparent margins; true transparent background with alpha; no ground, track, scenery, shadow, text, logos, lettering, branding, captions, or watermark
Avoid: left-facing train, cropped train, flat side profile, extra vehicles, scenery, opaque white backdrop, painted checkerboard, ground shadow, captions, branding.
```
