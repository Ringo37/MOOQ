import Accordion from "@yoopta/accordion";
import ActionMenuList, {
  DefaultActionMenuRender,
} from "@yoopta/action-menu-list";
import Blockquote from "@yoopta/blockquote";
import Callout from "@yoopta/callout";
import Code from "@yoopta/code";
import Divider from "@yoopta/divider";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import Embed from "@yoopta/embed";
import File from "@yoopta/file";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import Image from "@yoopta/image";
import Link from "@yoopta/link";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";
import {
  Bold,
  Italic,
  CodeMark,
  Underline,
  Strike,
  Highlight,
} from "@yoopta/marks";
import Paragraph from "@yoopta/paragraph";
import Table from "@yoopta/table";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import Video from "@yoopta/video";
import { useMemo, useRef, useState } from "react";

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  const ret = await fetch("/api/file-upload", {
    method: "POST",
    body: body,
  });
  return (await ret.json()).url;
}

const plugins = [
  Paragraph,
  Table,
  Divider,
  Accordion,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  Callout,
  NumberedList,
  BulletedList,
  TodoList,
  Code,
  Link,
  Embed,
  Image.extend({
    options: {
      async onUpload(file) {
        const url = await uploadFile(file);

        return {
          src: url,
          alt: file.name,
        };
      },
    },
  }),
  Video.extend({
    options: {
      onUpload: async (file) => {
        const url = await uploadFile(file);
        return {
          src: url,
          alt: file.name,
        };
      },
      onUploadPoster: async (file) => {
        const image = await uploadFile(file);
        return image.secure_url;
      },
    },
  }),
  File.extend({
    options: {
      onUpload: async (file) => {
        const url = await uploadFile(file);
        return {
          src: url,
          format: file.type,
          name: file.name,
          size: file.size,
        };
      },
    },
  }),
];

const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

interface EditorProps {
  initialContent?: YooptaContentValue;
  name?: string;
}

export function Editor({ initialContent, name }: EditorProps) {
  const [value, setValue] = useState<YooptaContentValue>(initialContent ?? {});
  const editor = useMemo(() => createYooptaEditor(), []);
  const selectionRef = useRef(null);

  const onChange = (newValue: YooptaContentValue) => {
    setValue(newValue);
  };

  return (
    <div
      ref={selectionRef}
      className="pl-15 editor-input"
      style={{ zIndex: 200 }}
    >
      <YooptaEditor
        editor={editor}
        plugins={plugins as any} // eslint-disable-line
        tools={TOOLS}
        marks={MARKS}
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
