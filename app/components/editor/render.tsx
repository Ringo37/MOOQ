import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import { useMemo } from "react";

import { marks, plugins } from "./config";

interface RenderProps {
  content: YooptaContentValue;
}

export function Render({ content }: RenderProps) {
  const editor = useMemo(() => createYooptaEditor(), []);

  return (
    <div>
      <YooptaEditor
        editor={editor}
        plugins={plugins as any} // eslint-disable-line
        marks={marks}
        value={content}
        autoFocus
        className="w-full! py-3!"
        readOnly
      />
    </div>
  );
}
