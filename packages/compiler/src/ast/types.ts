import type { RichTextSpan } from "./text.js";

export type ArticleMeta = {
  title?: string;
  slug?: string;
  date?: string; // ISO
  tags?: string[];
  canonicalUrl?: string;
  summary?: string;
  author?: string;
  coverUrl?: string;
  authorImageUrl?: string;
  readTimeMinutes?: number;
};

export type Article = {
  type: "article";
  meta: ArticleMeta;
  body: ArticleNode[];
};

export type ArticleNode =
  | HeadingNode
  | ParagraphNode
  | CodeNode
  | ImageNode
  | TableNode
  | EmbedNode
  | BookmarkNode
  | ListNode
  | AdmonitionNode
  | QuoteNode
  | DividerNode
  | ToggleNode;

export type HeadingNode = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;
  text: RichTextSpan[];
};

export type ParagraphNode = {
  type: "paragraph";
  text: RichTextSpan[];
};

export type CodeNode = {
  type: "code";
  language: string;
  code: string;
  caption?: RichTextSpan[];
};

export type ImageNode = {
  type: "image";
  src: string;
  alt?: string;
  caption?: RichTextSpan[];
};

export type TableRow = {
  cells: RichTextSpan[][];
};

export type TableNode = {
  type: "table";
  hasHeader: boolean;
  rows: TableRow[];
};

export type EmbedNode = {
  type: "embed";
  url: string;
  caption?: RichTextSpan[];
};

export type BookmarkNode = {
  type: "bookmark";
  url: string;
  title?: string;
  description?: string;
};

export type ListItem = {
  children: ArticleNode[];
};

export type ListNode = {
  type: "list";
  ordered: boolean;
  items: ListItem[];
};

export type AdmonitionNode = {
  type: "admonition";
  kind: "note" | "tip" | "warning" | "info";
  title?: RichTextSpan[];
  tone?: string;
  icon?: string;
  children: ArticleNode[];
};

export type QuoteNode = {
  type: "quote";
  children: ArticleNode[];
};

export type DividerNode = {
  type: "divider";
};

export type ToggleNode = {
  type: "toggle";
  summary: RichTextSpan[];
  children: ArticleNode[];
};
