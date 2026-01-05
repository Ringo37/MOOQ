import {
  Button,
  Container,
  Divider,
  Group,
  SegmentedControl,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { YooptaContentValue } from "@yoopta/editor";
import { useEffect } from "react";
import { data, Link, useFetcher } from "react-router";

import type { ProblemStatus } from "generated/prisma/enums";
import { Editor } from "~/components/editor/editor";
import { ProblemEditor } from "~/components/editor/problemEditor";
import {
  getBlockById,
  updateBlock,
  updateBlockWithProblemAndAnswers,
} from "~/models/block.server";
import { canEditCourseBySlug } from "~/models/course.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "./+types/block";

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
  const problem = formData.get("problem") as string;
  const problemName = formData.get("problemName") as string;
  const problemStatus = formData.get("status") as ProblemStatus;

  try {
    if (problem && problemStatus) {
      await updateBlockWithProblemAndAnswers(
        blockId,
        content,
        problemName,
        problem,
        problemStatus,
      );
    } else {
      await updateBlock(blockId, content);
    }
    return { success: true };
  } catch {
    return data(
      {
        success: false,
        error: "保存に失敗しました。",
      },
      { status: 500 },
    );
  }
}

export default function CorsesAdminBlockIndex({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { block } = loaderData;
  const fetcher = useFetcher();
  const isProblem = block.type === "PROBLEM";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      notifications.show({
        title: "保存しました",
        message: "更新が完了しました",
        color: "green",
        position: "top-right",
        autoClose: 2000,
      });
    } else if (fetcher.state === "idle" && fetcher.data?.success === false) {
      notifications.show({
        title: "保存失敗",
        message: fetcher.data?.error || "エラーが発生しました",
        color: "red",
        position: "top-right",
        autoClose: 2000,
      });
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Container size="full" py="md">
      <fetcher.Form method="post" id="block-form">
        <Group justify="space-between" mb="lg">
          <Group>
            <Title order={2}>{isProblem ? "問題" : "コンテンツ"}編集</Title>
            {isProblem && (
              <>
                <TextInput
                  name="problemName"
                  placeholder="問題名"
                  defaultValue={block.problem?.name ?? ""}
                />
                <SegmentedControl
                  defaultValue={block.problem?.status || "HIDDEN"}
                  data={[
                    { label: "オープン", value: "OPEN" },
                    { label: "クローズ", value: "CLOSED" },
                    { label: "採点済み", value: "GRADED" },
                    { label: "非公開", value: "HIDDEN" },
                  ]}
                  name="status"
                />
              </>
            )}
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

        {isProblem && <Title order={3}>カバー</Title>}
        <Editor
          initialContent={
            block.content
              ? (JSON.parse(block.content) as YooptaContentValue)
              : undefined
          }
          name="content"
        />
        {isProblem && (
          <>
            <Title order={3}>問題</Title>
            <ProblemEditor
              initialContent={
                block.problem?.content
                  ? (JSON.parse(block.problem.content) as YooptaContentValue)
                  : undefined
              }
              name="problem"
            ></ProblemEditor>
          </>
        )}
      </fetcher.Form>
    </Container>
  );
}
