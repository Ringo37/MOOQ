import { Button } from "@mantine/core";
import {
  YooptaPlugin,
  type PluginElementRenderProps,
  type SlateElement,
  useYooptaEditor,
  Elements,
} from "@yoopta/editor";
import { Monitor } from "lucide-react";
import { useState } from "react";

export type GoogleSlideElement = SlateElement<
  "google-slide",
  {
    src?: string;
  }
>;

function toEmbedUrl(src: string) {
  if (src.includes("pubembed")) return src;
  if (src.includes("/embed")) return src;

  return src.replace("/edit", "/embed").replace("pub?", "pubembed?");
}

const GoogleSlide = ({
  element,
  blockId,
  attributes,
  children,
}: PluginElementRenderProps) => {
  const editor = useYooptaEditor();
  const { src } = element.props || {};

  const [inputUrl, setInputUrl] = useState("");

  const embedUrl = src ? toEmbedUrl(src) : "";

  const onEmbed = () => {
    if (!inputUrl) return;

    Elements.updateElement(editor, blockId, {
      type: "google-slide",
      props: { src: inputUrl },
    });
  };

  return (
    <div {...attributes} className="relative my-4" contentEditable={false}>
      {!src ? (
        <div className="rounded-lg border bg-muted p-4">
          {!editor.readOnly && (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded border px-3 py-2 text-sm"
                placeholder="Google Slides のURLを入力してください"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />

              <Button onClick={onEmbed} disabled={!inputUrl}>
                埋め込む
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="relative w-full bg-gray-200"
          style={{ paddingBottom: "calc(56.25% + 36px)" }}
        >
          <iframe
            src={embedUrl}
            title="Google Slide"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      )}

      {children}
    </div>
  );
};

const GoogleSlidePlugin = new YooptaPlugin({
  type: "GoogleSlide",
  elements: {
    "google-slide": {
      render: GoogleSlide,
      asRoot: true,
      props: {
        nodeType: "void",
        src: "",
      },
    },
  },
  options: {
    display: {
      title: "Google Slide",
      description: "Embed Google Presentation",
      icon: <Monitor size={24} />,
    },
    shortcuts: ["slide", "presentation"],
  },
});

export default GoogleSlidePlugin;
