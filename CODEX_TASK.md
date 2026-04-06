# Codex Task: 今日一字 + 午时钟

## Overview
Implement two features for a Buddhist temple vegetarian site (Next.js 15 App Router, TypeScript, Tailwind CSS). Work in `/Users/yihengli/shijia-site`. After ALL changes, run `npx next build` to confirm zero errors, then `git add -A && git commit -m "feat: 今日一字 + 午时钟"`.

---

## Feature 1: 今日一字 (Daily Character)

### Data — `src/lib/dailyChar.ts`

Create this file with the following pool of 12 characters. Each entry has: `char` (Chinese), `pinyin`, `meaning` (Chinese, one line), `quote` (Chinese, from sutras or patriarchs), `source` (sutra/text name), `en` (English rendering of the quote):

```
空 kōng — 色即是空，空即是色。《心经》 "Form is emptiness, emptiness is form."
净 jìng — 心净则国土净。《维摩诘经》 "When the mind is pure, the land is pure."
慈 cí — 慈能与乐，悲能拔苦。《大智度论》 "Compassion gives joy; mercy removes suffering."
悲 bēi — 同体大悲，无缘大慈。《梵网经》 "Great compassion embraces all as one body."
喜 xǐ — 法喜充满，禅悦为食。《无量寿经》 "Filled with the joy of Dharma, nourished by meditative bliss."
舍 shě — 放下即自在，舍得即得。祖师语 "Let go — and freedom follows."
觉 jué — 觉而不迷，正而不邪。六祖坛经 "Awakened and not confused; upright and not deviant."
定 dìng — 外离相即禅，内不乱即定。六祖坛经 "Unattached outwardly is Chan; undisturbed inwardly is samadhi."
忍 rěn — 忍辱波罗蜜，能除百种苦。《金刚经》 "The perfection of patience dispels a hundred sufferings."
戒 jiè — 戒为无上菩提本，应当具足持净戒。《梵网经》 "Precepts are the root of supreme awakening."
念 niàn — 念念不离心，心心皆是佛。祖师语 "Thought after thought, never apart from the mind — each mind is Buddha."
善 shàn — 诸恶莫作，众善奉行。《法句经》 "Refrain from all evil; practice all good."
```

Export:
```ts
export type DailyCharEntry = { char: string; pinyin: string; meaning: string; quote: string; source: string; en: string; }
export const DAILY_CHARS: DailyCharEntry[]  // array of 12
export function getTodayChar(): DailyCharEntry  // uses Math.floor(Date.now() / 86_400_000) % 12
```

### SVG Paths — inline in `DailyChar.tsx`

Each character needs a simplified SVG representation as animated stroke paths. Use a 100×100 viewBox. The goal is "ink brush feel", not calligraphic perfection — 2 to 5 path elements per character is enough. Use `stroke-linecap="round"` and `stroke-linejoin="round"`, no fill, stroke color `currentColor`.

For each character, define paths that suggest the character's shape. Here are the path hints (simplified, not exact calligraphy):

- 空: top cross 十 shape + enclosing frame below
- 净: three short horizontal strokes left, two vertical strokes right
- 慈: top portion two curved strokes, bottom 心 (three dots + curved base)
- 悲: top 非 (two vertical pairs), bottom 心
- 喜: top 口, middle 豆-like shape, bottom 口
- 舍: top 人 (roof), middle horizontal, bottom 口
- 觉: complex — simplify to top horizontal frame + bottom 见 (vertical + turning stroke)
- 定: top 宀 (roof), middle dot, bottom 正 (simplified)
- 忍: top 刃 (blade with dot), bottom 心
- 戒: simplified to 廾 bottom + diagonal stroke + vertical
- 念: top 今 (person + roof), bottom 心
- 善: top 羊 (simplified crown), bottom 口

**Animation**: Each `<path>` gets `stroke-dasharray` and `stroke-dashoffset` equal to its `getTotalLength()` equivalent (approximate as 200 for long strokes, 80 for short). Use CSS animation `draw-stroke` that goes from `stroke-dashoffset: [length]` to `0`. Stagger each path with `animation-delay` of `0.3s` increments. Total animation ~2s.

Define the keyframes in a `<style>` tag inside the component:
```css
@keyframes draw-stroke {
  to { stroke-dashoffset: 0; }
}
```

### Component — `src/components/DailyChar.tsx`

```tsx
"use client"
// - useState: mounted (false), open (false)
// - useEffect: setMounted(true)
// - if !mounted: render placeholder stamp (same size as current seal)
// - getTodayChar() to get today's entry
// - Render: a clickable stamp div (same visual as current .seal-stamp but with today's char)
// - When open: render a Portal-like fixed overlay (use a div with fixed inset-0 z-[200])
```

**Overlay layout**:
- Background: `bg-[var(--ink)]/85 backdrop-blur-md`, fade in animation
- Close on click anywhere on backdrop, or ✕ button top-right
- Center content (flex col items-center justify-center gap-8)
- Large SVG character: 180×180px, stroke `var(--bg)` (light on dark bg), strokeWidth 3
- SVG animates on mount (re-key the SVG element when overlay opens using a `key={openCount}` counter so animation replays each open)
- Below SVG, staggered fade-in text:
  - Char + pinyin: `text-[var(--bg)] text-5xl serif-title` + `text-[var(--muted-light)] text-sm`
  - Meaning: `text-[var(--bg)]/80 text-base` — appears after 1.8s delay
  - Quote: left-border style, `text-[var(--bg)]/70 text-sm leading-8` — appears after 2.2s
  - Source in brackets, muted — same block
  - English italic, `text-[var(--bg)]/45 text-xs` — appears after 2.6s
- Bottom: "今日一字" eyebrow label, very subtle

Add CSS variable `--muted-light: rgba(245,239,227,0.4)` to globals.css `:root`.

### Integrate into Header — `src/components/Header.tsx`

Replace the existing seal stamp:
```tsx
// BEFORE:
<div className="seal-stamp ...">释</div>
// AFTER:
<DailyChar />
```

The `DailyChar` component's closed state should look identical to the current seal stamp (same `.seal-stamp` class, same size), just showing today's character instead of 释.

---

## Feature 2: 午时钟 (Noon Bell)

### Component — `src/components/NoonBell.tsx`

```tsx
"use client"
```

**Logic**:
- `useState`: `visible` (false), `phase` (0)
- `useEffect` on mount:
  1. Check once immediately
  2. Set interval every 30 seconds to check
  3. Check function: get current LA time using `new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })` → parse hours and minutes → if `h === 12 && m === 0`:
     - Check `sessionStorage.getItem("noon_bell_" + YYYY-MM-DD)` — if already fired today, skip
     - Otherwise: set the key, trigger overlay
- Cleanup interval on unmount

**Overlay**:
- `position: fixed, inset: 0, z-index: 9000`
- Background: `bg-[var(--ink)]/92 backdrop-blur-sm`
- Full fade-in over 0.6s, then content appears
- Center layout:
  - First line appears at t=0.8s: `"午时供斋时刻"` — `text-[var(--bg)] text-2xl font-light serif-title tracking-[0.2em]`
  - Pause 0.6s
  - Second line at t=2.0s: `"愿十方众生同得饱足。"` — same style, slightly smaller
  - Thin horizontal line between them, `border-[var(--bg)]/20 w-24 mx-auto`
  - English below at t=2.5s: `"Noon offering hour — may all beings be nourished."` — `text-[var(--bg)]/35 text-xs italic`
- Auto-dismiss: entire overlay fades out starting at t=4.5s, fully gone by t=5.5s
- After fade-out, set `visible(false)` to unmount
- No close button, no user interaction needed — it simply appears and disappears

**Implement the timing with `useEffect` + `setTimeout` chain**:
```
mount → check interval
trigger → setVisible(true), setPhase(1)
phase 1 → show line 1 (CSS animation)
t+0.8s → setPhase(2) → show line 2
t+2.5s → setPhase(3) → show english
t+4.5s → begin fade-out class
t+5.5s → setVisible(false)
```

Use CSS classes added/removed based on `phase` for the text reveal, not JS style manipulation.

### Integrate into Layout — `src/app/layout.tsx`

```tsx
import NoonBell from "@/components/NoonBell"
// In RootLayout, add <NoonBell /> just before </body>
```

---

## CSS additions to `src/app/globals.css`

Add to `:root`:
```css
--muted-light: rgba(245, 239, 227, 0.4);
```

Add utility classes:
```css
.noon-line-1, .noon-line-2, .noon-en {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.noon-line-1.visible, .noon-line-2.visible, .noon-en.visible {
  opacity: 1;
  transform: translateY(0);
}
.noon-overlay {
  animation: noon-fade-in 0.6s ease forwards;
}
.noon-overlay.dismissing {
  animation: noon-fade-out 1s ease forwards;
}
@keyframes noon-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes noon-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

---

## Quality checklist before committing

1. `npx next build` — zero errors, zero TypeScript errors
2. `DailyChar` in closed state looks identical to original seal stamp
3. Overlay opens/closes cleanly, SVG animation replays each time overlay is opened
4. `NoonBell` doesn't crash when `sessionStorage` is unavailable (wrap in try/catch)
5. Both components have `"use client"` directive
6. No new npm packages installed — zero dependencies added
7. Commit message: `feat: 今日一字 daily character stamp + 午时钟 noon bell overlay`

---

## Testing note

To test NoonBell without waiting for actual noon: temporarily change the condition from `h === 12 && m === 0` to `m % 2 === 0` (fires every even minute), verify it works, then revert. Do NOT commit the test condition.
