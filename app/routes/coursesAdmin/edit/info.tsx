import {
  Box,
  Button,
  Group,
  Stack,
  TextInput,
  Text,
  Center,
  FileInput,
  Image,
  SegmentedControl,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { YooptaContentValue } from "@yoopta/editor";
import { useEffect, useState } from "react";
import { data, useFetcher } from "react-router";
import sharp from "sharp";

import type { CourseVisibility } from "generated/prisma/enums";
import { Editor } from "~/components/editor/editor";
import type { NavGroup } from "~/components/navItems";
import {
  canEditCourseBySlug,
  getCourseBySlug,
  getCourseBySlugWithCurriculum,
  updateCourse,
} from "~/models/course.server";
import { uploadPublicFile } from "~/models/file.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "../../coursesAdmin/edit/+types/info";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const slug = params.slug;

  const canEdit = await canEditCourseBySlug(slug, user.id);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }

  const course = await getCourseBySlugWithCurriculum(slug);
  if (!course) {
    throw new Response("Not Found", { status: 404 });
  }

  const sidebarDataCourse: NavGroup[] = course.sections.map((section) => ({
    icon: "book",
    label: section.name,
    items: section.lectures.map((lecture) => ({
      title: lecture.name,
      link: `/courses/${course.slug}/${section.slug}/${lecture.slug}`,
    })),
  }));

  const sidebarDataPages: NavGroup = {
    icon: "page",
    label: "ページ一覧",
    items: course.sections.flatMap((section) =>
      section.lectures.flatMap((lecture) =>
        lecture.pages.map((page) => ({
          title: `${page.name} (${lecture.name})`,
          link: `/courses-admin/${course.slug}/${section.slug}/${lecture.slug}/${page.slug}`,
        })),
      ),
    ),
  };
  const sidebarData: NavGroup[] = [...sidebarDataCourse, sidebarDataPages];

  return { course, sidebarData };
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
    const buffer = await coverFile.arrayBuffer();
    const webpBuffer = await sharp(Buffer.from(buffer))
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const ext = "webp";
    const webpFile = new File([new Uint8Array(webpBuffer)], `${slug}.${ext}`, {
      type: "image/webp",
    });
    const file = await uploadPublicFile(webpFile, "cover", `${slug}.${ext}`);
    fileId = file.id;
  }
  await updateCourse(originalSlug, name, slug, description, fileId, visibility);

  return data({ success: true });
}

export default function CoursesAdminEditInfo({
  loaderData,
}: Route.ComponentProps) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
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

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      notifications.show({
        title: "保存しました",
        message: "コース情報の更新が完了しました",
        color: "green",
        position: "top-right",
        autoClose: 2000,
      });
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Center>
      <Box w="100%">
        {fetcher.data?.error === "SLUG_EXISTS" && (
          <Text c="red" mb="sm">
            このスラグは既に使われています
          </Text>
        )}

        <fetcher.Form
          method="post"
          encType="multipart/form-data"
          id="info-form"
        >
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
              initialContent={
                JSON.parse(course.description ?? "") as YooptaContentValue
              }
              name="description"
            />

            <Group justify="flex-end">
              <Button type="submit" disabled={slugOk === false}>
                保存
              </Button>
            </Group>
          </Stack>
        </fetcher.Form>
      </Box>
    </Center>
  );
}
