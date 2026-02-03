import React from "react";
import type { ArticleNode } from "@notion-ats/compiler";
import { toPlainText } from "@notion-ats/compiler";
import { renderRichText } from "./richText.js";
import { resolveComponents } from "./components.js";
import type { RenderOptions } from "../types.js";

export function renderNode(node: ArticleNode, options?: RenderOptions): React.ReactElement {
  const components = resolveComponents(options?.components);

  switch (node.type) {
    case "heading":
      return components.heading({
        level: node.level,
        id: node.id,
        children: renderRichText(node.text, options)
      });
    case "paragraph":
      return components.paragraph({
        children: renderRichText(node.text, options)
      });
    case "code":
      return components.code({
        language: node.language,
        code: node.code,
        caption: node.caption ? renderRichText(node.caption, options) : undefined
      });
    case "image":
      return components.image({
        src: node.src,
        alt: node.alt ?? (node.caption ? toPlainText(node.caption) : ""),
        caption: node.caption ? renderRichText(node.caption, options) : undefined
      });
    case "table":
      return components.table({
        hasHeader: node.hasHeader,
        rows: node.rows.map((row) => row.cells.map((cell) => renderRichText(cell, options)))
      });
    case "embed":
      return components.embed({
        url: node.url,
        caption: node.caption ? renderRichText(node.caption, options) : undefined
      });
    case "bookmark":
      return components.bookmark({
        url: node.url,
        title: node.title,
        description: node.description
      });
    case "list":
      return components.list({
        ordered: node.ordered,
        items: node.items.map((item, itemIndex) => (
          <React.Fragment key={itemIndex}>{renderNodes(item.children, options)}</React.Fragment>
        ))
      });
    case "admonition":
      return components.admonition({
        kind: node.kind,
        title: node.title ? renderRichText(node.title, options) : undefined,
        children: renderNodes(node.children, options)
      });
    case "quote":
      return components.quote({
        children: renderNodes(node.children, options)
      });
    case "divider":
      return components.divider({});
    case "toggle":
      return components.toggle({
        summary: renderRichText(node.summary, options),
        children: renderNodes(node.children, options)
      });
    default:
      return components.paragraph({ children: null });
  }
}

export function renderNodes(nodes: ArticleNode[], options?: RenderOptions): React.ReactNode[] {
  return nodes.map((child, index) => <React.Fragment key={index}>{renderNode(child, options)}</React.Fragment>);
}
