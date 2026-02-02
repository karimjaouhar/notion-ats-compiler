import type { ArticleMeta } from "../ast/types.js";
import { toPlainText } from "../ast/text.js";
import { slugify } from "../utils/ids.js";
import type { NotionRichText } from "./types.js";
import { notionRichTextToSpans } from "./rich-text.js";
import type { CompileWarning } from "./warnings.js";

type MetaWarningHook = (warning: CompileWarning) => void;

type MetaCompileOptions = {
  onWarning?: MetaWarningHook;
};

type KnownPropertyKey = "title" | "slug" | "date" | "tags" | "canonicalUrl";

export function compilePageMeta(
  properties: Record<string, any>,
  opts: MetaCompileOptions = {}
): ArticleMeta {
  const meta: ArticleMeta = {};
  const onWarning = opts.onWarning;

  const titleProp = properties?.title;
  const titleText = getTitleText(titleProp);
  if (titleText) {
    meta.title = titleText;
  } else {
    onWarning?.({
      code: "MISSING_TITLE",
      message: "Page title is missing or empty.",
      blockType: "page"
    });
  }

  if (Object.prototype.hasOwnProperty.call(properties, "slug")) {
    const slugValue = compileSlug(properties.slug, onWarning);
    if (slugValue) meta.slug = slugValue;
  }

  if (Object.prototype.hasOwnProperty.call(properties, "date")) {
    const dateValue = compileDate(properties.date, onWarning);
    if (dateValue) meta.date = dateValue;
  }

  if (Object.prototype.hasOwnProperty.call(properties, "tags")) {
    const tagsValue = compileTags(properties.tags, onWarning);
    if (tagsValue) meta.tags = tagsValue;
  }

  if (Object.prototype.hasOwnProperty.call(properties, "canonicalUrl")) {
    const canonicalValue = compileCanonicalUrl(properties.canonicalUrl, onWarning);
    if (canonicalValue) meta.canonicalUrl = canonicalValue;
  }

  warnUnsupportedProperties(properties, onWarning);

  return meta;
}

function warnUnsupportedProperties(properties: Record<string, any>, onWarning?: MetaWarningHook): void {
  const known = new Set<KnownPropertyKey>(["title", "slug", "date", "tags", "canonicalUrl"]);
  for (const key of Object.keys(properties ?? {})) {
    if (known.has(key as KnownPropertyKey)) continue;
    onWarning?.({
      code: "UNSUPPORTED_PROPERTY",
      message: `Property "${key}" is not mapped and was ignored.`,
      blockType: "page"
    });
  }
}

function getTitleText(property: any): string | undefined {
  if (!property || property.type !== "title" || !Array.isArray(property.title)) return undefined;
  const spans = notionRichTextToSpans(property.title as NotionRichText[]);
  const text = toPlainText(spans).trim();
  return text.length > 0 ? text : undefined;
}

function compileSlug(property: any, onWarning?: MetaWarningHook): string | undefined {
  if (!property) {
    onWarning?.({
      code: "UNSUPPORTED_PROPERTY",
      message: "Slug property is missing or unsupported.",
      blockType: "page"
    });
    return undefined;
  }

  if (property.type === "rich_text" && Array.isArray(property.rich_text)) {
    const spans = notionRichTextToSpans(property.rich_text as NotionRichText[]);
    const text = toPlainText(spans).trim();
    return text.length > 0 ? slugify(text) : undefined;
  }

  if (property.type === "formula") {
    const formula = property.formula;
    if (formula?.type === "string" && typeof formula.string === "string") {
      const text = formula.string.trim();
      return text.length > 0 ? slugify(text) : undefined;
    }
    onWarning?.({
      code: "MALFORMED_SLUG",
      message: "Slug formula is missing a string value.",
      blockType: "page"
    });
    return undefined;
  }

  onWarning?.({
    code: "UNSUPPORTED_PROPERTY",
    message: `Slug property type "${property.type}" is not supported.`,
    blockType: "page"
  });
  return undefined;
}

function compileDate(property: any, onWarning?: MetaWarningHook): string | undefined {
  if (!property || property.type !== "date") {
    onWarning?.({
      code: "UNSUPPORTED_PROPERTY",
      message: "Date property is missing or unsupported.",
      blockType: "page"
    });
    return undefined;
  }

  const start = property.date?.start;
  if (typeof start !== "string" || start.trim().length === 0) {
    onWarning?.({
      code: "MALFORMED_DATE",
      message: "Date property is missing a start value.",
      blockType: "page"
    });
    return undefined;
  }

  return start;
}

function compileTags(property: any, onWarning?: MetaWarningHook): string[] | undefined {
  if (!property || property.type !== "multi_select" || !Array.isArray(property.multi_select)) {
    onWarning?.({
      code: "UNSUPPORTED_PROPERTY",
      message: "Tags property is missing or unsupported.",
      blockType: "page"
    });
    return undefined;
  }

  const tags = property.multi_select
    .map((item: any) => (typeof item?.name === "string" ? item.name : ""))
    .filter((name: string) => name.length > 0);

  return tags.length > 0 ? tags : undefined;
}

function compileCanonicalUrl(property: any, onWarning?: MetaWarningHook): string | undefined {
  if (!property || property.type !== "url") {
    onWarning?.({
      code: "UNSUPPORTED_PROPERTY",
      message: "Canonical URL property is missing or unsupported.",
      blockType: "page"
    });
    return undefined;
  }

  const url = typeof property.url === "string" ? property.url.trim() : "";
  return url.length > 0 ? url : undefined;
}
