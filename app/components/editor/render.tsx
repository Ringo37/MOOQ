import Accordion from "@yoopta/accordion";
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
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";
import Paragraph from "@yoopta/paragraph";
import Table from "@yoopta/table";
import Video from "@yoopta/video";
import { useMemo } from "react";

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
  Image,
  Video,
  File,
];

interface EditorProps {
  content: YooptaContentValue;
}

export function Render({ content }: EditorProps) {
  const editor = useMemo(() => createYooptaEditor(), []);

  return (
    <div>
      <YooptaEditor
        editor={editor}
        plugins={plugins as any} // eslint-disable-line
        value={content}
        autoFocus
        className="w-full!"
        readOnly
      />
    </div>
  );
}
