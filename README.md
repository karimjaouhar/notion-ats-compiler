# notion-ats

Semantic Article AST from Notion, plus a renderer-agnostic React renderer.

## Article AST (high level)

The compiler produces an `Article`:

```ts
type Article = {
  type: "article";
  meta: ArticleMeta;
  body: ArticleNode[];
};
```

`ArticleNode` represents semantic content such as:

- headings
- paragraphs
- lists
- code blocks
- images
- quotes
- admonitions
- tables
- embeds / bookmarks
- toggles

The AST is:

- deterministic
- renderer-agnostic
- versioned with strict compatibility rules

## Usage

### Compile a Notion page

```ts
import { compileNotionPage } from "@notion-ats/compiler";

const article = compileNotionPage({
  page,
  blocks,
  onWarning: console.warn
});
```

### Render with React

```tsx
import { ArticleRenderer } from "@notion-ats/react";

export default function Post({ article }) {
  return <ArticleRenderer article={article} />;
}
```

### Customize rendering

```tsx
<ArticleRenderer
  article={article}
  components={{
    heading: ({ level, id, children }) => (
      <MyHeading as={`h${level}`} id={id}>
        {children}
      </MyHeading>
    ),
    code: ({ language, code }) => <MyCodeBlock lang={language} code={code} />
  }}
/>;
```

This is how you integrate:

- Tailwind / shadcn / MUI / Chakra
- Next.js `Link` and `Image`
- custom design systems

without forking the renderer.

## Public API guarantees

### Compiler (`@notion-ats/compiler`)

Primary (recommended):

- `compileNotionPage`

Advanced (power users):

- `compileBlocksToArticle`
- `compilePageMeta`

Public types (stable contract):

- `Article`
- `ArticleNode`
- `ArticleMeta`
- `RichTextSpan`

Helpers:

- `toPlainText`

Only what is exported from `packages/compiler/src/index.ts` is public API.

### React renderer (`@notion-ats/react`)

Public exports:

- `ArticleRenderer`
- `renderArticle`
- `renderNode`
- `renderNodes`
- `renderRichText`
- renderer types (`RenderOptions`, `RendererComponents`, etc.)

No Notion imports. No deep compiler imports.

## Versioning rules (v1+)

Breaking changes (major):

- Any change to the shape or semantics of `Article`, `ArticleNode`, `ArticleMeta`
- Any change that alters rendered output for the same AST
- Adding or removing AST node types
- Removing or renaming public exports

Non-breaking changes (minor / patch):

- Bug fixes that preserve AST invariants
- Adding optional fields
- Adding new renderer helpers without changing defaults
- Documentation, tests, examples

## Examples

- `examples/next-blog`: Next.js app demonstrating live Notion fetch, React rendering,
  and on-demand revalidation (webhook style).

## Notion database mapping

If your content lives in a Notion database, use the helper that maps
database properties into a normalized blog index item:

- `compileNotionDatabaseIndex` in `@notion-ats/compiler`
- Property mapping docs: `packages/compiler/docs/notion-db-mapping.md`

## Status

- Compiler: stable and well-tested
- React renderer: v0.2 complete (semantic rendering + overrides)
- Examples / CLI: in progress

## What's next

Planned milestones include:

- More example apps (ISR + cache-backed)
- MDX / HTML exporters
- CLI tooling (snapshot + compile)
- Theme packs and renderer adapters
