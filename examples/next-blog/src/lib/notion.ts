import { Client } from "@notionhq/client";

export type NotionFetchResult = {
  page: any;
  blocks: any[];
};

export type NotionDatabaseResult = {
  pages: any[];
};

const getNotionClient = () => {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;
  return new Client({ auth: token });
};

const fetchBlockChildren = async (notion: Client, blockId: string): Promise<any[]> => {
  const results: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100
    });
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return results;
};

const hydrateChildren = async (notion: Client, blocks: any[]): Promise<any[]> => {
  for (const block of blocks) {
    if (block?.has_children) {
      const children = await fetchBlockChildren(notion, block.id);
      block.children = await hydrateChildren(notion, children);
    }
  }
  return blocks;
};

export const fetchPageWithBlocks = async (pageId: string): Promise<NotionFetchResult> => {
  const notion = getNotionClient();
  if (!notion) {
    throw new Error("Missing NOTION_TOKEN.");
  }

  const page = await notion.pages.retrieve({ page_id: pageId });
  const topLevelBlocks = await fetchBlockChildren(notion, pageId);
  const blocks = await hydrateChildren(notion, topLevelBlocks);

  return { page, blocks };
};

export const fetchDatabasePages = async (databaseId: string): Promise<NotionDatabaseResult> => {
  const notion = getNotionClient();
  if (!notion) {
    throw new Error("Missing NOTION_TOKEN.");
  }

  const results: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100
    });
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return { pages: results };
};
