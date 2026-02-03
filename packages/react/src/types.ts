import type { ReactElement, ReactNode } from "react";
import type { AdmonitionNode, Article, ArticleNode, RichTextSpan } from "@notion-ats/compiler";

export type RenderOptions = {
  components?: Partial<RendererComponents>;
};

export type HeadingComponentProps = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;
  children: ReactNode;
};

export type ParagraphComponentProps = {
  children: ReactNode;
};

export type CodeComponentProps = {
  language: string;
  code: string;
  caption?: ReactNode;
};

export type ImageComponentProps = {
  src: string;
  alt: string;
  caption?: ReactNode;
};

export type TableComponentProps = {
  hasHeader: boolean;
  rows: ReactNode[][];
};

export type EmbedComponentProps = {
  url: string;
  caption?: ReactNode;
};

export type BookmarkComponentProps = {
  url: string;
  title?: string;
  description?: string;
};

export type ListComponentProps = {
  ordered: boolean;
  items: ReactNode[];
};

export type AdmonitionComponentProps = {
  kind: AdmonitionNode["kind"];
  title?: ReactNode;
  children: ReactNode;
};

export type QuoteComponentProps = {
  children: ReactNode;
};

export type DividerComponentProps = Record<string, never>;

export type ToggleComponentProps = {
  summary: ReactNode;
  children: ReactNode;
};

export type LinkComponentProps = {
  href: string;
  rel?: string;
  target?: string;
  children: ReactNode;
};

export type RendererComponents = {
  heading: (props: HeadingComponentProps) => ReactElement;
  paragraph: (props: ParagraphComponentProps) => ReactElement;
  code: (props: CodeComponentProps) => ReactElement;
  image: (props: ImageComponentProps) => ReactElement;
  table: (props: TableComponentProps) => ReactElement;
  embed: (props: EmbedComponentProps) => ReactElement;
  bookmark: (props: BookmarkComponentProps) => ReactElement;
  list: (props: ListComponentProps) => ReactElement;
  admonition: (props: AdmonitionComponentProps) => ReactElement;
  quote: (props: QuoteComponentProps) => ReactElement;
  divider: (props: DividerComponentProps) => ReactElement;
  toggle: (props: ToggleComponentProps) => ReactElement;
  link: (props: LinkComponentProps) => ReactElement;
};

export type RenderRichText = (spans: RichTextSpan[], options?: RenderOptions) => ReactNode[];
export type RenderNode = (node: ArticleNode, options?: RenderOptions) => ReactElement;
export type RenderArticle = (article: Article, options?: RenderOptions) => ReactElement;
