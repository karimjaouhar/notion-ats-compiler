import type {
  Article,
  ArticleNode,
  CodeNode,
  DividerNode,
  HeadingNode,
  ImageNode,
  TableNode,
  TableRow,
  EmbedNode,
  BookmarkNode,
  ListItem,
  ListNode,
  ParagraphNode,
  QuoteNode,
  AdmonitionNode,
  ToggleNode
} from "../ast/types.js";
import { toPlainText, type RichTextSpan } from "../ast/text.js";
import { slugify } from "../utils/ids.js";
import { createUniqueIdFn } from "../utils/unique-ids.js";
import type { NotionBlock, NotionRichText } from "./types.js";
import { notionRichTextToSpans } from "./rich-text.js";
import type { CompileWarning } from "./warnings.js";

export type CompileOptions = {
  meta?: Article["meta"];
  onWarning?: (warning: CompileWarning) => void;
};

export function compileBlocksToArticle(blocks: NotionBlock[], opts: CompileOptions = {}): Article {
  const nextHeadingId = createUniqueIdFn();

  return {
    type: "article",
    meta: opts.meta ?? {},
    body: compileBlocks(blocks, nextHeadingId, opts.onWarning)
  };
}

function compileBlocks(
  blocks: NotionBlock[],
  nextHeadingId: (base: string) => string,
  onWarning?: (warning: CompileWarning) => void
): ArticleNode[] {
  const body: ArticleNode[] = [];

  for (let i = 0; i < blocks.length; i += 1) {
    const b = getBlockAt(blocks, i);
    if (!b) break;

    if (isListItemType(b.type)) {
      const ordered = b.type === "numbered_list_item";
      const items: ListItem[] = [];

      while (true) {
        const itemBlock = getBlockAt(blocks, i);
        if (!itemBlock || itemBlock.type !== b.type) break;
        const itemChildren: ArticleNode[] = [];
        const text = notionRichTextToSpans(getRichText(itemBlock, itemBlock.type));
        const plain = toPlainText(text).trim();
        if (plain.length > 0) {
          itemChildren.push({ type: "paragraph", text });
        }
        const nested = compileBlocks(getChildren(itemBlock), nextHeadingId, onWarning);
        itemChildren.push(...nested);
        items.push({ children: itemChildren });
        i += 1;
      }

      const node: ListNode = { type: "list", ordered, items };
      body.push(node);
      i -= 1;
      continue;
    }

    if (
      b.type === "heading_1" ||
      b.type === "heading_2" ||
      b.type === "heading_3" ||
      b.type === "heading_4" ||
      b.type === "heading_5" ||
      b.type === "heading_6"
    ) {
      const level =
        b.type === "heading_1"
          ? 1
          : b.type === "heading_2"
            ? 2
            : b.type === "heading_3"
              ? 3
              : b.type === "heading_4"
                ? 4
                : b.type === "heading_5"
                  ? 5
                  : 6;
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
      if (!src) {
        onWarning?.({
          code: "MISSING_IMAGE_URL",
          message: "Image block is missing a file or external URL.",
          blockId: b.id,
          blockType: b.type
        });
        continue;
      }
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

    if (b.type === "table") {
      const rows: TableRow[] = [];
      const children = getChildren(b);
      for (const child of children) {
        if (child.type !== "table_row") {
          onWarning?.({
            code: "UNSUPPORTED_TABLE_STRUCTURE",
            message: "Table child is not a table_row and was ignored.",
            blockId: child.id,
            blockType: child.type
          });
          continue;
        }
        const rowCells = getTableRowCells(child);
        if (!rowCells) {
          onWarning?.({
            code: "UNSUPPORTED_TABLE_STRUCTURE",
            message: "Table row is missing cells and was ignored.",
            blockId: child.id,
            blockType: child.type
          });
          continue;
        }
        const cells = rowCells.map((cell) => notionRichTextToSpans(cell));
        const isEmpty = cells.every((cell) => toPlainText(cell).trim().length === 0);
        if (isEmpty) continue;
        rows.push({ cells });
      }
      const node: TableNode = {
        type: "table",
        hasHeader: Boolean(b.table?.has_column_header),
        rows
      };
      body.push(node);
      continue;
    }

    if (b.type === "embed") {
      const url = b.embed?.url;
      if (!url) {
        onWarning?.({
          code: "MISSING_EMBED_URL",
          message: "Embed block is missing a URL and was dropped.",
          blockId: b.id,
          blockType: b.type
        });
        continue;
      }
      const caption = getOptionalCaption(b.embed?.caption);
      const node: EmbedNode = {
        type: "embed",
        url,
        ...(caption ? { caption } : {})
      };
      body.push(node);
      continue;
    }

    if (b.type === "bookmark") {
      const url = b.bookmark?.url;
      if (!url) {
        onWarning?.({
          code: "MISSING_BOOKMARK_URL",
          message: "Bookmark block is missing a URL and was dropped.",
          blockId: b.id,
          blockType: b.type
        });
        continue;
      }
      const title = typeof b.bookmark?.title === "string" ? b.bookmark.title : undefined;
      const description = typeof b.bookmark?.description === "string" ? b.bookmark.description : undefined;
      const node: BookmarkNode = {
        type: "bookmark",
        url,
        ...(title ? { title } : {}),
        ...(description ? { description } : {})
      };
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
      const nested = compileBlocks(getChildren(b), nextHeadingId, onWarning);
      children.push(...nested);
      if (children.length === 0) continue;
      const node: QuoteNode = { type: "quote", children };
      body.push(node);
      continue;
    }

    if (b.type === "toggle") {
      const summary = notionRichTextToSpans(getRichText(b, "toggle"));
      const summaryPlain = toPlainText(summary).trim();
      if (summaryPlain.length === 0) {
        onWarning?.({
          code: "EMPTY_TOGGLE",
          message: "Toggle summary is empty; block was dropped.",
          blockId: b.id,
          blockType: b.type
        });
        continue;
      }
      const children = compileBlocks(getChildren(b), nextHeadingId, onWarning);
      const node: ToggleNode = { type: "toggle", summary, children };
      body.push(node);
      continue;
    }

    if (b.type === "callout") {
      const title = notionRichTextToSpans(getRichText(b, "callout"));
      const titlePlain = toPlainText(title).trim();
      const children = compileBlocks(getChildren(b), nextHeadingId, onWarning);
      const kind = mapCalloutKind(b.callout?.color);
      const node: AdmonitionNode = {
        type: "admonition",
        kind,
        ...(titlePlain.length > 0 ? { title } : {}),
        children
      };
      body.push(node);
      continue;
    }

    // v0: ignore unknown blocks.
    onWarning?.({
      code: "UNSUPPORTED_BLOCK",
      message: "Block type is not supported and was ignored.",
      blockId: b.id,
      blockType: b.type
    });
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

function getBlockAt(blocks: NotionBlock[], index: number): NotionBlock | undefined {
  if (index < 0 || index >= blocks.length) return undefined;
  return blocks[index];
}

function isListItemType(type: string): type is "bulleted_list_item" | "numbered_list_item" {
  return type === "bulleted_list_item" || type === "numbered_list_item";
}

function getTableRowCells(block: NotionBlock): NotionRichText[][] | undefined {
  const value = block?.[block.type];
  const cells = value?.cells;
  if (!Array.isArray(cells)) return undefined;
  if (!cells.every((cell: unknown) => Array.isArray(cell))) return undefined;
  return cells as NotionRichText[][];
}

function mapCalloutKind(color: string | undefined): AdmonitionNode["kind"] {
  switch (color) {
    case "yellow":
    case "orange":
    case "red":
      return "warning";
    case "blue":
    case "purple":
      return "info";
    case "green":
      return "tip";
    case "gray":
    case "default":
    default:
      return "note";
  }
}
