---
title: "Core Web Vitals: The Complete Optimisation Guide"
slug: "core-web-vitals-guide"
excerpt: "Understand Google's Core Web Vitals metrics and learn exactly how to improve your LCP, INP, and CLS scores to boost rankings."
author: "Mike Johnson"
date: "2024-04-18"
category: "Technical SEO"
readTime: 10
featured: false
tags: [core-web-vitals, performance, technical-seo, page-speed]
coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
---

## What Are Core Web Vitals?

Core Web Vitals are a set of specific metrics Google uses to measure real-world user experience on web pages. Since 2021, they've been an official Google ranking factor — meaning poor scores can directly hurt your search positions.

The three metrics are:

| Metric | Measures | Good Score |
|--------|----------|------------|
| **LCP** (Largest Contentful Paint) | Loading performance | ≤ 2.5 seconds |
| **INP** (Interaction to Next Paint) | Interactivity | ≤ 200 milliseconds |
| **CLS** (Cumulative Layout Shift) | Visual stability | ≤ 0.1 |

## How to Measure Your Scores

### Field Data (Real Users)
- **Google Search Console** → Core Web Vitals report
- **Chrome User Experience Report (CrUX)**
- **PageSpeed Insights** (field data section)

### Lab Data (Simulated)
- **PageSpeed Insights** (lab data section)
- **Lighthouse** (in Chrome DevTools)
- **WebPageTest**

Field data is what Google actually uses for ranking. Lab data is useful for diagnosing issues.

## Improving LCP (Largest Contentful Paint)

LCP measures how long it takes for the largest visible element (usually a hero image or heading) to load.

### Common causes of slow LCP:
- Large, unoptimised images
- Render-blocking JavaScript and CSS
- Slow server response times
- No CDN

### Fixes:

**1. Optimise your hero image**
```html
<!-- Add fetchpriority="high" to your LCP image -->
<img src="hero.webp" fetchpriority="high" alt="Hero image" />
```

**2. Convert images to WebP or AVIF**
These formats are 25-50% smaller than JPEG/PNG with equivalent quality.

**3. Use a CDN**
Serve assets from servers geographically close to your users.

**4. Preload critical resources**
```html
<link rel="preload" as="image" href="hero.webp" />
```

**5. Eliminate render-blocking resources**
Defer non-critical JavaScript and inline critical CSS.

## Improving INP (Interaction to Next Paint)

INP replaced FID in March 2024. It measures the delay between a user interaction (click, tap, keypress) and the next visual update.

### Common causes of poor INP:
- Heavy JavaScript execution on the main thread
- Long tasks blocking interaction handling
- Excessive DOM size

### Fixes:

**1. Break up long tasks**
Any JavaScript task over 50ms blocks the main thread. Use `setTimeout` or `scheduler.yield()` to break work into smaller chunks.

**2. Reduce JavaScript bundle size**
- Code split aggressively
- Remove unused dependencies
- Use tree shaking

**3. Defer non-critical JavaScript**
```html
<script src="analytics.js" defer></script>
```

**4. Use web workers for heavy computation**
Move CPU-intensive work off the main thread entirely.

## Improving CLS (Cumulative Layout Shift)

CLS measures unexpected layout shifts — elements jumping around as the page loads, which is frustrating for users.

### Common causes of high CLS:
- Images without explicit dimensions
- Ads, embeds, or iframes without reserved space
- Dynamically injected content above existing content
- Web fonts causing FOIT/FOUT

### Fixes:

**1. Always set image dimensions**
```html
<img src="photo.jpg" width="800" height="600" alt="..." />
```
Or use CSS aspect-ratio:
```css
img { aspect-ratio: 4/3; width: 100%; }
```

**2. Reserve space for ads and embeds**
```css
.ad-container { min-height: 250px; }
```

**3. Preload fonts and use `font-display: optional`**
```css
@font-face {
  font-family: 'MyFont';
  font-display: optional;
  src: url('font.woff2') format('woff2');
}
```

**4. Avoid inserting content above existing content**
Banners, cookie notices, and notifications should slide in from the bottom or be reserved in the layout from the start.

## Monitoring Over Time

Core Web Vitals fluctuate. Set up ongoing monitoring:

1. **Google Search Console** — check the Core Web Vitals report weekly
2. **Real User Monitoring (RUM)** — tools like Vercel Analytics, Datadog, or SpeedCurve track real user data continuously
3. **Lighthouse CI** — run automated Lighthouse audits on every deployment

A single optimisation sprint isn't enough. Performance degrades as you add features — build it into your development workflow.
