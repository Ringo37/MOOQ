import { Button, TextInput, Group, Text, Box } from "@mantine/core";
import {
  YooptaPlugin,
  type PluginElementRenderProps,
  useYooptaEditor,
  Elements,
} from "@yoopta/editor";
import { PencilLine, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const ProblemInput = ({
  element,
  blockId,
  attributes,
  children,
}: PluginElementRenderProps) => {
  const editor = useYooptaEditor();
  const name = element.props?.name;

  const [inputName, setInputName] = useState(name || "");

  const onCreateInput = () => {
    if (!inputName) return;

    Elements.updateElement(editor, blockId, {
      type: "problem-input",
      props: {
        name: inputName,
      },
    });
  };

  return (
    <div {...attributes}>
      {!name && !editor.readOnly ? (
        <Group align="flex-end" gap="sm" contentEditable={false}>
          <TextInput
            style={{ flex: 1 }}
            label="識別名 (name)"
            placeholder="例: answer_01"
            value={inputName}
            onChange={(e) => setInputName(e.currentTarget.value)}
            size="sm"
            className="problem-input"
          />
          <Button
            onClick={onCreateInput}
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
              [Input: {name}]
            </Text>
          )}
          <TextInput
            name={name}
            placeholder="回答を入力してください"
            radius="md"
            size="md"
            className="problem-input"
          />
        </Box>
      )}
      {children}
    </div>
  );
};

const ProblemInputPlugin = new YooptaPlugin({
  type: "ProblemInput",
  elements: {
    "problem-input": {
      render: ProblemInput,
      asRoot: true,
      props: {
        name: "",
        nodeType: "void",
      },
    },
  },
  options: {
    display: {
      title: "Problem Input",
      description: "Insert problem input",
      icon: <PencilLine size={20} />,
    },
    shortcuts: ["input", "answer"],
  },
});

export default ProblemInputPlugin;
