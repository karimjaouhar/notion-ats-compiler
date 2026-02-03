import { describe, expect, it } from "vitest";
import { compileNotionDatabaseIndex } from "../src/notion/database.js";

describe("compileNotionDatabaseIndex", () => {
  it("maps database properties to post list items", () => {
    const pages = [
      {
        id: "page-1",
        cover: {
          type: "external",
          external: { url: "https://example.com/cover-from-page.png" }
        },
        properties: {
          Title: {
            title: [
              {
                plain_text: "Hello World",
                href: null,
                annotations: { bold: false, italic: false, code: false }
              }
            ]
          },
          Date: {
            date: { start: "2024-01-02" }
          },
          Summary: {
            rich_text: [
              {
                plain_text: "Short summary",
                href: null,
                annotations: { bold: false, italic: false, code: false }
              }
            ]
          },
          Author: {
            people: [{ name: "Ada Lovelace" }]
          },
          Slug: {
            rich_text: [
              {
                plain_text: "hello-world",
                href: null,
                annotations: { bold: false, italic: false, code: false }
              }
            ]
          },
          Cover: {
            files: [
              {
                type: "external",
                external: { url: "https://example.com/cover-from-property.png" }
              }
            ]
          }
        }
      }
    ];

    const [post] = compileNotionDatabaseIndex(pages as any);

    expect(post).toEqual({
      id: "page-1",
      title: "Hello World",
      date: "2024-01-02",
      summary: "Short summary",
      author: "Ada Lovelace",
      slug: "hello-world",
      coverUrl: "https://example.com/cover-from-property.png"
    });
  });

  it("falls back to page cover when Cover property is missing", () => {
    const pages = [
      {
        id: "page-2",
        cover: {
          type: "external",
          external: { url: "https://example.com/cover-from-page.png" }
        },
        properties: {
          Title: {
            title: [
              {
                plain_text: "Fallback Cover",
                href: null,
                annotations: { bold: false, italic: false, code: false }
              }
            ]
          }
        }
      }
    ];

    const [post] = compileNotionDatabaseIndex(pages as any);

    expect(post).toEqual({
      id: "page-2",
      title: "Fallback Cover",
      coverUrl: "https://example.com/cover-from-page.png"
    });
  });
});
