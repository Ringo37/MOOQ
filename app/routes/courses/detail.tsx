import { ClientOnly } from "remix-utils/client-only";

import Editor from "~/components/editor";
export default function CourseDetail() {
  return <ClientOnly>{() => <Editor />}</ClientOnly>;
}
