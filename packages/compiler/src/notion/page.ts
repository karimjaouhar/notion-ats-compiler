import type { Article } from "../ast/types.js";
import type { NotionBlock, NotionPage } from "./types.js";
import type { CompileWarning } from "./warnings.js";
import { compileBlocksToArticle } from "./compile.js";
import { compilePageMeta } from "./meta.js";

type CompilePageInput = {
  page: NotionPage;
  blocks: NotionBlock[];
  onWarning?: (warning: CompileWarning) => void;
};

export function compileNotionPage(input: CompilePageInput): Article {
  const meta = compilePageMeta(input.page.properties, { onWarning: input.onWarning });
  return compileBlocksToArticle(input.blocks, { meta, onWarning: input.onWarning });
}
