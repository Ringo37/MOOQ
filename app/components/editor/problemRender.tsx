import { Button, Paper } from "@mantine/core";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import { Upload } from "lucide-react";
import { useMemo } from "react";

import { plugins } from "./config";
import ProblemInputPlugin from "./plugins/input";
import ProblemTextareaPlugin from "./plugins/textarea";

interface EditorProps {
  content: YooptaContentValue;
  disabled?: boolean;
}

const problemPlugins = [...plugins, ProblemInputPlugin, ProblemTextareaPlugin];

export function ProblemRender({ content, disabled }: EditorProps) {
  const editor = useMemo(() => createYooptaEditor(), []);

  return (
    <Paper shadow="xs" p="md">
      <fieldset disabled={disabled}>
        <YooptaEditor
          editor={editor}
          plugins={problemPlugins as any} // eslint-disable-line
          value={content}
          autoFocus
          className="w-full! pb-2!"
          readOnly
        />
        <Button leftSection={<Upload size={14} color="white" />}>提出</Button>
      </fieldset>
    </Paper>
  );
}
