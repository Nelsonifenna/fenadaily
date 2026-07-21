# WordPress → Next.js on-demand revalidation

This closes the gap that let a published article sit out of the sitemap for
~24 hours: WordPress now tells Next.js the instant a post is
published/updated, instead of Next.js finding out up to an hour later on its
own (see `src/app/sitemap.ts`'s fallback `revalidate` window).

## 1. Set the secret

In Vercel → Project Settings → Environment Variables, add:

```
REVALIDATE_SECRET=<generate with: openssl rand -hex 32>
```

Redeploy after adding it.

## 2. Add this to WordPress

Easiest path: **Settings → General** in the WordPress admin doesn't cover
this — you need a small snippet. Either use a "code snippets" plugin, or add
a file at `wp-content/mu-plugins/fenadaily-revalidate.php` (mu-plugins load
automatically, no activation step):

```php
<?php
/**
 * Notify the Next.js frontend to refresh the sitemap and homepage the
 * instant a post is published or updated, instead of waiting for its
 * time-based ISR window to elapse.
 */
add_action('transition_post_status', function ($new_status, $old_status, $post) {
    if ($post->post_type !== 'post') {
        return;
    }
    // Fire on the moment a post becomes published, and on any subsequent
    // save while it's already published (e.g. a correction/update).
    if ($new_status !== 'publish') {
        return;
    }

    $categories = get_the_category($post->ID);
    $category_slug = !empty($categories) ? $categories[0]->slug : null;

    wp_remote_post('https://www.fenadaily.com/api/revalidate?secret=REPLACE_WITH_REVALIDATE_SECRET', [
        'timeout'  => 5,
        'blocking' => false, // fire-and-forget — never slow down the WP save
        'headers'  => ['Content-Type' => 'application/json'],
        'body'     => wp_json_encode([
            'slug'     => $post->post_name,
            'category' => $category_slug,
        ]),
    ]);
}, 10, 3);
```

Replace `REPLACE_WITH_REVALIDATE_SECRET` with the same value you put in
Vercel. (If your `wp-content` is writable from a deploy pipeline rather than
the admin UI, storing the secret as a WordPress constant in `wp-config.php`
and reading it via `getenv()`/`FENADAILY_REVALIDATE_SECRET` is a cleaner
alternative to hardcoding it in the snippet — either works.)

## 3. Verify it's working

After publishing or editing a post, within a few seconds:

```
curl -s https://www.fenadaily.com/sitemap.xml | grep "your-new-post-slug"
```

should return the new URL. If it doesn't, check the response from the
webhook call itself — temporarily set `'blocking' => true` in the snippet
above and inspect the returned body/status while testing, then switch back
to `false` once confirmed.

## Why this is the correct fix, not a workaround

The underlying problem was architectural: `sitemap.ts` only re-ran (and thus
only re-queried WordPress) once every 24 hours, with nothing to tell it a
new article existed sooner. Shortening that window helps but still leaves a
real gap. This webhook removes the gap entirely — the site's cache is
invalidated by the actual publish event, not by a timer guessing when one
might have happened. The shortened `revalidate = 3600` fallback in
`sitemap.ts` still exists as a safety net for the case where WordPress can't
reach `/api/revalidate` (network hiccup, webhook misconfigured), so the
worst case is bounded at 1 hour instead of 24.
