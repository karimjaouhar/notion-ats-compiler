# notion-ast-compiler

Compile Notion page blocks into a semantic, blog-first Article AST.

## Why
Notion is a great editor but a poor blog focused frontend. This project converts Notion content into a stable, renderer-agnostic AST that can be rendered with React, exported to MDX, etc.

## Packages

This repository is a pnpm workspace with the following packages:

- `packages/compiler` — the Notion AST compiler package (published as `notion-ast-compiler`).
- `packages/react` — a placeholder React package scaffold for future renderer integrations.

## Usage
```ts
import { compileBlocksToArticle } from "notion-ast-compiler";

const article = compileBlocksToArticle(blocks, { meta: { title: "My Post" } });
```

## Public API

The only supported public contract is what is exported from `src/index.ts`.

Primary (recommended):
- `compileNotionPage`

Advanced (power users):
- `compileBlocksToArticle`
- `compilePageMeta`

Public domain types:
- `Article`, `ArticleNode`, `ArticleMeta`

Safe helpers:
- `toPlainText`

## Versioning rules (v1+)

Breaking changes (major):
- Any change to the shape or semantics of `Article`, `ArticleNode`, or `ArticleMeta`.
- Any change to required fields or invariants in the AST spec.
- Any change to output for supported block types for the same input.
- Adding new node types or required fields.
- Removing/renaming public exports.

Non-breaking changes (minor/patch):
- Bug fixes that preserve AST invariants and public API shape.
- Adding optional fields that do not change existing output for the same input.
- Documentation and test-only changes.
