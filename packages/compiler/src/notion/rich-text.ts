import type { RichTextSpan } from "../ast/text.js";
import type { NotionRichText } from "./types.js";

export function notionRichTextToSpans(richText: NotionRichText[]): RichTextSpan[] {
  return richText.map((rt) => {
    const text = rt.plain_text ?? "";
    let span: RichTextSpan = rt.annotations.code ? { type: "code", text } : { type: "text", text };

    // Apply wrappers in a fixed order for deterministic output.
    if (rt.annotations.bold) {
      span = { type: "bold", children: [span] };
    }
    if (rt.annotations.italic) {
      span = { type: "italic", children: [span] };
    }
    if (rt.href) {
      span = { type: "link", href: rt.href, children: [span] };
    }

    return span;
  });
}
