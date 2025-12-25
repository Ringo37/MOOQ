import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { MantineProvider } from "@mantine/core";

import type { CustomBlock, CustomPartialBlock } from "~/components/editor";
import { customScheme } from "~/components/editor";
import { SUPPORTED_LANGUAGES } from "~/components/editorConfig";

import { highlighter } from "./shiki.server";

export async function blockToHTML(
  blocks?: string | CustomBlock[] | null,
): Promise<string> {
  const editor = ServerBlockNoteEditor.create({ schema: customScheme });

  const parsedBlocks: CustomPartialBlock[] =
    typeof blocks === "string" ? JSON.parse(blocks) : (blocks ?? []);

  return await editor.withReactContext(
    ({ children }) => <MantineProvider>{children}</MantineProvider>,
    async () => {
      let finalHtml = "";
      let numberedIndex = 1;

      for (const block of parsedBlocks) {
        if (block.type === "numberedListItem") {
          let html = await editor.blocksToFullHTML([block as CustomBlock]);

          html = html.replace(
            'data-content-type="numberedListItem"',
            `data-content-type="numberedListItem" data-index="${numberedIndex++}"`,
          );

          finalHtml += html;
          continue;
        }

        numberedIndex = 1;

        if (block.type === "codeBlock") {
          let code = "";

          if (Array.isArray(block.content)) {
            // eslint-disable-next-line
            code = block.content.map((c: any) => c.text || "").join("");
          } else if (typeof block.content === "string") {
            code = block.content;
          }

          const lang = (block.props?.language as string) || "text";
          const shikiLang = Object.keys(SUPPORTED_LANGUAGES).includes(lang)
            ? lang
            : "text";

          try {
            finalHtml += highlighter.codeToHtml(code, {
              lang: shikiLang,
              themes: { light: "light-plus", dark: "dark-plus" },
            });
          } catch (e) {
            console.error("Shiki conversion error:", e);
          }
          continue;
        }

        finalHtml += await editor.blocksToFullHTML([block as CustomBlock]);
      }

      return finalHtml.replace(
        /<audio\b(?![^>]*\bcontrols\b)/g,
        "<audio controls",
      );
    },
  );
}
