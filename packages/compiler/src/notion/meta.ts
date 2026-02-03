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

type KnownPropertyKey =
  | "title"
  | "slug"
  | "date"
  | "tags"
  | "canonicalUrl"
  | "summary"
  | "author"
  | "cover";

export function compilePageMeta(
  properties: Record<string, any>,
  opts: MetaCompileOptions = {}
): ArticleMeta {
  const meta: ArticleMeta = {};
  const onWarning = opts.onWarning;

  const titleProp = getPropertyByNames(properties, ["title", "Title"]) ?? getFirstTitleProperty(properties);
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

  const slugProp = getPropertyByNames(properties, ["slug", "Slug"]);
  if (slugProp) {
    const slugValue = compileSlug(slugProp, onWarning);
    if (slugValue) meta.slug = slugValue;
  }

  const dateProp = getPropertyByNames(properties, ["date", "Date"]);
  if (dateProp) {
    const dateValue = compileDate(dateProp, onWarning);
    if (dateValue) meta.date = dateValue;
  }

  const tagsProp = getPropertyByNames(properties, ["tags", "Tags"]);
  if (tagsProp) {
    const tagsValue = compileTags(tagsProp, onWarning);
    if (tagsValue) meta.tags = tagsValue;
  }

  const canonicalProp = getPropertyByNames(properties, ["canonicalUrl", "CanonicalUrl", "Canonical URL"]);
  if (canonicalProp) {
    const canonicalValue = compileCanonicalUrl(canonicalProp, onWarning);
    if (canonicalValue) meta.canonicalUrl = canonicalValue;
  }

  const summaryProp = getPropertyByNames(properties, ["summary", "Summary"]);
  if (summaryProp) {
    const summaryValue = compileSummary(summaryProp, onWarning);
    if (summaryValue) meta.summary = summaryValue;
  }

  const authorProp = getPropertyByNames(properties, ["author", "Author"]);
  if (authorProp) {
    const authorValue = compileAuthor(authorProp, onWarning);
    if (authorValue) meta.author = authorValue;
  }

  const coverProp = getPropertyByNames(properties, ["cover", "Cover"]);
  if (coverProp) {
    const coverUrl = compileCoverUrl(coverProp, onWarning);
    if (coverUrl) meta.coverUrl = coverUrl;
  }

  warnUnsupportedProperties(properties, onWarning);

  return meta;
}

function warnUnsupportedProperties(properties: Record<string, any>, onWarning?: MetaWarningHook): void {
  const known = new Set<KnownPropertyKey>([
    "title",
    "slug",
    "date",
    "tags",
    "canonicalUrl",
    "summary",
    "author",
    "cover"
  ]);
  const aliases = new Set<string>([
    "title",
    "Title",
    "slug",
    "Slug",
    "date",
    "Date",
    "tags",
    "Tags",
    "canonicalUrl",
    "CanonicalUrl",
    "Canonical URL",
    "summary",
    "Summary",
    "author",
    "Author",
    "cover",
    "Cover"
  ]);
  for (const key of Object.keys(properties ?? {})) {
    if (known.has(key as KnownPropertyKey) || aliases.has(key)) continue;
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

function compileSummary(property: any, onWarning?: MetaWarningHook): string | undefined {
  if (!property || property.type !== "rich_text" || !Array.isArray(property.rich_text)) {
    onWarning?.({
      code: "UNSUPPORTED_PROPERTY",
      message: "Summary property is missing or unsupported.",
      blockType: "page"
    });
    return undefined;
  }

  const spans = notionRichTextToSpans(property.rich_text as NotionRichText[]);
  const text = toPlainText(spans).trim();
  return text.length > 0 ? text : undefined;
}

function compileAuthor(property: any, onWarning?: MetaWarningHook): string | undefined {
  if (!property) {
    onWarning?.({
      code: "UNSUPPORTED_PROPERTY",
      message: "Author property is missing or unsupported.",
      blockType: "page"
    });
    return undefined;
  }

  if (property.type === "people" && Array.isArray(property.people)) {
    const names = property.people
      .map((person: any) => (typeof person?.name === "string" ? person.name : ""))
      .filter((name: string) => name.length > 0);
    return names.length > 0 ? names.join(", ") : undefined;
  }

  if (property.type === "rich_text" && Array.isArray(property.rich_text)) {
    const spans = notionRichTextToSpans(property.rich_text as NotionRichText[]);
    const text = toPlainText(spans).trim();
    return text.length > 0 ? text : undefined;
  }

  if (property.type === "title" && Array.isArray(property.title)) {
    const spans = notionRichTextToSpans(property.title as NotionRichText[]);
    const text = toPlainText(spans).trim();
    return text.length > 0 ? text : undefined;
  }

  onWarning?.({
    code: "UNSUPPORTED_PROPERTY",
    message: `Author property type "${property.type}" is not supported.`,
    blockType: "page"
  });
  return undefined;
}

function compileCoverUrl(property: any, onWarning?: MetaWarningHook): string | undefined {
  if (!property || property.type !== "files" || !Array.isArray(property.files)) {
    onWarning?.({
      code: "UNSUPPORTED_PROPERTY",
      message: "Cover property is missing or unsupported.",
      blockType: "page"
    });
    return undefined;
  }

  const file = property.files[0];
  if (!file) return undefined;
  if (file.type === "external") return file.external?.url;
  if (file.type === "file") return file.file?.url;
  return undefined;
}

function getPropertyByNames(properties: Record<string, any> | undefined, names: string[]): any | undefined {
  if (!properties) return undefined;
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(properties, name)) {
      return properties[name];
    }
  }
  return undefined;
}

function getFirstTitleProperty(properties: Record<string, any> | undefined): any | undefined {
  if (!properties) return undefined;
  const keys = Object.keys(properties);
  for (const key of keys) {
    const value = properties[key];
    if (value?.type === "title") return value;
  }
  return undefined;
}
