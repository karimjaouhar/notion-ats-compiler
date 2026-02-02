// Keep this file small: just the types we consume.
// We'll expand as we implement more block mappings.

export type NotionRichText = {
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    code: boolean;
  };
};

export type NotionBlock = {
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: any;
};

export type NotionPage = {
  id: string;
  properties: Record<string, any>;
};
