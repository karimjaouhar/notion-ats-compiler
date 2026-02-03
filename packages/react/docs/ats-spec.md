# React Renderer Spec (AST -> React)

## Input Types

This package consumes these public exports from `@notion-ats/compiler`:

- `Article`
- `ArticleNode`
- `RichTextSpan`

The renderer must not depend on Notion SDK types or block JSON.

## Output

The renderer produces React elements that correspond to semantic HTML and remain unstyled by default.

## Node Rendering Rules

### article
- Wrap in a top-level `<article>` by default.

### heading
AST: `{ type: "heading", level, id, text }`
Default render:
```html
<h{level} id="{id}">...</h{level}>
```

### paragraph
AST: `{ type: "paragraph", text }`
Default render:
```html
<p>...</p>
```

### list
AST: `{ type: "list", ordered, items }`
Default render:
- `ordered = false` -> `<ul>`
- `ordered = true` -> `<ol>`
- `items` -> `<li>` containing rendered children

### code
AST: `{ type: "code", language, code, caption? }`
Default render:
```html
<figure>
  <pre><code class="language-{language}">...</code></pre>
  <figcaption>...</figcaption> (optional)
</figure>
```

### image
AST: `{ type: "image", src, alt?, caption? }`
Default render:
```html
<figure>
  <img src="..." alt="..." />
  <figcaption>...</figcaption> (optional)
</figure>
```

Alt text defaults to `alt` when provided, otherwise caption plain text, otherwise empty string.

### quote
AST: `{ type: "quote", children }`
Default render:
```html
<blockquote>...</blockquote>
```

### divider
AST: `{ type: "divider" }`
Default render:
```html
<hr />
```

### toggle
AST: `{ type: "toggle", summary, children }`
Default render:
```html
<details>
  <summary>...</summary>
  ...children...
</details>
```

### admonition
AST: `{ type: "admonition", kind, title?, tone?, icon?, children }`
Default render:
```html
<aside data-kind="{kind}" data-tone="{tone}">
  <div>...</div> (optional title / icon)
  ...children...
</aside>
```

### table
AST: `{ type: "table", hasHeader, rows }`
Default render:
- `hasHeader = true` -> first row in `<thead>` with `<th>`
- remaining rows in `<tbody>` with `<td>`
- `hasHeader = false` -> all rows in `<tbody>`

### embed
AST: `{ type: "embed", url, caption? }`
Default render:
```html
<figure>
  <a href="{url}" rel="noreferrer noopener" target="_blank">{url}</a>
  <figcaption>...</figcaption> (optional)
</figure>
```

### bookmark
AST: `{ type: "bookmark", url, title?, description? }`
Default render:
```html
<div>
  <a href="{url}" rel="noreferrer noopener" target="_blank">{title || url}</a>
  <p>{description}</p> (optional)
</div>
```

## Rich Text Rendering Rules

`RichTextSpan` types map to nested inline elements:

- `text` -> string
- `bold` -> `<strong>{children}</strong>`
- `italic` -> `<em>{children}</em>`
- `code` -> `<code>{text}</code>` (inline)
- `link` -> `<a href="...">{children}</a>`

Do not add styling by default.

Links created by rich text spans, embeds, and bookmarks include safe defaults:
`rel="noreferrer noopener"` and `target="_blank"`. Override via components.

## Custom Components

Users may override rendering per node type via a components map.

The library must:

- Provide defaults for all node types.
- Call user overrides when provided.
- Keep override props stable and minimal.
- Pass children already rendered.
- Provide a `components.link` override for rich text links.

## Public API

### Primary API
- `ArticleRenderer` — convenience component

### Functional API
- `renderArticle(article, options?)`
- `renderNode(node, options?)`
- `renderNodes(nodes, options?)`
- `renderRichText(spans, options?)`

### Types
- `RendererComponents`
- `RenderOptions`

Example usage:

```tsx
import { ArticleRenderer } from "@notion-ats/react";

<ArticleRenderer article={article} />;
```

Customized:

```tsx
import { ArticleRenderer } from "@notion-ats/react";

<ArticleRenderer
  article={article}
  components={{
    heading: ({ level, id, children }) => (
      <MyHeading as={`h${level}`} id={id}>
        {children}
      </MyHeading>
    ),
    code: ({ language, code }) => <MyCode lang={language} code={code} />
  }}
/>;
```
