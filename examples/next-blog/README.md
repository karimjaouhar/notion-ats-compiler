# Next Blog Example

Minimal Next.js example app that fetches a Notion page, compiles it to the
Article AST, and renders it with `@notion-ats/react`.

## Requirements

Create a `.env.local` file in `examples/next-blog` with:

```
NOTION_TOKEN=secret_xxx
NOTION_PAGE_ID=your-notion-page-id
# Optional: used to detect same-origin links for Next <Link />
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Required for on-demand revalidation endpoint
REVALIDATE_SECRET=change-me
```

## Run

From repo root:

```
pnpm --filter next-blog dev
```

Open:

```
http://localhost:3000/posts/<NOTION_PAGE_ID>
```

## On-demand revalidation (webhook style)

Set `REVALIDATE_SECRET` and call:

```
curl -X POST "http://localhost:3000/api/revalidate?secret=change-me" ^
  -H "Content-Type: application/json" ^
  -d "{\"pageId\":\"<NOTION_PAGE_ID>\"}"
```

This will revalidate `/posts/<NOTION_PAGE_ID>` immediately.

## How it works

1) Fetches the Notion page and blocks via `@notionhq/client`.
2) Compiles them with `compileNotionPage`.
3) Renders with `<ArticleRenderer article={article} />`.

## Next-specific overrides

The example overrides two renderers in `src/lib/renderers.tsx`:

- `components.link`: Uses `next/link` for internal links and falls back to
  `<a>` with safe defaults for external links.
- `components.image`: Uses `next/image` for Notion-hosted images and falls
  back to `<img>` otherwise.

No Next.js imports are added to `@notion-ats/react`.
