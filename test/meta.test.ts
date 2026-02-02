import { describe, expect, it } from "vitest";
import { compilePageMeta } from "../src/notion/meta.js";
import { compileNotionPage } from "../src/notion/page.js";
import pageRichText from "./fixtures/meta-page-richtext.json";
import pageFormula from "./fixtures/meta-page-formula.json";
import pageInvalid from "./fixtures/meta-page-invalid.json";
import blocksFixture from "./fixtures/simple-page.json";

describe("compilePageMeta", () => {
  it("maps title, slug, date, tags, and canonicalUrl", () => {
    const warnings: string[] = [];
    const meta = compilePageMeta((pageRichText as any).properties, {
      onWarning: (warning) => warnings.push(warning.code)
    });

    expect(meta).toEqual({
      title: "Golden Page",
      slug: "my-slug",
      date: "2025-06-01",
      tags: ["alpha", "beta"],
      canonicalUrl: "https://example.com/post"
    });

    expect(warnings).toEqual(["UNSUPPORTED_PROPERTY"]);
  });

  it("supports formula slug", () => {
    const meta = compilePageMeta((pageFormula as any).properties);
    expect(meta.slug).toBe("formula-slug-value");
    expect(meta.title).toBe("Formula Slug");
  });

  it("emits warnings for missing title and malformed values", () => {
    const warnings: string[] = [];
    const meta = compilePageMeta((pageInvalid as any).properties, {
      onWarning: (warning) => warnings.push(warning.code)
    });

    expect(meta).toEqual({});
    expect(warnings).toEqual(["MISSING_TITLE", "MALFORMED_SLUG", "MALFORMED_DATE", "UNSUPPORTED_PROPERTY"]);
  });
});

describe("compileNotionPage", () => {
  it("orchestrates metadata and block compilation", () => {
    const article = compileNotionPage({
      page: pageRichText as any,
      blocks: blocksFixture as any
    });

    expect(article.type).toBe("article");
    expect(article.meta.title).toBe("Golden Page");
    expect(article.meta.slug).toBe("my-slug");
    expect(Array.isArray(article.body)).toBe(true);
  });
});
