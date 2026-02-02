export type RichTextSpan =
  | { type: "text"; text: string }
  | { type: "bold"; children: RichTextSpan[] }
  | { type: "italic"; children: RichTextSpan[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: RichTextSpan[] };

export function toPlainText(spans: RichTextSpan[]): string {
  return spans
    .map((s) => {
      if (s.type === "text") return s.text;
      if (s.type === "code") return s.text;
      if (s.type === "bold" || s.type === "italic" || s.type === "link") return toPlainText(s.children);
      return "";
    })
    .join("");
}
