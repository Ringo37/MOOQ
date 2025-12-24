import type { Block } from "@blocknote/core";
import { ServerBlockNoteEditor } from "@blocknote/server-util";

import type { CustomBlock, CustomPartialBlock } from "~/components/editor";
import { SUPPORTED_LANGUAGES } from "~/components/editorConfig";

import { highlighter } from "./shiki.server";

export async function blockToHTML(
  blocks?: string | CustomBlock[] | null,
): Promise<string> {
  const editor = ServerBlockNoteEditor.create();

  const parsedBlocks: CustomPartialBlock[] =
    typeof blocks === "string"
      ? JSON.parse(blocks)
      : blocks === null
        ? []
        : blocks;

  let finalHtml = "";
  let numberedIndex = 1;

  for (const block of parsedBlocks) {
    if (block.type === "numberedListItem") {
      let html = await editor.blocksToFullHTML([block as Block]);

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
        code = block.content.map((c: any) => c.text || "").join(""); // eslint-disable-line
      } else if (typeof block.content === "string") {
        code = block.content as string;
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
    }

    if (block.type === "googleSlide") {
      const src = (block.props?.src as string) || "";

      if (src) {
        finalHtml += `
          <div class="bn-block" data-content-type="googleSlide">
            <div style="position: relative; width: 100%; padding-bottom: calc(56.25% + 36px); background-color: #ccc;">
              <iframe
                src="${src}"
                width="100%"
                height="100%"
                allowfullscreen="true"
                style="position: absolute; top: 0; left: 0; border: none;"
              ></iframe>
            </div>
          </div>
          `;
      }
    } else {
      finalHtml += await editor.blocksToFullHTML([block as Block]);
    }
  }

  return finalHtml.replace(/<audio\b(?![^>]*\bcontrols\b)/g, "<audio controls");
}
