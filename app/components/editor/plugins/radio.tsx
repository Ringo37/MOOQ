import {
  Button,
  TextInput,
  Group,
  Text,
  Box,
  Radio,
  Stack,
  ActionIcon,
} from "@mantine/core";
import {
  YooptaPlugin,
  type PluginElementRenderProps,
  useYooptaEditor,
  Elements,
} from "@yoopta/editor";
import { ListTodo, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const ProblemRadio = ({
  element,
  blockId,
  attributes,
  children,
}: PluginElementRenderProps) => {
  const editor = useYooptaEditor();
  const { name, options = [] } = element.props || {};

  const [tempName, setTempName] = useState(name || "");
  const [tempOptions, setTempOptions] = useState<string[]>(
    options.length > 0 ? options : [""],
  );

  const addOption = () => setTempOptions([...tempOptions, ""]);

  const updateOption = (index: number, value: string) => {
    const newOptions = [...tempOptions];
    newOptions[index] = value;
    setTempOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setTempOptions(tempOptions.filter((_, i) => i !== index));
  };

  const onCreateRadio = () => {
    if (
      !tempName ||
      tempOptions.filter((opt) => opt.trim() !== "").length === 0
    )
      return;

    Elements.updateElement(editor, blockId, {
      type: "problem-radio",
      props: {
        name: tempName,
        options: tempOptions.filter((opt) => opt.trim() !== ""),
      },
    });
  };

  return (
    <div {...attributes}>
      {!name && !editor.readOnly ? (
        <Stack gap="sm" contentEditable={false}>
          <TextInput
            label="識別名 (name)"
            placeholder="例: question_01"
            value={tempName}
            onChange={(e) => setTempName(e.currentTarget.value)}
            className="problem-input"
          />
          <Box>
            <Text size="sm" fw={500} mb={4}>
              選択肢
            </Text>
            <Stack gap="xs">
              {tempOptions.map((opt, index) => (
                <Group key={index} gap="xs">
                  <TextInput
                    style={{ flex: 1 }}
                    placeholder={`選択肢 ${index + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(index, e.currentTarget.value)}
                    size="sm"
                    className="problem-input"
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeOption(index)}
                    disabled={tempOptions.length <= 1}
                  >
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<Plus size={14} />}
              onClick={addOption}
              mt="xs"
            >
              選択肢を追加
            </Button>
          </Box>

          <Button
            onClick={onCreateRadio}
            disabled={!tempName || tempOptions.every((o) => !o)}
            leftSection={<CheckCircle2 size={16} />}
            fullWidth
          >
            確定
          </Button>
        </Stack>
      ) : (
        <Box contentEditable={false} py="sm">
          {!editor.readOnly && (
            <Text size="xs" c="dimmed" mb={8} ml={2} fw={500}>
              [Radio: {name}]
            </Text>
          )}
          <Radio.Group name={name} label={null}>
            <Stack gap="xs">
              {options.map((option: string, index: number) => (
                <Radio
                  key={index}
                  value={option}
                  label={option}
                  className="problem-input"
                />
              ))}
            </Stack>
          </Radio.Group>
        </Box>
      )}
      {children}
    </div>
  );
};

const ProblemRadioPlugin = new YooptaPlugin({
  type: "ProblemRadio",
  elements: {
    "problem-radio": {
      render: ProblemRadio,
      asRoot: true,
      props: {
        name: "",
        options: [],
        nodeType: "void",
      },
    },
  },
  options: {
    display: {
      title: "Problem Radio",
      description: "Insert problem radio",
      icon: <ListTodo size={20} />,
    },
    shortcuts: ["radio", "choice"],
  },
});

export default ProblemRadioPlugin;
