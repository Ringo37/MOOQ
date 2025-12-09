import { ClientOnly } from "remix-utils/client-only";

import Editor from "~/components/editor";
export default function CourseYear() {
  return <ClientOnly>{() => <Editor />}</ClientOnly>;
}
