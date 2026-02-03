import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Article } from "@notion-ats/compiler";
import { ArticleRenderer, renderArticle, renderNodes } from "../src/index.js";

const baseArticle = (body: Article["body"]): Article => ({
  type: "article",
  meta: {},
  body
});

describe("renderArticle", () => {
  it("renders core nodes with semantic output", () => {
    const article = baseArticle([
      {
        type: "heading",
        level: 2,
        id: "intro",
        text: [{ type: "text", text: "Hello" }]
      },
      {
        type: "paragraph",
        text: [
          { type: "text", text: "A " },
          { type: "bold", children: [{ type: "text", text: "bold" }] },
          { type: "text", text: " move." }
        ]
      },
      {
        type: "list",
        ordered: false,
        items: [
          {
            children: [
              {
                type: "paragraph",
                text: [{ type: "text", text: "First" }]
              }
            ]
          }
        ]
      },
      {
        type: "code",
        language: "ts",
        code: "const x = 1;",
        caption: [{ type: "text", text: "Example" }]
      },
      {
        type: "image",
        src: "https://example.com/image.png",
        caption: [{ type: "text", text: "An image" }]
      },
      {
        type: "toggle",
        summary: [{ type: "text", text: "Details" }],
        children: [
          {
            type: "paragraph",
            text: [{ type: "text", text: "Inside" }]
          }
        ]
      },
      {
        type: "admonition",
        kind: "note",
        title: [{ type: "text", text: "Remember" }],
        children: [
          {
            type: "paragraph",
            text: [{ type: "text", text: "Take notes." }]
          }
        ]
      },
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
              [{ type: "text", text: "A1" }],
              [{ type: "text", text: "A2" }]
            ]
          }
        ]
      },
      {
        type: "embed",
        url: "https://example.com",
        caption: [{ type: "text", text: "Example site" }]
      },
      {
        type: "bookmark",
        url: "https://example.com/blog",
        title: "Example Blog",
        description: "A blog."
      }
    ]);

    const html = renderToStaticMarkup(renderArticle(article));

    expect(html).toContain('<h2 id="intro">Hello</h2>');
    expect(html).toContain("<p>A <strong>bold</strong> move.</p>");
    expect(html).toContain("<ul><li><p>First</p></li></ul>");
    expect(html).toContain(
      '<figure><pre><code class="language-ts">const x = 1;</code></pre><figcaption>Example</figcaption></figure>'
    );
    expect(html).toContain(
      '<figure><img src="https://example.com/image.png" alt="An image"/><figcaption>An image</figcaption></figure>'
    );
    expect(html).toContain("<details><summary>Details</summary><p>Inside</p></details>");
    expect(html).toContain('<aside data-kind="note"><strong>Remember</strong><p>Take notes.</p></aside>');
    expect(html).toContain(
      "<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>A1</td><td>A2</td></tr></tbody></table>"
    );
    expect(html).toContain(
      '<figure><a href="https://example.com" rel="noreferrer noopener" target="_blank">https://example.com</a><figcaption>Example site</figcaption></figure>'
    );
    expect(html).toContain(
      '<div><a href="https://example.com/blog" rel="noreferrer noopener" target="_blank">Example Blog</a><p>A blog.</p></div>'
    );
  });

  it("supports component overrides", () => {
    const article = baseArticle([
      {
        type: "heading",
        level: 1,
        id: "custom",
        text: [{ type: "text", text: "Custom" }]
      }
    ]);

    const html = renderToStaticMarkup(
      <ArticleRenderer
        article={article}
        components={{
          heading: ({ level, id, children }) => (
            <h1 data-level={level} id={id}>
              {children}
            </h1>
          )
        }}
      />
    );

    expect(html).toContain('<h1 data-level="1" id="custom">Custom</h1>');
  });

  it("defaults image alt to caption text or empty string", () => {
    const withCaption = baseArticle([
      {
        type: "image",
        src: "https://example.com/with-caption.png",
        caption: [{ type: "text", text: "Caption alt" }]
      }
    ]);
    const withoutCaption = baseArticle([
      {
        type: "image",
        src: "https://example.com/without-caption.png"
      }
    ]);

    const withCaptionHtml = renderToStaticMarkup(renderArticle(withCaption));
    const withoutCaptionHtml = renderToStaticMarkup(renderArticle(withoutCaption));

    expect(withCaptionHtml).toContain(
      '<img src="https://example.com/with-caption.png" alt="Caption alt"/>'
    );
    expect(withoutCaptionHtml).toContain(
      '<img src="https://example.com/without-caption.png" alt=""/>'
    );
  });

  it("adds safe defaults for link rel/target", () => {
    const article = baseArticle([
      {
        type: "paragraph",
        text: [
          { type: "text", text: "Read " },
          {
            type: "link",
            href: "https://example.com",
            children: [{ type: "text", text: "Docs" }]
          }
        ]
      },
      {
        type: "embed",
        url: "https://example.com/embed"
      },
      {
        type: "bookmark",
        url: "https://example.com/bookmark",
        title: "Bookmark"
      }
    ]);

    const html = renderToStaticMarkup(renderArticle(article));

    expect(html).toContain(
      '<a href="https://example.com" rel="noreferrer noopener" target="_blank">Docs</a>'
    );
    expect(html).toContain(
      '<a href="https://example.com/embed" rel="noreferrer noopener" target="_blank">https://example.com/embed</a>'
    );
    expect(html).toContain(
      '<a href="https://example.com/bookmark" rel="noreferrer noopener" target="_blank">Bookmark</a>'
    );
  });

  it("supports link and image overrides", () => {
    const article = baseArticle([
      {
        type: "paragraph",
        text: [
          {
            type: "link",
            href: "https://example.com",
            children: [{ type: "text", text: "Link" }]
          }
        ]
      },
      {
        type: "image",
        src: "https://example.com/override.png",
        caption: [{ type: "text", text: "Override" }]
      }
    ]);

    const html = renderToStaticMarkup(
      <ArticleRenderer
        article={article}
        components={{
          link: ({ href, rel, target, children }) => (
            <a data-custom="link" href={href} rel={rel} target={target}>
              {children}
            </a>
          ),
          image: ({ src, alt }) => <img data-custom="image" src={src} alt={alt} />
        }}
      />
    );

    expect(html).toContain(
      '<a data-custom="link" href="https://example.com" rel="noreferrer noopener" target="_blank">Link</a>'
    );
    expect(html).toContain(
      '<img data-custom="image" src="https://example.com/override.png" alt="Override"/>'
    );
  });

  it("renders nodes consistently with renderNodes", () => {
    const nodes = [
      {
        type: "heading",
        level: 3,
        id: "nodes",
        text: [{ type: "text", text: "Nodes" }]
      },
      {
        type: "paragraph",
        text: [{ type: "text", text: "Rendered" }]
      }
    ] satisfies Article["body"];

    const html = renderToStaticMarkup(<article>{renderNodes(nodes)}</article>);
    expect(html).toBe('<article><h3 id="nodes">Nodes</h3><p>Rendered</p></article>');
  });

  it("matches golden HTML output", () => {
    const article = baseArticle([
      {
        type: "heading",
        level: 1,
        id: "title",
        text: [{ type: "text", text: "Title" }]
      },
      {
        type: "paragraph",
        text: [
          { type: "text", text: "Hello " },
          { type: "italic", children: [{ type: "text", text: "world" }] }
        ]
      },
      {
        type: "list",
        ordered: true,
        items: [
          {
            children: [
              {
                type: "paragraph",
                text: [{ type: "text", text: "One" }]
              }
            ]
          },
          {
            children: [
              {
                type: "paragraph",
                text: [{ type: "text", text: "Two" }]
              }
            ]
          }
        ]
      }
    ]);

    const html = renderToStaticMarkup(renderArticle(article));
    expect(html).toBe(
      "<article><h1 id=\"title\">Title</h1><p>Hello <em>world</em></p><ol><li><p>One</p></li><li><p>Two</p></li></ol></article>"
    );
  });
});
