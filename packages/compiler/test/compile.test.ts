import { describe, expect, it } from "vitest";
import { compileBlocksToArticle } from "../src/notion/compile.js";
import simpleFixture from "./fixtures/simple-page.json";
import leafFixture from "./fixtures/leaf-blocks.json";
import listFixture from "./fixtures/list-blocks.json";
import toggleFixture from "./fixtures/toggle-callout.json";
import tebFixture from "./fixtures/table-embed-bookmark.json";

describe("compileBlocksToArticle", () => {
  it("compiles headings, paragraphs, and rich text spans", () => {
    const article = compileBlocksToArticle(simpleFixture as any, { meta: { title: "Test" } });

    expect(article).toEqual({
      type: "article",
      meta: { title: "Test" },
      body: [
        {
          type: "heading",
          level: 1,
          id: "hello-world",
          text: [
            { type: "text", text: "Hello " },
            { type: "bold", children: [{ type: "text", text: "World" }] }
          ]
        },
        {
          type: "heading",
          level: 2,
          id: "hello-world-2",
          text: [{ type: "text", text: "Hello World" }]
        },
        {
          type: "paragraph",
          text: [
            { type: "text", text: "Visit " },
            { type: "link", href: "https://openai.com", children: [{ type: "text", text: "OpenAI" }] },
            { type: "text", text: " and use " },
            { type: "code", text: "pnpm test" },
            { type: "text", text: "." }
          ]
        }
      ]
    });
  });

  it("compiles leaf blocks and nested children", () => {
    const article = compileBlocksToArticle(leafFixture as any);

    expect(article.body).toEqual([
      {
        type: "code",
        language: "typescript",
        code: "const x = 1;",
        caption: [{ type: "text", text: "Example" }]
      },
      {
        type: "image",
        src: "https://example.com/img.png"
      },
      {
        type: "image",
        src: "https://files.notion.so/abc.png",
        caption: [{ type: "text", text: "A caption" }]
      },
      { type: "divider" },
      {
        type: "quote",
        children: [
          {
            type: "paragraph",
            text: [{ type: "text", text: "Quoted text" }]
          },
          {
            type: "paragraph",
            text: [{ type: "text", text: "Nested paragraph" }]
          }
        ]
      }
    ]);
  });

  it("groups list items and supports nesting", () => {
    const article = compileBlocksToArticle(listFixture as any);

    expect(article.body).toEqual([
      {
        type: "list",
        ordered: false,
        items: [
          { children: [{ type: "paragraph", text: [{ type: "text", text: "Bullet 1" }] }] },
          { children: [{ type: "paragraph", text: [{ type: "text", text: "Bullet 2" }] }] },
          { children: [{ type: "paragraph", text: [{ type: "text", text: "Bullet 3" }] }] }
        ]
      },
      {
        type: "paragraph",
        text: [{ type: "text", text: "Break" }]
      },
      {
        type: "list",
        ordered: true,
        items: [
          { children: [{ type: "paragraph", text: [{ type: "text", text: "One" }] }] },
          { children: [{ type: "paragraph", text: [{ type: "text", text: "Two" }] }] },
          { children: [{ type: "paragraph", text: [{ type: "text", text: "Three" }] }] }
        ]
      },
      {
        type: "paragraph",
        text: [{ type: "text", text: "Mix" }]
      },
      {
        type: "list",
        ordered: false,
        items: [
          {
            children: [
              { type: "paragraph", text: [{ type: "text", text: "Parent bullet" }] },
              {
                type: "list",
                ordered: false,
                items: [
                  { children: [{ type: "paragraph", text: [{ type: "text", text: "Nested A" }] }] },
                  { children: [{ type: "paragraph", text: [{ type: "text", text: "Nested B" }] }] }
                ]
              }
            ]
          },
          {
            children: [
              { type: "paragraph", text: [{ type: "text", text: "Parent bullet 2" }] },
              {
                type: "list",
                ordered: true,
                items: [
                  { children: [{ type: "paragraph", text: [{ type: "text", text: "Nested 1" }] }] },
                  { children: [{ type: "paragraph", text: [{ type: "text", text: "Nested 2" }] }] }
                ]
              }
            ]
          }
        ]
      }
    ]);
  });

  it("compiles toggles and callouts with warnings", () => {
    const warnings: string[] = [];
    const article = compileBlocksToArticle(toggleFixture as any, {
      onWarning: (warning) => warnings.push(warning.code)
    });

    expect(article.body).toEqual([
      {
        type: "toggle",
        summary: [{ type: "text", text: "Toggle summary" }],
        children: [
          { type: "paragraph", text: [{ type: "text", text: "Inside toggle" }] },
          {
            type: "toggle",
            summary: [{ type: "text", text: "Nested toggle" }],
            children: [{ type: "paragraph", text: [{ type: "text", text: "Nested content" }] }]
          }
        ]
      },
      {
        type: "admonition",
        kind: "warning",
        tone: "yellow",
        icon: "⚠️",
        title: [{ type: "text", text: "Warning callout" }],
        children: [
          { type: "paragraph", text: [{ type: "text", text: "Pay attention" }] },
          {
            type: "list",
            ordered: false,
            items: [{ children: [{ type: "paragraph", text: [{ type: "text", text: "Item" }] }] }]
          }
        ]
      },
      {
        type: "admonition",
        kind: "info",
        tone: "blue",
        icon: "ℹ️",
        title: [{ type: "text", text: "Info callout" }],
        children: []
      },
      {
        type: "admonition",
        kind: "tip",
        tone: "green",
        icon: "✅",
        title: [{ type: "text", text: "Tip callout" }],
        children: []
      }
    ]);

    expect(warnings).toEqual(["EMPTY_TOGGLE", "UNSUPPORTED_BLOCK"]);
  });

  it("compiles tables, embeds, and bookmarks", () => {
    const warnings: string[] = [];
    const article = compileBlocksToArticle(tebFixture as any, {
      onWarning: (warning) => warnings.push(warning.code)
    });

    expect(article.body).toEqual([
      {
        type: "table",
        hasHeader: true,
        rows: [
          {
            cells: [
              [{ type: "text", text: "H1" }],
              [{ type: "text", text: "H2" }]
            ]
          },
          {
            cells: [
              [{ type: "text", text: "R1C1" }],
              [{ type: "text", text: "R1C2" }]
            ]
          }
        ]
      },
      {
        type: "table",
        hasHeader: false,
        rows: [
          {
            cells: [[{ type: "text", text: "Only" }]]
          }
        ]
      },
      {
        type: "embed",
        url: "https://example.com/embed",
        caption: [{ type: "text", text: "Embed caption" }]
      },
      {
        type: "bookmark",
        url: "https://example.com",
        title: "Example Title",
        description: "Example Description"
      }
    ]);

    expect(warnings).toEqual(["MISSING_EMBED_URL", "MISSING_BOOKMARK_URL"]);
  });
});
