import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compileBlocksToArticle } from "../src/notion/compile.js";
import type { Article, ArticleNode, ListItem } from "../src/ast/types.js";
import type { RichTextSpan } from "../src/ast/text.js";

const fixturePath = join("test", "fixtures", "live", "compiler-golden-page.json");

describe("golden page fixture", () => {
  if (!existsSync(fixturePath)) {
    it.skip("skips when golden fixture is missing", () => {
      expect(true).toBe(true);
    });
    return;
  }

  it("compiles deterministically with valid structure", () => {
    const warnings: Array<{ code: string; message: string; blockId?: string; blockType?: string }> = [];
    const raw = readFileSync(fixturePath, "utf-8");
    const blocks = JSON.parse(raw);

    let articleA: Article | undefined;
    let articleB: Article | undefined;

    expect(() => {
      articleA = compileBlocksToArticle(blocks, {
        meta: { title: "Compiler Golden Page" },
        onWarning: (warning) => warnings.push(warning)
      });
    }).not.toThrow();

    expect(() => {
      articleB = compileBlocksToArticle(blocks, {
        meta: { title: "Compiler Golden Page" }
      });
    }).not.toThrow();

    expect(articleA?.type).toBe("article");
    expect(articleA?.meta.title).toBe("Compiler Golden Page");
    expect(Array.isArray(articleA?.body)).toBe(true);

    expect(articleA).toEqual(articleB);

    validateArticle(articleA as Article);

    for (const warning of warnings) {
      expect(typeof warning.code).toBe("string");
      expect(warning.code.length).toBeGreaterThan(0);
      expect(typeof warning.message).toBe("string");
      expect(warning.message.length).toBeGreaterThan(0);
      expect(() => JSON.stringify(warning)).not.toThrow();
    }
  });
});

function validateArticle(article: Article): void {
  for (const node of article.body) validateNode(node);
}

function validateNode(node: ArticleNode): void {
  switch (node.type) {
    case "heading":
      expect(node.level >= 1 && node.level <= 6).toBe(true);
      expect(typeof node.id).toBe("string");
      expect(node.id.length).toBeGreaterThan(0);
      expect(node.id.includes(" ")).toBe(false);
      validateRichText(node.text);
      break;
    case "paragraph":
      validateRichText(node.text);
      break;
    case "code":
      expect(typeof node.language).toBe("string");
      expect(typeof node.code).toBe("string");
      if (node.caption) validateRichText(node.caption);
      break;
    case "image":
      expect(typeof node.src).toBe("string");
      expect(node.src.length).toBeGreaterThan(0);
      if (node.caption) validateRichText(node.caption);
      break;
    case "list":
      expect(typeof node.ordered).toBe("boolean");
      expect(Array.isArray(node.items)).toBe(true);
      for (const item of node.items) validateListItem(item);
      break;
    case "admonition":
      expect(["note", "tip", "warning", "info"].includes(node.kind)).toBe(true);
      if (node.title) validateRichText(node.title);
      for (const child of node.children) validateNode(child);
      break;
    case "quote":
      for (const child of node.children) validateNode(child);
      break;
    case "divider":
      expect(node).toHaveProperty("type", "divider");
      break;
    case "toggle":
      validateRichText(node.summary);
      for (const child of node.children) validateNode(child);
      break;
    default:
      expect(`Unexpected node type: ${(node as ArticleNode).type}`).toBe("");
  }
}

function validateListItem(item: ListItem): void {
  expect(Array.isArray(item.children)).toBe(true);
  for (const child of item.children) validateNode(child);
}

function validateRichText(spans: RichTextSpan[]): void {
  expect(Array.isArray(spans)).toBe(true);
  for (const span of spans) {
    switch (span.type) {
      case "text":
        expect(typeof span.text).toBe("string");
        break;
      case "code":
        expect(typeof span.text).toBe("string");
        break;
      case "bold":
      case "italic":
        expect(Array.isArray(span.children)).toBe(true);
        validateRichText(span.children);
        break;
      case "link":
        expect(typeof span.href).toBe("string");
        validateRichText(span.children);
        break;
      default:
        expect(`Unexpected span type: ${(span as RichTextSpan).type}`).toBe("");
    }
  }
}
