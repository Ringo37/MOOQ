import { createHighlighter, type Highlighter } from "shiki";

import { SUPPORTED_LANGUAGES } from "~/components/editorConfig";

const globalForShiki = global as unknown as {
  shiki: Highlighter;
};

export const highlighter =
  globalForShiki.shiki ||
  (await createHighlighter({
    themes: ["dark-plus", "light-plus"],
    langs: Object.keys(SUPPORTED_LANGUAGES),
  }));

if (process.env.NODE_ENV !== "production") {
  globalForShiki.shiki = highlighter;
}
