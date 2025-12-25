import {
  BlockNoteSchema,
  createCodeBlockSpec,
  createHeadingBlockSpec,
  defaultBlockSpecs,
  type Block,
} from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/mantine";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
  type DefaultReactSuggestionItem,
} from "@blocknote/react";
import { Center, Loader, useComputedColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { createHighlighter } from "shiki";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import {
  createGoogleSlideBlock,
  insertGoogleSlideItem,
} from "./editor/googleSlide";
import { SUPPORTED_LANGUAGES } from "./editorConfig";

interface EditorProps {
  initialContent?: Block[];
  name?: string;
}

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  const ret = await fetch("/api/file-upload", {
    method: "POST",
    body: body,
  });
  return (await ret.json()).url;
}

const {
  paragraph,
  bulletListItem,
  numberedListItem,
  image,
  audio,
  video,
  file,
  divider,
  table,
} = defaultBlockSpecs;
const heading = createHeadingBlockSpec({
  allowToggleHeadings: false,
  levels: [1, 2, 3, 4, 5, 6],
});

const schema = BlockNoteSchema.create({
  blockSpecs: {
    googleSlide: createGoogleSlideBlock(),
    paragraph,
    heading,
    bulletListItem,
    numberedListItem,
    image,
    audio,
    video,
    file,
    table,
    divider,
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
});

export const customScheme = schema;
export type CustomEditor = typeof schema.BlockNoteEditor;
export type CustomBlock = typeof schema.Block;
export type CustomPartialBlock = typeof schema.PartialBlock;

function EditorClient({ initialContent, name }: EditorProps) {
  const [blocks, setBlocks] = useState<CustomBlock[]>([]);
  const colorScheme = useComputedColorScheme();
  const editor = useCreateBlockNote({
    schema,
    uploadFile,
  });

  const [isInitialContentSet, setIsInitialContentSet] = useState(false);

  useEffect(() => {
    if (editor && initialContent && !isInitialContentSet) {
      setTimeout(() => {
        editor.replaceBlocks(editor.document, initialContent as []);
        setIsInitialContentSet(true);
      }, 0);
    }
  }, [editor, initialContent, isInitialContentSet]);

  const getCustomSlashMenuItems = (
    editor: CustomEditor,
  ): DefaultReactSuggestionItem[] => [
    ...getDefaultReactSlashMenuItems(editor),
    insertGoogleSlideItem(editor),
  ];

  return (
    <>
      <BlockNoteView
        editor={editor}
        theme={colorScheme}
        onChange={() => {
          setBlocks(editor.document);
        }}
        className="editor-input"
        style={{ zIndex: 200 }}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(getCustomSlashMenuItems(editor), query)
          }
        />
      </BlockNoteView>
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
