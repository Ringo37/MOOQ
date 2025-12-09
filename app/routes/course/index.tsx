import type { Route } from "../course/+types/index";

export async function loader() {
  const name = "Hello";
  return { name };
}

export default function CourseIndex({ loaderData }: Route.ComponentProps) {
  const { name } = loaderData;
  return <h1>{name}さんのページ</h1>;
}
