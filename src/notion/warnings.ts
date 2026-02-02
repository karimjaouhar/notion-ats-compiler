export type CompileWarning = {
  code:
    | "EMPTY_TOGGLE"
    | "UNSUPPORTED_BLOCK"
    | "MISSING_IMAGE_URL"
    | "MISSING_EMBED_URL"
    | "MISSING_BOOKMARK_URL"
    | "UNSUPPORTED_TABLE_STRUCTURE"
    | "MISSING_TITLE"
    | "UNSUPPORTED_PROPERTY"
    | "MALFORMED_DATE"
    | "MALFORMED_SLUG";
  message: string;
  blockId?: string;
  blockType?: string;
};
