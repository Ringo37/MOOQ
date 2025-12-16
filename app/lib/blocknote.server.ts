import type { PartialBlock } from "@blocknote/core";
import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { createHighlighter, type Highlighter } from "shiki";

import { SUPPORTED_LANGUAGES } from "~/components/editorConfig";

let shikiHighlighter: Highlighter | null = null;

async function getShikiHighlighter() {
  if (!shikiHighlighter) {
    shikiHighlighter = await createHighlighter({
      themes: ["dark-plus", "light-plus"],
      langs: Object.keys(SUPPORTED_LANGUAGES),
    });
  }
  return shikiHighlighter;
}

export async function blockToHTML(
  blocks?: string | PartialBlock[] | null,
): Promise<string> {
  const editor = ServerBlockNoteEditor.create();

  const parsedBlocks: PartialBlock[] =
    typeof blocks === "string"
      ? JSON.parse(blocks)
      : blocks === null
        ? "[]"
        : blocks;

  const highlighter = await getShikiHighlighter();

  const htmlBlocks = await Promise.all(
    parsedBlocks.map(async (block) => {
      if (block.type === "codeBlock") {
        let code = "";

        if (Array.isArray(block.content)) {
          code = block.content.map((c: any) => c.text || "").join(""); //eslint-disable-line
        } else if (typeof block.content === "string") {
          code = block.content;
        }

        const lang = block.props?.language || "text";

        try {
          const shikiLang = Object.keys(SUPPORTED_LANGUAGES).includes(
            lang as string,
          )
            ? (lang as string)
            : "text";

          return highlighter.codeToHtml(code, {
            lang: shikiLang,
            themes: {
              light: "light-plus",
              dark: "dark-plus",
            },
          });
        } catch (e) {
          console.error("Shiki conversion error:", e);
        }
      } else {
        return editor.blocksToHTMLLossy([block]);
      }
    }),
  );

  return htmlBlocks.join("");
}
