import {
  BlockNoteSchema,
  createCodeBlockSpec,
  type Block,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { Center, Loader, useComputedColorScheme } from "@mantine/core";
import { useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { createHighlighter } from "shiki";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { SUPPORTED_LANGUAGES } from "./editorConfig";

interface EditorProps {
  initialContent?: Block[];
  name?: string;
}

function EditorClient({ initialContent, name }: EditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const colorScheme = useComputedColorScheme("light");
  const editor = useCreateBlockNote({
    schema: BlockNoteSchema.create().extend({
      blockSpecs: {
        codeBlock: createCodeBlockSpec({
          indentLineWithTab: true,
          defaultLanguage: "text",
          supportedLanguages: SUPPORTED_LANGUAGES,
          createHighlighter: () =>
            createHighlighter({
              themes: ["dark-plus", "light-plus"],
              langs: [],
            }) as any, // eslint-disable-line
        }),
      },
    }),
    initialContent,
  });

  return (
    <>
      <BlockNoteView
        editor={editor}
        theme={colorScheme}
        onChange={() => {
          setBlocks(editor.document);
        }}
      />
      <input name={name} value={JSON.stringify(blocks)} hidden readOnly />
    </>
  );
}

export function Editor(props: EditorProps) {
  return (
    <ClientOnly
      fallback={
        <Center>
          <Loader color="blue" size={25} />
        </Center>
      }
    >
      {() => <EditorClient {...props} />}
    </ClientOnly>
  );
}
