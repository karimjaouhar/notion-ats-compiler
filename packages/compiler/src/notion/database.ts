import type { NotionPage, NotionRichText } from "./types.js";
import { notionRichTextToSpans } from "./rich-text.js";
import { toPlainText } from "../ast/text.js";

export type DatabasePropertyMapping = {
  title?: string;
  date?: string;
  summary?: string;
  author?: string;
  slug?: string;
  cover?: string;
};

export type PostListItem = {
  id: string;
  title: string;
  date?: string;
  summary?: string;
  author?: string;
  slug?: string;
  coverUrl?: string;
};

const defaultMapping: Required<DatabasePropertyMapping> = {
  title: "Title",
  date: "Date",
  summary: "Summary",
  author: "Author",
  slug: "Slug",
  cover: "Cover"
};

export function compileNotionDatabaseIndex(
  pages: NotionPage[],
  mapping: DatabasePropertyMapping = {}
): PostListItem[] {
  const names = { ...defaultMapping, ...mapping };

  return pages.map((page) => {
    const properties = page.properties ?? {};
    const title = getTitleText(properties[names.title]) ?? "Untitled";
    const date = getDateValue(properties[names.date]);
    const summary = getRichTextValue(properties[names.summary]);
    const author = getAuthorValue(properties[names.author]);
    const slug = getRichTextValue(properties[names.slug]);
    const coverUrl = getFileUrl(properties[names.cover]) ?? getPageCoverUrl((page as any).cover);

    return {
      id: page.id,
      title,
      ...(date ? { date } : {}),
      ...(summary ? { summary } : {}),
      ...(author ? { author } : {}),
      ...(slug ? { slug } : {}),
      ...(coverUrl ? { coverUrl } : {})
    };
  });
}

function getTitleText(property: any): string | undefined {
  const title = property?.title;
  if (!Array.isArray(title)) return undefined;
  return toPlainText(notionRichTextToSpans(title as NotionRichText[])).trim() || undefined;
}

function getRichTextValue(property: any): string | undefined {
  const richText = property?.rich_text;
  if (!Array.isArray(richText)) return undefined;
  return toPlainText(notionRichTextToSpans(richText as NotionRichText[])).trim() || undefined;
}

function getDateValue(property: any): string | undefined {
  const date = property?.date;
  if (!date || typeof date.start !== "string") return undefined;
  return date.start;
}

function getAuthorValue(property: any): string | undefined {
  if (property?.rich_text) return getRichTextValue(property);
  if (property?.title) return getTitleText(property);
  const people = property?.people;
  if (!Array.isArray(people)) return undefined;
  const names = people.map((person) => person?.name).filter((name) => typeof name === "string");
  return names.length > 0 ? names.join(", ") : undefined;
}

function getFileUrl(property: any): string | undefined {
  const files = property?.files;
  if (!Array.isArray(files)) return undefined;
  const file = files[0];
  if (!file) return undefined;
  if (file.type === "external") return file.external?.url;
  if (file.type === "file") return file.file?.url;
  return undefined;
}

function getPageCoverUrl(cover: any): string | undefined {
  if (!cover) return undefined;
  if (cover.type === "external") return cover.external?.url;
  if (cover.type === "file") return cover.file?.url;
  return undefined;
}
