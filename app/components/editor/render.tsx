import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import { useMemo } from "react";

import { plugins } from "./config";

interface EditorProps {
  content: YooptaContentValue;
}

export function Render({ content }: EditorProps) {
  const editor = useMemo(() => createYooptaEditor(), []);

  return (
    <div>
      <YooptaEditor
        editor={editor}
        plugins={plugins as any} // eslint-disable-line
        value={content}
        autoFocus
        className="w-full! py-3!"
        readOnly
      />
    </div>
  );
}
