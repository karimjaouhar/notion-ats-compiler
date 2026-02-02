# Architecture

## Goal
Use Notion as an authoring tool, but publish as a real blog.

## Layers
1) Notion (content source)
2) Core engine: Notion blocks -> Article AST (this repo)
3) Renderers: AST -> React/MDX/HTML (future packages)

## This repo
- Exposes an Article AST type system
- Provides a compiler that consumes Notion blocks (from the official Notion API)
- Outputs deterministic AST for downstream renderers
