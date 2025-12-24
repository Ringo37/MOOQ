import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import { createReactBlockSpec } from "@blocknote/react";
import { TextInput, Button, Box } from "@mantine/core";
import { Monitor } from "lucide-react";

import type { CustomEditor } from "../editor";

export const createGoogleSlideBlock = createReactBlockSpec(
  {
    type: "googleSlide",
    propSchema: {
      src: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => {
      if (!props.block.props.src) {
        return (
          <Box p="sm" style={{ width: "100%" }}>
            <TextInput
              placeholder="Google Slideの埋め込みURLまたはリンクを入力"
              width={"full"}
              rightSectionWidth={80}
              rightSection={
                <Button
                  size="xs"
                  onClick={() => {
                    const input = document.getElementById(
                      `input-${props.block.id}`,
                    ) as HTMLInputElement;
                    if (input?.value) {
                      let url = input.value;
                      if (url.includes("/edit")) {
                        url = url.replace(
                          /\/edit.*/,
                          "/embed?start=false&loop=false&delayms=3000",
                        );
                      } else if (url.includes("/pub")) {
                        url = url.replace(
                          /\/pub.*/,
                          "/embed?start=false&loop=false&delayms=3000",
                        );
                      }

                      props.editor.updateBlock(props.block, {
                        props: { src: url },
                      });
                    }
                  }}
                >
                  保存
                </Button>
              }
              id={`input-${props.block.id}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />
          </Box>
        );
      }

      return (
        <Box style={{ position: "relative", width: "100%" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: "calc(56.25% + 36px)",
            }}
          >
            <iframe
              src={props.block.props.src}
              width="100%"
              height="100%"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                border: "none",
              }}
            />
          </div>
          <Button
            size="xs"
            variant="default"
            style={{ position: "absolute", top: 8, right: 8, opacity: 0.8 }}
            onClick={() =>
              props.editor.updateBlock(props.block, { props: { src: "" } })
            }
          >
            編集
          </Button>
        </Box>
      );
    },
  },
);

export const insertGoogleSlideItem = (editor: CustomEditor) => ({
  title: "Google Slide",
  onItemClick: () =>
    insertOrUpdateBlockForSlashMenu(editor, { type: "googleSlide" }),
  aliases: ["slide", "google", "presentation", "ppt"],
  group: "Custom",
  icon: <Monitor size={18} />,
  subtext: "Googleスライドを埋め込みます",
});
