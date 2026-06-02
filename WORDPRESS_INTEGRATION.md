# WordPress Integration Guide - Daily Brief

Your Daily Brief blog has been successfully migrated from Sanity CMS to WordPress REST API. This document explains exactly how the content flows from your WordPress site to the frontend.

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [How to Publish Articles](#how-to-publish-articles)
3. [Homepage Content Management](#homepage-content-management)
4. [Categories & Taxonomy](#categories--taxonomy)
5. [Images & Featured Media](#images--featured-media)
6. [Local Development](#local-development)
7. [Deployment](#deployment)

---

## Architecture Overview

### System Flow
```
Your WordPress Site (fenadaily.com)
         ↓
   WordPress REST API
   (/wp-json/wp/v2/posts, categories, etc.)
         ↓
   Next.js Frontend (localhost:3000)
   - Fetches data via WordPress API
   - Displays articles with premium design
   - Caches content for performance
```

### Tech Stack
- **Frontend**: Next.js 16 with React 19 (App Router)
- **Backend CMS**: WordPress.org (fenadaily.com)
- **API**: WordPress REST API v2
- **Styling**: Tailwind CSS 4
- **Caching**: Next.js built-in ISR (Incremental Static Regeneration)

### Files You Need to Know
- `src/lib/wordpress.ts` - All WordPress REST API calls
- `src/lib/content.ts` - Data transformation and type definitions
- `src/app/page.tsx` - Homepage (fetches featured, trending, latest posts)
- `src/app/article/[slug]/page.tsx` - Individual article pages
- `src/app/category/[slug]/page.tsx` - Category listing pages

---

## How to Publish Articles

### Step 1: Create an Article in WordPress

1. Go to **https://fenadaily.com/wp-admin**
2. Click **Posts** → **Add New**
3. Fill in:
   - **Title**: Your article headline
   - **Content**: Full article body (use WordPress editor)
   - **Excerpt**: Brief summary (shows in cards)
   - **Featured Image**: Add a cover image
   - **Category**: Select one (Crypto, Finance, Tech, Lifestyle, Blogging)

### Step 2: Optimize SEO (optional but recommended)

If you have Yoast SEO or similar:
- Set SEO Title and Meta Description
- These appear in search results and social shares

### Step 3: Publish

Click **Publish** and your article automatically appears on Daily Brief within minutes.

### Example Content Structure

```
Title: "The Future of AI Ethics in Publishing"

Category: Tech

Excerpt: "New guidelines are reshaping how AI-powered content tools work. Here's what publishers need to know."

Featured Image: [upload high-quality image]

Content:
Why This Matters
AI adoption in publishing raises critical questions...

The Regulatory Landscape
Recent policy changes...

Practical Implementation
How to implement AI responsibly...
```

---

## Homepage Content Management

### Featured Story Section
- **Source**: First sticky post (or most recent if no sticky posts)
- **How to set**: In WordPress post editor, tick the "Sticky post" checkbox
- **Display**: Large hero card on homepage

### Trending Section
- **Source**: Sticky posts (marked as pinned)
- **Display**: Top 3 most recent sticky posts show in right sidebar
- **How to manage**: Use WordPress sticky feature to promote articles

### Latest Posts Section
- **Source**: Most recent 4 published posts
- **Display**: Grid of 4 articles on homepage
- **Auto-updates**: Every time you publish a new post

### Category Sections
- **Source**: All WordPress categories
- **Display**: Grid showing category cards with description
- **Note**: Categories are automatically fetched from WordPress

### Navigation
- **Auto-generated**: Category links pull from your WordPress categories
- **Location**: Top navigation bar updates automatically

---

## Categories & Taxonomy

### Available Categories
Currently, your site has these categories:
- Blogging
- Crypto
- Finance
- Tech
- Lifestyle

### Adding New Categories

1. In WordPress: **Posts** → **Categories**
2. Click **Add New Category**
3. Enter name and slug (e.g., "AI" → "ai")
4. The category automatically appears in navigation

### Category Pages
- URL format: `https://localhost:3000/category/crypto`
- Shows all posts in that category
- Auto-generated when you add categories in WordPress

---

## Images & Featured Media

### Featured Image (Primary Hero Image)

1. In WordPress post editor, set Featured Image
2. **Recommended size**: 1200x630px (will auto-crop responsively)
3. **File format**: JPG or PNG
4. **Max size**: 5MB
5. Shows as:
   - Large hero image on article page
   - Thumbnail in article cards on homepage

### Image Optimization
- Images are served from your WordPress media library
- Daily Brief displays them responsively on mobile, tablet, desktop
- No additional image optimization needed

---

## Local Development

### Prerequisites
```bash
Node.js 18+ (check with `node -v`)
npm or yarn package manager
```

### Getting Started

#### 1. Install Dependencies
```bash
cd path/to/blog
npm install
```

#### 2. Start Development Server
```bash
npm run dev
```

Visit **http://localhost:3000** in your browser

#### 3. What You'll See
- **Homepage**: Featured story, trending, latest posts, categories
- **Article pages**: `/article/[slug]` - Individual post view
- **Category pages**: `/category/[slug]` - Posts filtered by category
- **Real WordPress data**: Everything pulls from https://fenadaily.com

### Test Workflow

1. **Publish a test post** in WordPress (fenadaily.com/wp-admin)
2. **Refresh localhost:3000** in browser
3. **New article should appear** within 30 seconds
4. **Click to read** the full article
5. **Check category page** - article appears there too

### Troubleshooting

**Problem**: Posts not showing on homepage
- Check WordPress REST API: https://fenadaily.com/wp-json/wp/v2/posts
- Posts should return JSON array
- If error, contact WordPress host about REST API settings

**Problem**: Images not loading
- Check Featured Image is set in WordPress
- Verify image URL is accessible: https://fenadaily.com/uploads/...
- Check browser console for CORS errors

**Problem**: Dev server crashes
- Run `npm install` again
- Delete `.next` folder and restart: `npm run dev`

---

## Deployment

### Build for Production
```bash
npm run build
```

This creates optimized Next.js build at `.next/`

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel (vercel.com)
3. Select Next.js framework
4. Deploy - your site goes live

**Benefits**:
- Automatic builds on every push
- Edge caching for fast global performance
- Real-time analytics
- Preview deployments for testing

### Deploy to Other Platforms

**Node.js hosting** (AWS, DigitalOcean, Heroku):
```bash
npm run build
npm start
```

**Static hosting** (not recommended for dynamic posts):
```bash
npm run build  # Creates .next/ with static assets
```

### Revalidation Strategy

Daily Brief uses ISR (Incremental Static Regeneration):
- **Homepage**: Revalidates every 30 minutes
- **Article pages**: On-demand (generated when visited)
- **Category pages**: On-demand

When you publish a new post in WordPress, it's live on Daily Brief within 30 minutes automatically.

---

## API Reference

### WordPress Endpoints Used

#### Get All Posts
```
GET https://fenadaily.com/wp-json/wp/v2/posts?per_page=20&_embed=author,wp:featuredmedia
```

Returns: Array of post objects with author and featured media embedded

#### Get Post by Slug
```
GET https://fenadaily.com/wp-json/wp/v2/posts?slug=my-article-slug&_embed=author,wp:featuredmedia
```

#### Get All Categories
```
GET https://fenadaily.com/wp-json/wp/v2/categories?per_page=100
```

#### Get Category ID
```
GET https://fenadaily.com/wp-json/wp/v2/categories?slug=crypto
```

#### Get Posts by Category
```
GET https://fenadaily.com/wp-json/wp/v2/posts?categories=5&per_page=20&_embed=author,wp:featuredmedia
```

---

## Content Best Practices

### SEO Tips
1. Write compelling titles (60 chars)
2. Write meta descriptions (160 chars)
3. Use target keywords naturally
4. Add alt text to featured images
5. Use proper heading hierarchy (H2, H3, not multiple H1s)

### Article Structure
```
Title (60-70 chars)
↓
Featured Image (1200x630px)
↓
Excerpt (150-160 chars) - appears in cards
↓
Category (one main category)
↓
Author (shown on article page)
↓
Content
  - Introduction
  - Main sections
  - Conclusion
  - Call-to-action
```

### Recommended Publishing Schedule
- **Frequency**: 2-4 posts per week (adjust to your capacity)
- **Best times**: Tuesday-Thursday, 9-11 AM
- **Mix content**: Vary between your categories

---

## Monitoring & Analytics

### Check What's Live
```bash
# In development or production:
curl https://fenadaily.com/wp-json/wp/v2/posts?per_page=5
```

Shows your 5 most recent posts with all metadata

### Monitor Performance
- **Vercel Dashboard**: If deployed to Vercel
- **Browser DevTools**: Check Network tab for API response times
- **WordPress Dashboard**: Check Post count and health

---

## Common Tasks

### Task: Change Homepage Featured Story
In WordPress:
1. Go to the post you want to feature
2. Check "Sticky post" checkbox
3. Save
4. Homepage updates within 30 min

### Task: Add New Category
In WordPress:
1. Posts → Categories → Add New
2. Enter category name (e.g., "Crypto")
3. Enter slug (e.g., "crypto")
4. Save
5. Navigation automatically updates

### Task: Unpublish an Article
In WordPress:
1. Go to post
2. Change status from "Publish" to "Draft"
3. Save
4. Article disappears from Daily Brief within 30 min

### Task: Update Article After Publishing
In WordPress:
1. Edit the post
2. Make changes
3. Click "Update"
4. Daily Brief updates within 5 minutes

---

## Support & Troubleshooting

### WordPress REST API Issues
- Ensure WordPress REST API is enabled (usually enabled by default)
- Check: https://fenadaily.com/wp-json/ - should show JSON
- If broken, contact your WordPress host

### Frontend Issues
- Check browser console for errors (F12)
- Clear Next.js cache: Delete `.next/` and restart
- Rebuild: `npm run build`

### Deployment Issues
- Check build logs in Vercel or your hosting platform
- Verify Node.js version (16+): `node -v`
- Reinstall dependencies: `rm -rf node_modules && npm install`

---

## Architecture Decisions

### Why WordPress REST API?
✅ Simple and reliable
✅ No additional plugins needed
✅ Works with any WordPress host
✅ Standard JSON responses
✅ Easy to cache

### Why Next.js?
✅ SEO-friendly (server rendering)
✅ Fast performance (ISR, caching)
✅ TypeScript support
✅ Easy deployment to Vercel
✅ Automatic code splitting

### Why not WPGraphQL?
- WordPress REST API is simpler to set up
- No additional plugins needed
- REST endpoints are slightly easier to understand
- Both work equally well for this use case

---

## Next Steps

1. ✅ **You have**: WordPress site + Next.js frontend
2. **Now do**: Start creating content in WordPress
3. **Then**: Test locally with `npm run dev`
4. **Finally**: Deploy to Vercel or your host

Good luck! 🚀
