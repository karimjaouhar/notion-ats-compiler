# Article AST Spec (v0)

## Principles
- Semantic, blog-first (not Notion-shaped)
- Renderer-agnostic
- Deterministic output
- Minimal but extensible

## Root
Article:
- meta: title?, slug?, date?, tags?, canonicalUrl?
- body: Node[]

## Text Model
Inline content is RichTextSpan[].
Spans can nest (bold contains children).

## Nodes (v0)
- heading(level: 1-6, id, text)
- paragraph(text)
- code(language, code, caption?)
- image(src, alt?, caption?)
- table(hasHeader, rows[])
- embed(url, caption?)
- bookmark(url, title?, description?)
- list(ordered, items[])
- admonition(kind: note|tip|warning|info, title?, children[])
- quote(children[])
- divider
- toggle(summary, children[])

## Invariants
- `heading.id` must be stable and URL-safe.
- `list.items[].children` is a Node[] (so list items can contain nested lists, etc.)
- `paragraph.text` must not be empty (compiler may drop empty paragraphs).

## Frozen invariants (v1)
These are guaranteed by the compiler and must remain stable.

### Common
- Output is deterministic for the same input.
- Node ordering is preserved from the source block order.

### Text
- `RichTextSpan[]` preserves text order.
- `toPlainText` is a pure projection of spans.

### Nodes
- `heading`: `level` in 1..6, `id` non-empty and URL-safe.
- `paragraph`: `text` non-empty (empty/whitespace paragraphs are dropped).
- `code`: `language` and `code` are strings; `caption` is optional.
- `image`: `src` is non-empty; `caption` is optional.
- `table`: `rows` preserve row order; `cells` preserve cell order.
- `embed`: `url` is non-empty; `caption` is optional.
- `bookmark`: `url` is non-empty; `title`/`description` are optional.
- `list`: `items[].children` is a Node[] and preserves order.
- `admonition`: `kind` in `note|tip|warning|info`; `title` optional.
- `quote`: `children` is a Node[] and preserves order.
- `divider`: no additional fields.
- `toggle`: `summary` non-empty; `children` preserves order.
