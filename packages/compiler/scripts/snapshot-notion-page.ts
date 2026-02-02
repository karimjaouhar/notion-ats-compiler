import "dotenv/config";
import { Client } from "@notionhq/client";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";


type Args = {
  page?: string;
  out?: string;
};

function parseArgs(argv: string[]): Args {
  // Supports:
  // pnpm snapshot --page <id-or-url> [--out test/fixtures/live/foo.json]
  const args: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--page") args.page = argv[i + 1];
    if (a === "--out") args.out = argv[i + 1];
  }
  return args;
}

function extractPageId(input: string): string {
  // Accepts:
  // - 32-char Notion ID (with or without dashes)
  // - Notion URL containing the ID
  const s = input.trim();

  // If URL, grab last 32-ish token.
  // Notion URLs often end with something like "...-<32hex>" or just "<32hex>"
  const urlMatch = s.match(/([0-9a-fA-F]{32})/);
  if (urlMatch?.[1]) return urlMatch[1].toLowerCase();

  const dashed = s.replace(/-/g, "");
  if (/^[0-9a-fA-F]{32}$/.test(dashed)) return dashed.toLowerCase();

  throw new Error(
    `Could not extract a Notion page id from: ${input}\nProvide a 32-char ID (with/without dashes) or a Notion URL containing the ID.`
  );
}

function safeFilename(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getPageTitle(notion: Client, pageId: string): Promise<string | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    // Title is in properties, but schema varies. We'll best-effort extract.
    // Many pages have a "title" property of type "title".
    // If we can't find it, return null.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (page as any).properties ?? {};
    for (const key of Object.keys(props)) {
      const p = props[key];
      if (p?.type === "title" && Array.isArray(p.title)) {
        return p.title.map((t: any) => t.plain_text).join("");
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function listAllBlockChildren(notion: Client, blockId: string) {
  // Notion paginates block children
  const all: any[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100
    });

    all.push(...res.results);
    if (!res.has_more) break;
    cursor = res.next_cursor ?? undefined;
    if (!cursor) break;
  }
  return all;
}

async function hydrateChildrenRecursively(notion: Client, blocks: any[]): Promise<any[]> {
  // Embed children as `children` field for supported recursion in tests/compiler
  const out: any[] = [];
  for (const b of blocks) {
    const copy = { ...b };
    if (b.has_children) {
      const kids = await listAllBlockChildren(notion, b.id);
      copy.children = await hydrateChildrenRecursively(notion, kids);
    }
    out.push(copy);
  }
  return out;
}

async function main() {
  const { page, out } = parseArgs(process.argv.slice(2));

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "Missing NOTION_TOKEN env var. Create a .env with NOTION_TOKEN=... (do not commit it)."
    );
  }

  if (!page) {
    throw new Error("Missing --page argument. Example: pnpm snapshot --page <pageIdOrUrl>");
  }

  const pageId = extractPageId(page);

  const notion = new Client({ auth: token });

  const title = await getPageTitle(notion, pageId);
  const filenameBase = title ? safeFilename(title) : `page-${pageId.slice(0, 8)}`;
  const defaultOut = path.join("test", "fixtures", "live", `${filenameBase}.json`);
  const outPath = out ?? defaultOut;

  // Root blocks for the page are the page's children
  const root = await listAllBlockChildren(notion, pageId);
  const hydrated = await hydrateChildrenRecursively(notion, root);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(hydrated, null, 2), "utf8");

  // Print a tiny summary
  // eslint-disable-next-line no-console
  console.log(`✅ Snapshot saved: ${outPath}`);
  // eslint-disable-next-line no-console
  console.log(`   Page: ${title ?? "(title unknown)"} (${pageId})`);
  // eslint-disable-next-line no-console
  console.log(`   Blocks: ${hydrated.length}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("❌ Snapshot failed:\n", err);
  process.exit(1);
});
