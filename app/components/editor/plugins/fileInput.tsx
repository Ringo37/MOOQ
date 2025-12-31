import {
  Button,
  TextInput,
  Group,
  Text,
  Box,
  FileInput,
  Stack,
} from "@mantine/core";
import {
  YooptaPlugin,
  type PluginElementRenderProps,
  useYooptaEditor,
  Elements,
} from "@yoopta/editor";
import { FileUp, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const ProblemFileInput = ({
  element,
  blockId,
  attributes,
  children,
}: PluginElementRenderProps) => {
  const editor = useYooptaEditor();
  const { name, accept } = element.props || {};

  const [inputName, setInputName] = useState(name || "");
  const [inputAccept, setInputAccept] = useState(accept || "");

  const onCreateFileInput = () => {
    if (!inputName) return;

    Elements.updateElement(editor, blockId, {
      type: "problem-file-input",
      props: {
        name: inputName,
        accept: inputAccept,
      },
    });
  };

  const fileName = element.props?.fileName ?? "";
  const fileUrl = element.props?.fileUrl ?? "";

  return (
    <div {...attributes}>
      {!name && !editor.readOnly ? (
        <Stack gap="sm" contentEditable={false}>
          <Group align="flex-end" gap="sm">
            <TextInput
              style={{ flex: 1 }}
              label="識別名 (name)"
              placeholder="例: report_file"
              value={inputName}
              onChange={(e) => setInputName(e.currentTarget.value)}
              size="sm"
              className="problem-input"
            />
            <TextInput
              style={{ flex: 1 }}
              label="許可する形式 (accept)"
              placeholder="例: .pdf,image/*"
              value={inputAccept}
              onChange={(e) => setInputAccept(e.currentTarget.value)}
              size="sm"
              className="problem-input"
            />
            <Button
              onClick={onCreateFileInput}
              disabled={!inputName}
              leftSection={<CheckCircle2 size={16} />}
              variant="filled"
            >
              確定
            </Button>
          </Group>
        </Stack>
      ) : (
        <Box contentEditable={false} py="sm">
          {!editor.readOnly && (
            <Text size="xs" c="dimmed" mb={4} ml={2} fw={500}>
              [File: {name}]{accept ? ` (Accept: ${accept})` : ""}
            </Text>
          )}
          <FileInput
            name={name}
            accept={accept}
            placeholder="ファイルをアップロード"
            leftSection={<FileUp size={18} strokeWidth={1.5} />}
            radius="md"
            size="md"
            className="problem-file-input"
            style={{ pointerEvents: editor.readOnly ? "auto" : "none" }}
          />
          {fileUrl && (
            <Link to={fileUrl} target="_blank">
              {fileName}
            </Link>
          )}
        </Box>
      )}
      {children}
    </div>
  );
};

const ProblemFileInputPlugin = new YooptaPlugin({
  type: "ProblemFileInput",
  elements: {
    "problem-file-input": {
      render: ProblemFileInput,
      asRoot: true,
      props: {
        name: "",
        accept: "",
        fileUrl: "",
        fileName: "",
        nodeType: "void",
      },
    },
  },
  options: {
    display: {
      title: "Problem File Input",
      description: "Insert problem file input",
      icon: <FileUp size={20} />,
    },
    shortcuts: ["file", "upload"],
  },
});

export default ProblemFileInputPlugin;
