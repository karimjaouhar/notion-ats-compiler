import { describe, expect, it } from "vitest";
import { compileBlocksToArticle } from "../src/notion/compile.js";
import simpleFixture from "./fixtures/simple-page.json";
import leafFixture from "./fixtures/leaf-blocks.json";
import listFixture from "./fixtures/list-blocks.json";

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
});
