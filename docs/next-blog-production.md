# Production Next.js Blog Guide

This guide shows a pragmatic production setup for a Next.js blog using:

- `@notion-ats/compiler` for Notion -> Article AST
- `@notion-ats/react` for semantic rendering
- Next.js App Router for routing, caching, and revalidation

It assumes you want **fast pages**, **deterministic output**, and **editor-friendly updates**.

## Architecture overview

1) Fetch Notion page + blocks
2) Compile to Article AST
3) Render via `ArticleRenderer`
4) Cache with ISR
5) Revalidate via webhook on publish

## Recommended strategy (ISR + webhook)

### Why

- **Fast**: cached pages served from edge/cache.
- **Fresh**: webhook triggers immediate updates.
- **Simple**: no DB required to start.

### Page route (ISR)

```tsx
export const revalidate = 300; // 5 minutes as a safety net

export default async function PostPage({ params }: { params: { pageId: string } }) {
  const { page, blocks } = await fetchPageWithBlocks(params.pageId);
  const article = compileNotionPage({ page, blocks });
  return <ArticleRenderer article={article} />;
}
```

### Revalidate endpoint (webhook)

```ts
// POST /api/revalidate?secret=...
revalidatePath(`/posts/${pageId}`);
```

## Styling: quick and professional

You get **unstyled semantic HTML**. The fastest path to great typography:

- Tailwind + `@tailwindcss/typography` (`prose` class)
- shadcn typography preset
- Your own design system styles

Example:

```tsx
<div className="prose prose-slate max-w-none">
  <ArticleRenderer article={article} components={nextComponents} />
</div>
```

For component libraries (MUI/Chakra), use component overrides to map AST nodes
to design-system components.

## Overrides to integrate Next.js

Recommended overrides in production:

- `components.link` -> `next/link` for internal links
- `components.image` -> `next/image` with safe host allowlist

This keeps `@notion-ats/react` framework-agnostic while still using Next
features in your app.

## Scaling options

When traffic or content grows:

1) **Background sync to storage**
   - Periodically fetch Notion -> compile -> store JSON
   - Page renders read from storage (no Notion at runtime)

2) **DB-backed cache**
   - Store compiled AST in Postgres/Redis
   - Revalidate on webhook to update cache

3) **Static export (optional)**
   - Pre-render HTML if content is mostly static

## Operational notes

- Notion API has rate limits. Cache aggressively.
- Validate inputs (pageId) and guard missing token/secret.
- Treat warnings from the compiler as observability signals.

## Minimum environment variables

```
NOTION_TOKEN=secret_xxx
REVALIDATE_SECRET=your-secret
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```
