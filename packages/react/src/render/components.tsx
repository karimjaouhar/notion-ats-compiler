import React from "react";
import type {
  AdmonitionComponentProps,
  BookmarkComponentProps,
  CodeComponentProps,
  DividerComponentProps,
  EmbedComponentProps,
  HeadingComponentProps,
  ImageComponentProps,
  LinkComponentProps,
  ListComponentProps,
  ParagraphComponentProps,
  QuoteComponentProps,
  RendererComponents,
  TableComponentProps,
  ToggleComponentProps
} from "../types.js";

export const defaultComponents: RendererComponents = {
  heading: ({ level, id, children }: HeadingComponentProps) => {
    const Tag = `h${level}` as const;
    return <Tag id={id}>{children}</Tag>;
  },
  paragraph: ({ children }: ParagraphComponentProps) => <p>{children}</p>,
  code: ({ language, code, caption }: CodeComponentProps) => (
    <figure>
      <pre>
        <code className={language ? `language-${language}` : undefined}>{code}</code>
      </pre>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  ),
  image: ({ src, alt, caption }: ImageComponentProps) => (
    <figure>
      <img src={src} alt={alt} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  ),
  table: ({ hasHeader, rows }: TableComponentProps) => {
    const [headerRow, ...bodyRows] = rows;
    const hasHeaderRow = hasHeader && headerRow !== undefined;

    return (
      <table>
        {hasHeaderRow ? (
          <thead>
            <tr>
              {headerRow.map((cell, cellIndex) => (
                <th key={cellIndex}>{cell}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {(hasHeaderRow ? bodyRows : rows).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  embed: ({ url, caption }: EmbedComponentProps) => (
    <figure>
      <a href={url} rel="noreferrer noopener" target="_blank">
        {url}
      </a>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  ),
  bookmark: ({ url, title, description }: BookmarkComponentProps) => (
    <div>
      <a href={url} rel="noreferrer noopener" target="_blank">
        {title ?? url}
      </a>
      {description ? <p>{description}</p> : null}
    </div>
  ),
  list: ({ ordered, items }: ListComponentProps) => {
    const ListTag = ordered ? "ol" : "ul";
    return (
      <ListTag>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ListTag>
    );
  },
  admonition: ({ kind, title, tone, icon, children }: AdmonitionComponentProps) => (
    <aside data-kind={kind} data-tone={tone}>
      {title || icon ? (
        <div>
          {icon ? <span>{icon}</span> : null}
          {title ? <span>{title}</span> : null}
        </div>
      ) : null}
      {children}
    </aside>
  ),
  quote: ({ children }: QuoteComponentProps) => <blockquote>{children}</blockquote>,
  divider: (_props: DividerComponentProps) => <hr />,
  toggle: ({ summary, children }: ToggleComponentProps) => (
    <details>
      <summary>{summary}</summary>
      {children}
    </details>
  ),
  link: ({ href, rel, target, children }: LinkComponentProps) => (
    <a href={href} rel={rel} target={target}>
      {children}
    </a>
  )
};

export const resolveComponents = (overrides?: Partial<RendererComponents>): RendererComponents => ({
  ...defaultComponents,
  ...overrides
});
