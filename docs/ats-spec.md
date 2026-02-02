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
