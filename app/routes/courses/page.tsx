import {
  Center,
  Container,
  Group,
  Pagination,
  Title,
  Tooltip,
} from "@mantine/core";
import type { YooptaContentValue } from "@yoopta/editor";
import { Link, redirect } from "react-router";

import { ProblemRender } from "~/components/editor/problemRender";
import { Render } from "~/components/editor/render";
import type { NavGroup } from "~/components/navItems";
import { PaginationLink } from "~/components/paginationLink";
import { getAnswersByProblemIds } from "~/models/answer.server";
import { getCourseBySlugForUser } from "~/models/course.server";
import { getLectureBySlugForUser } from "~/models/lecture.server";
import { getPageBySlugForUser } from "~/models/page.server";
import { getSectionBySlugForUser } from "~/models/section.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "./+types/page";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const sectionSlug = params.sectionSlug;
  const lectureSlug = params.lectureSlug;
  const pageSlug = params.pageSlug;

  const course = await getCourseBySlugForUser(courseSlug, userId);
  if (!course) {
    return redirect("/courses");
  }
  const section = await getSectionBySlugForUser(sectionSlug, course.id);
  if (!section) {
    return redirect(`/courses/${courseSlug}`);
  }
  const lecture = await getLectureBySlugForUser(lectureSlug, section.id);
  if (!lecture || !lecture.pages) {
    return redirect(`/courses/${courseSlug}`);
  }
  const page = await getPageBySlugForUser(pageSlug, lecture.id);
  if (!page) {
    return redirect(`/courses/${courseSlug}`);
  }

  const problemIds = page.blocks
    .filter((b) => b.type === "PROBLEM" && b.problemId)
    .map((b) => b.problemId!);
  const answers = await getAnswersByProblemIds(problemIds, userId);

  const sidebarData: NavGroup[] = course.sections.map((section) => ({
    icon: "book",
    label: section.name,
    items: section.lectures.map((lecture) => ({
      title: lecture.name,
      link: `/courses/${course.slug}/${section.slug}/${lecture.slug}`,
    })),
  }));
  return { page, sidebarData, lecture, answers };
}

export default function PageIndex({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { page, lecture, answers } = loaderData;

  const getPageLink = (order: number) => {
    const targetPage = lecture.pages.find((p) => p.order === order);
    if (!targetPage) return "#";
    return `/courses/${params.courseSlug}/${params.sectionSlug}/${params.lectureSlug}/${targetPage.slug}`;
  };

  const getPageName = (order: number) => {
    const targetPage = lecture.pages.find((p) => p.order === order);
    if (!targetPage) return null;
    return targetPage.name;
  };
  return (
    <Container size={"full"}>
      <Title order={3}>{lecture.name}</Title>
      <Center>
        <Pagination.Root
          total={lecture.pages.length}
          value={page.order + 1}
          siblings={3}
          getItemProps={(pageIndex) => ({
            component: PaginationLink,
            to: getPageLink(pageIndex - 1),
            label: getPageName(pageIndex - 1),
          })}
          size="xl"
        >
          <Group gap={7} justify="center">
            <Tooltip
              label={getPageName(page.order - 1)}
              disabled={page.order === 0}
            >
              <Pagination.Previous
                component={Link}
                to={getPageLink(page.order - 1)}
              />
            </Tooltip>
            <Pagination.Items />
            <Tooltip
              label={getPageName(page.order + 1)}
              disabled={page.order === lecture.pages.length - 1}
            >
              <Pagination.Next
                component={Link}
                to={getPageLink(page.order + 1)}
              />
            </Tooltip>
          </Group>
        </Pagination.Root>
      </Center>
      <Title className="pb-3">{page.name}</Title>
      {page.blocks.map((block) => {
        // CONTENT ブロック
        if (block.type === "CONTENT") {
          return (
            <Render
              key={block.id}
              content={JSON.parse(block.content || "{}") as YooptaContentValue}
            />
          );
        }
        // PROBLEM ブロック
        if (block.type === "PROBLEM") {
          return (
            <div key={block.id}>
              <ProblemRender
                problem={block.problem}
                cover={
                  block.content
                    ? (JSON.parse(block.content) as YooptaContentValue)
                    : null
                }
                answers={answers}
              />
            </div>
          );
        }
        return null;
      })}
    </Container>
  );
}
