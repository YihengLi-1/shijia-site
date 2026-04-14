# Codex Task — SEO, Accessibility & Code Quality Fixes

## Context
Buddhist temple vegetarian site at `/Users/yihengli/shijia-site`. Next.js 15 App Router, TypeScript, Tailwind CSS.
An external audit found several issues. Fix all of the following.

---

## Task 1 — Move DailyChar inline `<style>` to globals.css

### Problem
`src/components/DailyChar.tsx` has TWO places where `@keyframes` are injected via inline `<style>` tags (around lines 155 and 299). This causes SEO crawlers and screen readers to see raw CSS code as page content.

### Fix

**Step 1a:** In `src/app/globals.css`, find the block that already has `@keyframes draw-stroke` (it's there from the NoonBell/DailyChar feature). If it doesn't exist, add the following keyframes to the existing DailyChar/animation section:

```css
@keyframes draw-stroke {
  to { stroke-dashoffset: 0; }
}

@keyframes daily-char-overlay-in {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes daily-char-copy {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Step 1b:** In `src/components/DailyChar.tsx`, remove BOTH `<style>{` blocks that define these keyframes (there are two — one in the SSR/loading branch around line 155, one in the main render around line 299). The CSS is now in globals.css so the inline styles are redundant.

**Step 1c:** After removing the `<style>` blocks, verify the component still compiles cleanly — the `style` props on `<path>` and `<text>` elements that *reference* these keyframes via `animation: "draw-stroke ..."` should remain unchanged. Only the `<style>{...}` JSX blocks themselves are removed.

---

## Task 2 — Add JSON-LD LocalBusiness Schema

### Problem
No structured data markup. Google cannot generate rich search results for this business.

### Fix
In `src/app/layout.tsx`, add a `<script>` tag with `type="application/ld+json"` inside the `<head>`. Use `SITE` values where possible.

Add this directly in the `<head>` section of the root layout:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": ["Restaurant", "BuddhistTemple"],
      "name": "释迦佛国素食斋",
      "alternateName": "Shijia Vegetarian Sanctuary",
      "description": "A quiet corner of the temple. Simple, unhurried. Vegetarian meals offered in stillness, shared with all who find their way here.",
      "url": "https://shijiafoguo.com",
      "telephone": "",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1820 Sharpless Dr",
        "addressLocality": "La Habra Heights",
        "addressRegion": "CA",
        "postalCode": "90631",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 33.9587,
        "longitude": -117.9465
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "05:00",
          "closes": "21:00"
        }
      ],
      "servesCuisine": ["Vegetarian", "Buddhist", "Chinese"],
      "priceRange": "$",
      "currenciesAccepted": "USD",
      "paymentAccepted": "Credit Card, Cash",
      "hasMap": "https://www.google.com/maps/search/?api=1&query=1820+Sharpless+Dr,+La+Habra+Heights,+CA+90631",
      "image": "https://shijiafoguo.com/photo-altar.jpg",
      "sameAs": ["https://vishvabauddhasangha.com"]
    })
  }}
/>
```

Place this tag right before `</head>` in the layout.

---

## Task 3 — Audit and fix image alt text

### Problem
Several `<Image>` components across the site may have missing or generic alt text, which harms accessibility and image SEO.

### Fix
Go through every `<Image>` component in `src/` and ensure each has a descriptive `alt` attribute. Use the rules below:

- **Decorative images** (used purely for visual effect, no informational content): `alt=""`
- **Content images**: use descriptive Chinese or English text that explains what the image shows

Specific files to check and fix:
- `src/app/page.tsx` — hero altar photo, photo gallery section
- `src/app/about/page.tsx` — altar photo, monk photo
- `src/app/visit/page.tsx` — any photos
- `src/app/menu/page.tsx` — any photos
- `src/components/HomeTodayMenu.tsx` — dish placeholder images

Required alt values (update these specifically):
```
/photo-altar.jpg → alt="释迦佛国道场佛坛 · The Sanctuary Altar"
/photo-monk-bell.jpg → alt="法师击钟 · Monastic ringing the bell"
/photo-monk-cup.jpg → alt="法师供茶 · Monastic offering tea"
/photo-extra.jpg → alt="道场日常 · Daily life at the sanctuary"
```

---

## Task 4 — Fix nav label "Donate" → "Offer"

### Problem
The English translation for "随喜" is currently "Donate" in several places. This maps the concept to charity donation rather than the Buddhist practice of joyful offering (随喜功德).

### Fix
In `src/lib/site.ts`, change the nav item:
```ts
// Before:
{ label: "随喜", labelEn: "Donate", href: "/donation" },
// After:
{ label: "随喜", labelEn: "Offer", href: "/donation" },
```

Also check and update these files if they have hardcoded "Donate" labels:
- `src/app/page.tsx` — CTA buttons
- `src/components/Footer.tsx` — footer nav
- `src/app/donation/page.tsx` or `DonationClient.tsx` — page header

Do NOT change:
- The URL `/donation` (keep as-is to avoid broken links)
- Any Chinese text (only English labels change)
- The Stripe integration or any backend logic

---

## Quality Checklist

- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` completes with 0 errors
- [ ] No `<style>` JSX tags remain in `DailyChar.tsx`
- [ ] JSON-LD script tag is present in the rendered HTML `<head>`
- [ ] All `<Image>` components have non-empty `alt` attributes (except intentional decorative ones with `alt=""`)
- [ ] Nav label "Donate" → "Offer" in English
- [ ] Commit: `git add -A && git commit -m "fix: schema markup, alt text, nav label, DailyChar inline styles"`

## Do NOT change
- Any animation behavior or visual appearance
- The DailyChar overlay functionality
- URL routes or Stripe/Supabase configuration
- Chinese text anywhere
