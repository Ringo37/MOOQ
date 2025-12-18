import {
  Box,
  Button,
  Container,
  Group,
  Stack,
  TextInput,
  Title,
  Text,
  Center,
  FileInput,
  Image,
  SegmentedControl,
} from "@mantine/core";
import { useState } from "react";
import { data, Form, redirect } from "react-router";

import type { CourseVisibility } from "generated/prisma/enums";
import { Editor } from "~/components/editor";
import {
  canEditCourseBySlug,
  getCourseBySlug,
  updateCourse,
} from "~/models/course.server";
import { uploadPublicFile } from "~/models/file.server";
import { requireUser } from "~/services/auth.server";
import { parseInitialContent } from "~/utils/parseInitialContent";

import type { Route } from "../coursesAdmin/+types/edit";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const slug = params.slug;

  const canEdit = await canEditCourseBySlug(slug, user.id);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }

  const course = await getCourseBySlug(slug);
  if (!course) {
    throw new Response("Not Found", { status: 404 });
  }

  return { course };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireUser(request);
  const originalSlug = params.slug!;

  if (user.role === "USER") {
    return data(null, { status: 403 });
  }

  const canEdit = await canEditCourseBySlug(originalSlug, user.id);
  if (!canEdit) {
    return data(null, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const coverFile = formData.get("cover");
  const visibility = formData.get("visibility") as CourseVisibility;

  if (!name || !slug || !visibility) {
    return data({ error: "INVALID_FORM" }, { status: 400 });
  }

  if (slug !== originalSlug) {
    const exists = await getCourseBySlug(slug);
    if (exists) {
      return data({ error: "SLUG_EXISTS" }, { status: 400 });
    }
  }

  let fileId: string | undefined = undefined;
  if (coverFile instanceof File && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop();
    const file = await uploadPublicFile(coverFile, "cover", `${slug}.${ext}`);
    fileId = file.id;
  }

  await updateCourse(originalSlug, name, slug, description, fileId, visibility);

  return redirect(`/courses-admin`);
}

export default function CoursesAdminEdit({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const { course } = loaderData;

  const [slug, setSlug] = useState(course.slug);
  const [visibility, setVisibility] = useState(course.visibility);
  const [checking, setChecking] = useState(false);
  const [slugOk, setSlugOk] = useState<boolean | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    course.cover?.url ?? null,
  );

  async function checkSlug() {
    if (!slug || slug === course.slug) {
      setSlugOk(true);
      return;
    }

    setChecking(true);
    setSlugOk(null);

    const res = await fetch(
      `/api/check-course-slug?slug=${encodeURIComponent(slug)}`,
    );
    const data = await res.json();

    setSlugOk(data.ok);
    setChecking(false);
  }

  return (
    <Container size="md">
      <Center>
        <Box maw={800} w="100%">
          <Title order={2} mb="md">
            コース更新
          </Title>

          {actionData?.error === "SLUG_EXISTS" && (
            <Text c="red" mb="sm">
              このスラグは既に使われています
            </Text>
          )}

          <Form method="post" encType="multipart/form-data">
            <Stack>
              <SegmentedControl
                value={visibility}
                onChange={(value) => setVisibility(value as CourseVisibility)}
                data={[
                  { label: "公開", value: "PUBLIC" },
                  { label: "限定公開", value: "PRIVATE" },
                  { label: "非公開", value: "UNLISTED" },
                ]}
                name="visibility"
              />

              <TextInput
                name="name"
                label="コース名"
                defaultValue={course.name}
                required
              />

              <Group align="flex-end">
                <TextInput
                  name="slug"
                  label="スラグ"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.currentTarget.value);
                    setSlugOk(null);
                  }}
                  required
                  style={{ flex: 1 }}
                />
                <Button variant="light" onClick={checkSlug} loading={checking}>
                  確認
                </Button>
              </Group>

              {slugOk === true && (
                <Text c="green" size="sm">
                  このスラグは使用できます
                </Text>
              )}
              {slugOk === false && (
                <Text c="red" size="sm">
                  このスラグは既に使われています
                </Text>
              )}

              <FileInput
                name="cover"
                label="カバー画像"
                accept="image/png,image/jpeg,image/webp"
                clearable
                placeholder={course.cover?.name ?? ""}
                onChange={(file) => {
                  setCoverPreview(file ? URL.createObjectURL(file) : null);
                }}
              />

              {coverPreview && (
                <Center>
                  <Image src={coverPreview} maw={300} />
                </Center>
              )}

              <Text size="sm">説明</Text>
              <Editor
                name="description"
                initialContent={parseInitialContent(course.description)}
              />

              <Group justify="flex-end">
                <Button type="submit" disabled={slugOk === false}>
                  更新
                </Button>
              </Group>
            </Stack>
          </Form>
        </Box>
      </Center>
    </Container>
  );
}
