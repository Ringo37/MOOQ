import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useComputedColorScheme } from "@mantine/core";

import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

export default function Editor() {
  const editor = useCreateBlockNote();
  const colorScheme = useComputedColorScheme("light");

  return <BlockNoteView editor={editor} theme={colorScheme} />;
}
