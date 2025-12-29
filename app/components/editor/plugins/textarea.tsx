import {
  Button,
  TextInput,
  Textarea,
  Group,
  Text,
  Box,
  NumberInput,
} from "@mantine/core";
import {
  YooptaPlugin,
  type PluginElementRenderProps,
  useYooptaEditor,
  Elements,
} from "@yoopta/editor";
import { AlignLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const ProblemTextarea = ({
  element,
  blockId,
  attributes,
  children,
}: PluginElementRenderProps) => {
  const editor = useYooptaEditor();
  const { name, rows } = element.props || {};

  const [inputName, setInputName] = useState(name || "");
  const [inputRows, setInputRows] = useState<number | string>(rows || 3);

  const onCreateTextarea = () => {
    if (!inputName) return;

    Elements.updateElement(editor, blockId, {
      type: "problem-textarea",
      props: {
        name: inputName,
        rows: Number(inputRows) || 5,
      },
    });
  };

  return (
    <div {...attributes} contentEditable={false}>
      {!name && !editor.readOnly ? (
        <Group align="flex-end" gap="sm">
          <TextInput
            style={{ flex: 1 }}
            label="識別名 (name)"
            placeholder="例: essay_01"
            value={inputName}
            onChange={(e) => setInputName(e.currentTarget.value)}
            size="sm"
            className="problem-input"
          />
          <NumberInput
            label="表示行数"
            value={inputRows}
            onChange={setInputRows}
            min={1}
            max={20}
            style={{ width: 80 }}
            size="sm"
            className="problem-input"
          />
          <Button
            onClick={onCreateTextarea}
            disabled={!inputName}
            leftSection={<CheckCircle2 size={16} />}
            variant="filled"
          >
            確定
          </Button>
        </Group>
      ) : (
        <Box contentEditable={false}>
          {!editor.readOnly && (
            <Text size="xs" c="dimmed" mb={4} ml={2} fw={500}>
              [Textarea: {name} / {rows} rows]
            </Text>
          )}
          <Textarea
            name={name}
            placeholder="ここに回答を入力してください"
            radius="md"
            size="md"
            autosize
            minRows={rows || 5}
            className="problem-input"
          />
        </Box>
      )}
      {children}
    </div>
  );
};

const ProblemTextareaPlugin = new YooptaPlugin({
  type: "ProblemTextarea",
  elements: {
    "problem-textarea": {
      render: ProblemTextarea,
      asRoot: true,
      props: {
        name: "",
        rows: 5,
        nodeType: "void",
      },
    },
  },
  options: {
    display: {
      title: "Problem Textarea",
      description: "Inset problem textarea",
      icon: <AlignLeft size={20} />,
    },
    shortcuts: ["textarea", "essay"],
  },
});

export default ProblemTextareaPlugin;
