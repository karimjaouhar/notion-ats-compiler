# React Renderer Spec (AST → React)

## Input Types

This package consumes:

- `Article`
- `ArticleNode`
- `RichTextSpan`

from `@notion-ast/compiler` public exports.

## Output

The renderer produces React elements that correspond to semantic HTML.

## Node Rendering Rules

### article
- Wrap in a top-level `<article>` by default.

### heading
AST: `{ type: "heading", level, id, text }`
Default render:
```html
<h{level} id="{id}">...</h{level}>
paragraph

AST: { type: "paragraph", text }
Default:

<p>...</p>

list

AST: { type: "list", ordered, items }
Default:

ordered=false → <ul>

ordered=true → <ol>

items → <li> containing child nodes

code

AST: { type: "code", language, code, caption? }
Default:

<figure>
  <pre><code class="language-{language}">...</code></pre>
  <figcaption>...</figcaption> (optional)
</figure>

image

AST: { type: "image", src, caption? }
Default:

<figure>
  <img src="..." alt="..." />
  <figcaption>...</figcaption> (optional)
</figure>


Alt text default can be derived from caption plain text or empty string.

quote

AST: { type: "quote", children }
Default:

<blockquote>...</blockquote>

divider

AST: { type: "divider" }
Default:

<hr />

toggle

AST: { type: "toggle", summary, children }
Default:

<details>
  <summary>...</summary>
  ...children...
</details>

admonition

AST: { type: "admonition", kind, title?, children }
Default:

<aside data-kind="{kind}">
  <strong>...</strong> (optional title)
  ...children...
</aside>

table

AST: { type: "table", hasHeader, rows }
Default:

if hasHeader:

first row → <thead> with <th>

remaining rows → <tbody> with <td>

else:

all rows → <tbody> with <td>

embed

AST: { type: "embed", url, caption? }
Default:

<figure>
  <a href="{url}" rel="noreferrer noopener" target="_blank">{url}</a>
  <figcaption>...</figcaption> (optional)
</figure>

bookmark

AST: { type: "bookmark", url, title?, description? }
Default:

<div>
  <a href="{url}" rel="noreferrer noopener" target="_blank">{title || url}</a>
  <p>{description}</p> (optional)
</div>

Rich Text Rendering Rules

RichTextSpan types map to nested inline elements:

text → string

bold → <strong>{children}</strong>

italic → <em>{children}</em>

code → <code>{text}</code> (inline)

link → <a href="...">children</a>

Do not add styling by default.

Custom Components

Users may override rendering per node type via a components map.

The library must:

provide defaults for all node types

call user overrides when provided

keep override props stable and minimal


---

# 2) Minimal public API proposal for `@notion-ast/react`

Keep it small and “obvious”:

### Primary API
- `ArticleRenderer` — convenience component

### Functional API (power users)
- `renderArticle(article, options?)`
- `renderNode(node, options?)`
- `renderRichText(spans, options?)`

### Types
- `RendererComponents`
- `RenderOptions`

Example consumer usage:

```tsx
import { ArticleRenderer } from "@notion-ast/react";

<ArticleRenderer article={article} />


Customized:

import { ArticleRenderer } from "@notion-ast/react";

<ArticleRenderer
  article={article}
  components={{
    heading: ({ level, id, children }) => <MyHeading as={`h${level}`} id={id}>{children}</MyHeading>,
    code: ({ language, code }) => <MyCode lang={language} code={code} />
  }}
/>