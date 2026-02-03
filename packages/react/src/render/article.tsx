import React from "react";
import type { Article } from "@notion-ats/compiler";
import { renderNodes } from "./node.js";
import type { RenderOptions } from "../types.js";

export function renderArticle(article: Article, options?: RenderOptions): React.ReactElement {
  return <article>{renderNodes(article.body, options)}</article>;
}

export type ArticleRendererProps = {
  article: Article;
} & RenderOptions;

export function ArticleRenderer({ article, components }: ArticleRendererProps): React.ReactElement {
  return renderArticle(article, { components });
}
