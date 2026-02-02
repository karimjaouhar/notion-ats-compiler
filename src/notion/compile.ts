import type {
  Article,
  ArticleNode,
  CodeNode,
  DividerNode,
  HeadingNode,
  ImageNode,
  ListItem,
  ListNode,
  ParagraphNode,
  QuoteNode
} from "../ast/types.js";
import { toPlainText, type RichTextSpan } from "../ast/text.js";
import { slugify } from "../utils/ids.js";
import { createUniqueIdFn } from "../utils/unique-ids.js";
import type { NotionBlock, NotionRichText } from "./types.js";
import { notionRichTextToSpans } from "./rich-text.js";

export type CompileOptions = {
  meta?: Article["meta"];
};

export function compileBlocksToArticle(blocks: NotionBlock[], opts: CompileOptions = {}): Article {
  const nextHeadingId = createUniqueIdFn();

  return {
    type: "article",
    meta: opts.meta ?? {},
    body: compileBlocks(blocks, nextHeadingId)
  };
}

function compileBlocks(blocks: NotionBlock[], nextHeadingId: (base: string) => string): ArticleNode[] {
  const body: ArticleNode[] = [];

  for (let i = 0; i < blocks.length; i += 1) {
    const b = blocks[i];

    if (isListItemType(b.type)) {
      const ordered = b.type === "numbered_list_item";
      const items: ListItem[] = [];

      while (i < blocks.length && blocks[i].type === b.type) {
        const itemBlock = blocks[i];
        const itemChildren: ArticleNode[] = [];
        const text = notionRichTextToSpans(getRichText(itemBlock, itemBlock.type));
        const plain = toPlainText(text).trim();
        if (plain.length > 0) {
          itemChildren.push({ type: "paragraph", text });
        }
        const nested = compileBlocks(getChildren(itemBlock), nextHeadingId);
        itemChildren.push(...nested);
        items.push({ children: itemChildren });
        i += 1;
      }

      const node: ListNode = { type: "list", ordered, items };
      body.push(node);
      i -= 1;
      continue;
    }

    if (b.type === "heading_1" || b.type === "heading_2" || b.type === "heading_3") {
      const level = b.type === "heading_1" ? 1 : b.type === "heading_2" ? 2 : 3;
      const text = notionRichTextToSpans(getRichText(b, b.type));
      const plain = toPlainText(text);
      const baseId = slugify(plain) || "heading";
      const node: HeadingNode = {
        type: "heading",
        level,
        id: nextHeadingId(baseId),
        text
      };
      body.push(node);
      continue;
    }

    if (b.type === "paragraph") {
      const text = notionRichTextToSpans(getRichText(b, "paragraph"));
      const plain = toPlainText(text).trim();
      if (plain.length === 0) continue;
      const node: ParagraphNode = { type: "paragraph", text };
      body.push(node);
      continue;
    }

    if (b.type === "code") {
      const text = notionRichTextToSpans(getRichText(b, "code"));
      const codeText = toPlainText(text);
      // Notion always provides a language; default to "plain" for stability.
      const language = b.code?.language ?? "plain";
      const caption = getOptionalCaption(b.code?.caption);
      const node: CodeNode = {
        type: "code",
        language,
        code: codeText,
        ...(caption ? { caption } : {})
      };
      body.push(node);
      continue;
    }

    if (b.type === "image") {
      const image = b.image;
      const src =
        image?.type === "file" ? image.file?.url : image?.type === "external" ? image.external?.url : undefined;
      if (!src) continue;
      const caption = getOptionalCaption(image?.caption);
      const node: ImageNode = {
        type: "image",
        src,
        ...(caption ? { caption } : {})
      };
      body.push(node);
      continue;
    }

    if (b.type === "divider") {
      const node: DividerNode = { type: "divider" };
      body.push(node);
      continue;
    }

    if (b.type === "quote") {
      const text = notionRichTextToSpans(getRichText(b, "quote"));
      const plain = toPlainText(text).trim();
      const children: ArticleNode[] = [];
      if (plain.length > 0) {
        children.push({ type: "paragraph", text });
      }
      const nested = compileBlocks(getChildren(b), nextHeadingId);
      children.push(...nested);
      if (children.length === 0) continue;
      const node: QuoteNode = { type: "quote", children };
      body.push(node);
      continue;
    }

    // v0: ignore unknown blocks.
    void b;
  }

  return body;
}

function getRichText(block: NotionBlock, key: string): NotionRichText[] {
  const value = block?.[key];
  if (!value || !Array.isArray(value.rich_text)) return [];
  return value.rich_text as NotionRichText[];
}

function getOptionalCaption(caption: NotionRichText[] | undefined): RichTextSpan[] | undefined {
  if (!caption || caption.length === 0) return undefined;
  const spans = notionRichTextToSpans(caption);
  return toPlainText(spans).trim().length > 0 ? spans : undefined;
}

function getChildren(block: NotionBlock): NotionBlock[] {
  if (!Array.isArray(block.children)) return [];
  return block.children as NotionBlock[];
}

function isListItemType(type: string): type is "bulleted_list_item" | "numbered_list_item" {
  return type === "bulleted_list_item" || type === "numbered_list_item";
}
