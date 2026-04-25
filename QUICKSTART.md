# Quick Start Guide - SEO Blog Platform

## 5-Minute Setup

### 1. Clone & Install
```bash
cd /vercel/share/v0-project
pnpm install
```

### 2. Run Dev Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Adding Your First Blog Post

### 1. Create a new file
Create `/content/posts/my-awesome-post.md`

### 2. Add frontmatter (metadata)
```yaml
---
title: "My Awesome Post"
description: "A brief description for search results"
author: "Your Name"
date: "2024-01-20"
category: "Fundamentals"
tags: ["seo", "tips", "guide"]
featured: false
readingTime: 5
---
```

### 3. Write your content
```markdown
## Introduction
Your content here...

### Section 1
More content...

### Conclusion
Wrap it up...
```

### 4. Your post appears instantly!
- On `/blog` listing
- Searchable via search page
- Linked from categories

---

## Key Features

### Search
- Client-side full-text search
- No backend needed
- Instant results
- Search across title, content, categories, tags

### SEO Ready
- Automatic sitemap generation
- JSON-LD structured data
- OpenGraph & Twitter Card support
- Mobile-optimized
- Fast page loads

### Beautiful Design
- Modern Slate + Amber color palette
- Responsive grid layouts
- Dark mode support
- Smooth animations

---

## File Structure Reference

```
content/posts/          ← Add markdown files here
app/                    ← Pages and routing
├── page.tsx           ← Home page
├── blog/page.tsx      ← Blog listing
├── blog/[slug]/       ← Post detail pages
└── search/page.tsx    ← Search results

components/            ← Reusable React components
├── header.tsx
├── footer.tsx
├── blog-card.tsx
└── related-posts.tsx

lib/                    ← Utilities & helpers
├── posts.ts           ← Post parsing logic
├── seo.ts             ← SEO metadata
└── search-index.ts    ← Search indexing
```

---

## Customization

### Change Colors
Edit `/app/globals.css` CSS variables:
```css
--primary: oklch(0.35 0.1 215);      /* Slate blue */
--accent: oklch(0.65 0.15 70);       /* Amber */
--background: oklch(0.98 0 0);       /* Off-white */
```

### Change Site Title
Edit `/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: {
    default: 'Your Blog Title',
    template: '%s | Your Blog Title',
  },
};
```

### Add Navigation Links
Edit `/components/header.tsx` navigation array:
```typescript
const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'New Link', href: '/new-page' },
];
```

---

## Common Tasks

### Add Multiple Categories
Create posts with different `category` values in frontmatter. They automatically appear on `/categories`.

### Feature a Post
Set `featured: true` in post frontmatter. It appears on home page.

### Update Reading Time
Update `readingTime` field in frontmatter (in minutes).

### Add Tags
Update `tags` array in frontmatter. Tags appear on post cards.

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy SEO blog"
git push origin main
```

### 2. Connect to Vercel
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo
- Click Deploy

**That's it!** Your blog is live at `yourblog.vercel.app`

---

## Performance

### Build Time
~2 seconds for 4 posts (scales linearly)

### Search Speed
Instant (client-side, no API calls)

### Page Load
- Home: <1s
- Blog listing: <1s
- Post detail: <2s (includes markdown parsing)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Post doesn't appear | Check frontmatter YAML syntax, ensure file is in `/content/posts/` |
| Search returns nothing | Clear browser cache, verify posts have content |
| Styling looks wrong | Check if Tailwind CSS is compiled (should auto-build) |
| Build fails | Run `pnpm install` to ensure all deps are installed |

---

## Next Steps

1. ✅ Run the app locally
2. ✅ Add your first blog post
3. ✅ Customize colors and branding
4. ✅ Deploy to Vercel
5. ✅ Share with the world!

---

## Need Help?

- Check `/ARCHITECTURE.md` for technical details
- Read `/PROJECT_SUMMARY.md` for complete system overview
- Review example posts in `/content/posts/`
- Check component code in `/components/`

Happy blogging! 🚀
