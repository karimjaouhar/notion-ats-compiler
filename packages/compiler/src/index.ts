// ─────────────────────────────────────────────────────────
// Primary API (recommended entry point)
// ─────────────────────────────────────────────────────────
export { compileNotionPage } from "./notion/page.js";

// ─────────────────────────────────────────────────────────
// Advanced APIs (power users only; not the golden path)
// ─────────────────────────────────────────────────────────
export { compileBlocksToArticle } from "./notion/compile.js";
export { compilePageMeta } from "./notion/meta.js";

// ─────────────────────────────────────────────────────────
// Public domain types (stable contract)
// ─────────────────────────────────────────────────────────
export type {
  Article,
  ArticleNode,
  ArticleMeta
} from "./ast/types.js";

// ─────────────────────────────────────────────────────────
// Text utilities (safe helpers)
// ─────────────────────────────────────────────────────────
export { toPlainText } from "./ast/text.js";
