# Notion Database Mapping (Blog Index)

This helper maps Notion database page properties into a normalized blog index item.

## Helper

`compileNotionDatabaseIndex(pages, mapping?) -> PostListItem[]`

Default property names:

- `Title` (title)
- `Date` (date)
- `Summary` (rich_text)
- `Author` (rich_text or people)
- `Slug` (rich_text)
- `Cover` (files)

## Output shape

```ts
type PostListItem = {
  id: string;
  title: string;
  date?: string; // ISO date string from Notion date.start
  summary?: string;
  author?: string;
  slug?: string;
  coverUrl?: string;
};
```

## Property type expectations

- **Title**: Notion `title` property.
- **Date**: Notion `date` property (`date.start`).
- **Summary**: Notion `rich_text` property.
- **Author**: Notion `rich_text` or `people` property.
- **Slug**: Notion `rich_text` property.
- **Cover**: Notion `files` property (first file used).

`coverUrl` will also fall back to the page-level `cover` if the `Cover` property is not set.

## Custom mapping

```ts
compileNotionDatabaseIndex(pages, {
  title: "Name",
  date: "Published",
  summary: "Excerpt",
  author: "Byline",
  slug: "Slug",
  cover: "Hero"
});
```
