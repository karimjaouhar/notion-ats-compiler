# React Renderer Architecture

## Purpose

`@notion-ast/react` is a React renderer for the **Article AST** produced by `@notion-ast/compiler`.

- Input: `Article` / `ArticleNode` (framework-agnostic AST)
- Output: React elements that render **semantic HTML** suitable for blogs/docs.

This package must **not** depend on Notion API shapes or block JSON.

## Core Principles

1) **No Notion awareness**
   - The renderer only understands the Article AST and rich text spans.
   - Notion fetching/compiling happens in `@notion-ast/compiler`.

2) **Semantic HTML by default**
   - Headings render as `h1..h6`
   - Paragraphs as `p`
   - Lists as `ul/ol/li`
   - Code as `pre > code`
   - Quote as `blockquote`
   - Tables as `table/thead/tbody/tr/td/th`
   - Images as `figure/img/figcaption` (when caption present)
   - Admonitions as `aside` (or `div`) with accessible structure
   - Embeds/Bookmarks as semantic links or wrappers

3) **Customizable via component overrides**
   - Users can override rendering per node type without forking.
   - Overrides should be ergonomic and predictable.

4) **Deterministic output**
   - Rendering should be stable given the same input AST.
   - No random IDs or time-based behavior.

5) **Small dependency surface**
   - React is a peer dependency.
   - Avoid heavyweight styling systems in core.
   - Provide unstyled defaults that users can theme.

## Rendering Pipeline

The renderer is pure functions + optional React component wrapper:

- `renderRichText(spans, ctx)` → React nodes
- `renderNode(node, ctx)` → React element
- `renderArticle(article, ctx)` → React element
- `<ArticleRenderer article={...} />` → convenience wrapper over `renderArticle`

## File/Module Layout

Recommended:

- `src/index.ts` — public exports only
- `src/render/article.tsx` — `renderArticle`
- `src/render/node.tsx` — `renderNode`
- `src/render/richText.tsx` — `renderRichText`
- `src/types.ts` — renderer-specific types (component override types, render context)

## Boundaries

- ✅ Allowed imports: `@notion-ast/compiler` public exports (types + helpers)
- ❌ Disallowed imports: any internal compiler modules (`../compiler/src/...`) or Notion SDK types
