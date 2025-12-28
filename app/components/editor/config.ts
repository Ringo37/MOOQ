import Accordion from "@yoopta/accordion";
import ActionMenuList, {
  DefaultActionMenuRender,
} from "@yoopta/action-menu-list";
import Blockquote from "@yoopta/blockquote";
import Callout from "@yoopta/callout";
import Code from "@yoopta/code";
import Divider from "@yoopta/divider";
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

import GoogleSlidePlugin from "./plugins/googleSlide";

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  const ret = await fetch("/api/file-upload", {
    method: "POST",
    body: body,
  });
  return (await ret.json()).url;
}

export const plugins = [
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
  GoogleSlidePlugin,
];

export const tools = {
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

export const marks = [Bold, Italic, CodeMark, Underline, Strike, Highlight];
