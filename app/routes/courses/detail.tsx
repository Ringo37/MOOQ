import {
  Box,
  Container,
  Text,
  Title,
  Stack,
  Group,
  BackgroundImage,
  Overlay,
} from "@mantine/core";
import type { YooptaContentValue } from "@yoopta/editor";

import { Render } from "~/components/editor/render";
import type { NavGroup } from "~/components/navItems";
import { getCourseBySlugForUser } from "~/models/course.server";
import { requireUserId } from "~/services/auth.server";
import { formatDate } from "~/utils/formatDate";

import type { Route } from "../courses/+types/detail";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.slug;
  const course = await getCourseBySlugForUser(courseSlug, userId);

  if (!course) {
    return new Response(null, { status: 404 });
  }

  const sidebarData: NavGroup[] = course.sections.map((section) => ({
    icon: "book",
    label: section.name,
    items: section.lectures.map((lecture) => ({
      title: lecture.name,
      link: `/courses/${course.slug}/${section.slug}/${lecture.slug}`,
    })),
  }));

  return { course, sidebarData };
}

export default function CourseDetail({ loaderData }: Route.ComponentProps) {
  const { course } = loaderData;

  if (!course) {
    return (
      <Container py="xl">
        <Text c="dimmed" ta="center">
          コースが見つかりません
        </Text>
      </Container>
    );
  }

  return (
    <Container size="95%" py="md">
      {course.cover?.url ? (
        <Box h={400} pos="relative" mb="xl">
          <BackgroundImage
            src={course.cover!.url}
            h="100%"
            radius="md"
            style={{ overflow: "hidden" }}
          >
            <Overlay
              gradient="linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)"
              zIndex={1}
              radius="md"
            />

            <Stack
              h="100%"
              justify="flex-end"
              p="xl"
              pos="relative"
              style={{ zIndex: 2 }}
            >
              <Title
                order={1}
                c="white"
                style={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  lineHeight: 1.2,
                }}
              >
                {course.name}
              </Title>

              <Group gap="md">
                <Text
                  size="sm"
                  c="white"
                  fw={500}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                >
                  作成日: {formatDate(new Date(course.createdAt))}
                </Text>
                <Text
                  size="sm"
                  c="white"
                  fw={500}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                >
                  更新日: {formatDate(new Date(course.updatedAt))}
                </Text>
              </Group>
            </Stack>
          </BackgroundImage>
        </Box>
      ) : (
        <Group justify="space-between" align="flex-end" mb="xl">
          <Title order={1}>{course.name}</Title>
          <Stack gap={0} align="flex-end">
            <Text size="sm" c="dimmed">
              作成日: {formatDate(new Date(course.createdAt))}
            </Text>
            <Text size="sm" c="dimmed">
              更新日: {formatDate(new Date(course.updatedAt))}
            </Text>
          </Stack>
        </Group>
      )}

      {course.description && (
        <Render
          content={JSON.parse(course.description ?? "") as YooptaContentValue}
        />
      )}
    </Container>
  );
}
