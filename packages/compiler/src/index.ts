// ─────────────────────────────────────────────────────────
// Primary API (recommended entry point)
// ─────────────────────────────────────────────────────────
export { compileNotionPage } from "./notion/page.js";
export { compileNotionDatabaseIndex } from "./notion/database.js";

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
  ArticleMeta,
  AdmonitionNode
} from "./ast/types.js";
export type { DatabasePropertyMapping, PostListItem } from "./notion/database.js";

// ─────────────────────────────────────────────────────────
// Text utilities (safe helpers)
// ─────────────────────────────────────────────────────────
export { toPlainText } from "./ast/text.js";
export type { RichTextSpan } from "./ast/text.js";
