import React from "react";
import type { RichTextSpan } from "@notion-ats/compiler";
import type { RenderOptions } from "../types.js";
import { resolveComponents } from "./components.js";

const defaultLinkProps = {
  rel: "noreferrer noopener",
  target: "_blank"
};

export function renderRichText(spans: RichTextSpan[], options?: RenderOptions): React.ReactNode[] {
  const components = resolveComponents(options?.components);

  return spans.map((span, index) => {
    const key = `${index}`;

    switch (span.type) {
      case "text":
        return <React.Fragment key={key}>{span.text}</React.Fragment>;
      case "code":
        return <code key={key}>{span.text}</code>;
      case "bold":
        return <strong key={key}>{renderRichText(span.children, options)}</strong>;
      case "italic":
        return <em key={key}>{renderRichText(span.children, options)}</em>;
      case "link":
        return (
          <React.Fragment key={key}>
            {components.link({
              href: span.href,
              rel: defaultLinkProps.rel,
              target: defaultLinkProps.target,
              children: renderRichText(span.children, options)
            })}
          </React.Fragment>
        );
      default:
        return <React.Fragment key={key} />;
    }
  });
}
