import { Button, Container, Divider, Group, Text, Title } from "@mantine/core";
import type { YooptaContentValue } from "@yoopta/editor";
import { Form, Link } from "react-router";

import { Editor } from "~/components/editor/editor";
import { getBlockById, updateBlock } from "~/models/block.server";
import { canEditCourseBySlug } from "~/models/course.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "./+types";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const blockId = params.blockId;
  const canEdit = await canEditCourseBySlug(courseSlug, userId);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }
  const block = await getBlockById(blockId);
  if (!block) {
    throw new Response("Not Found", { status: 404 });
  }
  return { block };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const blockId = params.blockId;
  const canEdit = await canEditCourseBySlug(courseSlug, userId);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }
  const formData = await request.formData();
  const content = formData.get("content") as string;
  await updateBlock(blockId, content);
  return { success: true };
}

export default function CorsesAdminBlockIndex({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { block } = loaderData;
  const isProblem = block.type === "PROBLEM";
  return (
    <Container size="full" py="md">
      <Group justify="space-between" mb="lg">
        <Group>
          <Title order={2}>{isProblem ? "問題" : "コンテンツ"}編集</Title>
          <Text size="xs" c="dimmed">
            ID: {block.id}
          </Text>
        </Group>
        <Group>
          <Button form="block-form" type="submit">
            保存
          </Button>
          <Link
            to={`/courses-admin/${params.courseSlug}/${params.sectionSlug}/${params.lectureSlug}/${params.pageSlug}`}
          >
            <Button color="green">ページ編集</Button>
          </Link>
        </Group>
      </Group>
      <Divider mb="md" />
      <Form method="post" id="block-form">
        {isProblem && <Title order={3}>カバー</Title>}
        <Editor
          initialContent={
            block.content
              ? (JSON.parse(block.content) as YooptaContentValue)
              : undefined
          }
          name="content"
        />
        {isProblem && <Title order={3}>問題</Title>}
      </Form>
    </Container>
  );
}
