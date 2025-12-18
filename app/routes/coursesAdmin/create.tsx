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
} from "@mantine/core";
import { useState } from "react";
import { data, Form, redirect } from "react-router";

import { Editor } from "~/components/editor";
import { createCourse, getCourseBySlug } from "~/models/course.server";
import { uploadPublicFile } from "~/models/file.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "../coursesAdmin/+types/create";

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  if (user.role === "USER") {
    return data(null, { status: 403 });
  }
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const coverFile = formData.get("cover");
  let fileId: string | null = null;

  if (!name || !slug) {
    return data({ error: "INVALID_FORM" }, { status: 400 });
  }
  if (slug === "create") {
    return data({ error: "Cannot use this word" }, { status: 400 });
  }

  try {
    const exists = await getCourseBySlug(slug);
    if (exists) {
      return data({ error: "SLUG_EXISTS" }, { status: 400 });
    }

    if (coverFile instanceof File && coverFile.size > 0) {
      const ext = coverFile.name.split(".").pop();
      const file = await uploadPublicFile(coverFile, "cover", `${slug}.${ext}`);
      fileId = file.id;
    }

    const course = createCourse(name, slug, description, user.id, fileId);
    if (!course) {
      return data(null, { status: 500 });
    }

    return redirect("/courses-admin");
  } catch (e) {
    return data({ error: e }, { status: 500 });
  }
}

export default function CoursesAdminCreate({
  actionData,
}: Route.ComponentProps) {
  const [slug, setSlug] = useState("");
  const [checking, setChecking] = useState(false);
  const [slugOk, setSlugOk] = useState<boolean | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  async function checkSlug() {
    if (!slug) return;

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
        <Box w="100%">
          <Title order={2} mb="md">
            コース作成
          </Title>

          {actionData?.error === "SLUG_EXISTS" && (
            <Text c="red" mb="sm">
              このスラグは既に使われています
            </Text>
          )}

          <Form method="post" encType="multipart/form-data">
            <Stack>
              <TextInput name="name" label="コース名" required />

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
                placeholder="画像をアップロード"
                accept="image/png,image/jpeg,image/webp"
                clearable
                onChange={(file) => {
                  if (file) {
                    setCoverPreview(URL.createObjectURL(file));
                  } else {
                    setCoverPreview(null);
                  }
                }}
              />
              {coverPreview && (
                <Box mt="sm">
                  <Center>
                    <Image src={coverPreview} alt="Cover preview" maw={300} />
                  </Center>
                </Box>
              )}

              <Text size="sm">説明</Text>
              <Editor name="description" />

              <Group justify="flex-end">
                <Button type="submit" disabled={slugOk === false}>
                  作成
                </Button>
              </Group>
            </Stack>
          </Form>
        </Box>
      </Center>
    </Container>
  );
}
