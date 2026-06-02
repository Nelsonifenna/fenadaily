# Daily Brief

A production-ready premium digital publication website with Next.js frontend powered by WordPress REST API.

## Architecture

- **Frontend**: Next.js 16 App Router + React 19
- **CMS**: WordPress.org (https://fenadaily.com)
- **API**: WordPress REST API v2
- **Styling**: Tailwind CSS 4
- **Type Safety**: TypeScript
- **Caching**: ISR (Incremental Static Regeneration)

## What is included

- Next.js App Router frontend with premium design
- Tailwind CSS styling (mobile-first)
- WordPress REST API integration at `src/lib/wordpress.ts`
- Dynamic article pages, category pages, and homepage
- SEO metadata and sitemap/robots support
- Mobile-first homepage for featured stories, trending news, latest posts, and newsletter CTA
- Auto-generated category pages
- Responsive images from WordPress media library

## Folder structure

- `src/app/` — homepage, article pages, category pages, SEO files
- `src/components/` — reusable card components
- `src/lib/wordpress.ts` — WordPress REST API integration (NEW)
- `src/lib/content.ts` — data transformation and types
- `WORDPRESS_INTEGRATION.md` — complete integration guide
- `QUICK_START.md` — quick reference guide
- `MIGRATION_COMPLETE.md` — migration documentation

## Local development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000

The site automatically fetches content from WordPress REST API at `https://fenadaily.com/wp-json/wp/v2/`

## Publishing articles

1. Go to WordPress Admin: https://fenadaily.com/wp-admin
2. Click **Posts** → **Add New**
3. Fill in title, content, excerpt, featured image, category
4. Click **Publish**
5. Article appears on Daily Brief within 30 seconds

For complete guide, see [WORDPRESS_INTEGRATION.md](WORDPRESS_INTEGRATION.md)

## How content syncs

```
WordPress Post
    ↓
REST API (/wp-json/wp/v2/posts)
    ↓
Next.js fetches
    ↓
Transforms data
    ↓
Renders on Daily Brief
    ↓
30-min cache (ISR) on homepage
    ↓
On-demand rendering for article/category pages
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to Vercel (vercel.com)
3. Select Next.js framework
4. Deploy (auto-redeploys on push)

### Self-hosted

```bash
npm run build
npm start
# Runs on port 3000
```

## Environment variables

No environment variables required. The site fetches from the public WordPress REST API at:
```
https://fenadaily.com/wp-json/wp/v2/
```

## Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm start         # Run production build
npm run lint      # Lint code
```

## Features

- ✅ Auto-fetches WordPress articles, categories, images
- ✅ Dynamic category pages
- ✅ Featured story management (sticky posts)
- ✅ Trending section auto-updates
- ✅ Latest posts grid
- ✅ Category lens showing all available categories
- ✅ Responsive design (mobile-first)
- ✅ SEO-friendly (server-side rendering)
- ✅ Performance optimized (ISR caching)
- ✅ Fast image loading
- ✅ Auto-calculated reading time
- ✅ Author attribution

## Learn more

- [WordPress REST API Docs](https://developer.wordpress.org/rest-api/)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Complete Integration Guide](WORDPRESS_INTEGRATION.md)

- Create an article: use Sanity Studio > Article > New document
- Upload images: use the image field in the article form
- Publish content: set status to published and save
- Manage categories: use Category documents
- Update homepage sections: use Homepage document and article toggles
- Deploy updates: push to GitHub and redeploy on Vercel
