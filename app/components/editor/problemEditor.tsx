import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import { useMemo, useRef, useState } from "react";

import { marks, problemPlugins, tools } from "./config";

interface EditorProps {
  initialContent?: YooptaContentValue;
  name?: string;
}

export function ProblemEditor({ initialContent, name }: EditorProps) {
  const [value, setValue] = useState<YooptaContentValue>(initialContent ?? {});
  const editor = useMemo(() => createYooptaEditor(), []);
  const selectionRef = useRef(null);

  const onChange = (newValue: YooptaContentValue) => {
    setValue(newValue);
  };

  return (
    <div
      ref={selectionRef}
      className="px-15 editor-input"
      style={{ zIndex: 200 }}
    >
      <YooptaEditor
        editor={editor}
        plugins={problemPlugins as any} // eslint-disable-line
        tools={tools}
        marks={marks}
        selectionBoxRoot={selectionRef}
        value={value}
        onChange={onChange}
        autoFocus
        className="w-full!"
      />
      <input name={name} value={JSON.stringify(value)} hidden readOnly />
    </div>
  );
}
