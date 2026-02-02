export type CompileWarning = {
  code: "EMPTY_TOGGLE" | "UNSUPPORTED_BLOCK" | "MISSING_IMAGE_URL";
  message: string;
  blockId?: string;
  blockType?: string;
};
