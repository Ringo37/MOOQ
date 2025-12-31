import { Button, Paper, Text } from "@mantine/core";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import { Pencil, Upload } from "lucide-react";
import { useMemo } from "react";

import { problemPlugins } from "./config";

interface EditorProps {
  content: YooptaContentValue | null;
  cover: YooptaContentValue | null;
  disabled?: boolean;
}

export function ProblemRender({ content, cover, disabled }: EditorProps) {
  const editor = useMemo(() => createYooptaEditor(), []);

  return (
    <Paper shadow="xs" p="md" withBorder>
      {content && (
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
      )}
      {cover && !content && (
        <div>
          <YooptaEditor
            editor={editor}
            plugins={problemPlugins as any} // eslint-disable-line
            value={cover}
            autoFocus
            className="w-full! pb-2!"
            readOnly
          />
          <Text className="py-3!">現在この問題は非公開です</Text>
          <Button
            leftSection={<Pencil size={14} color="white" />}
            color="green"
          >
            問題を解く
          </Button>
        </div>
      )}
    </Paper>
  );
}
