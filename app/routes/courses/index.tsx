import { Container, Grid, Button, Group, Title } from "@mantine/core";
import { Filter } from "lucide-react";

import { CourseCard } from "~/components/courseCard";
import { getCoursesForUser } from "~/models/course.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "../courses/+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const courses = await getCoursesForUser(user.id);

  const links = [{ title: "トップ", link: "/courses" }];
  if (user.role === "ADMIN" || user.role === "EDITOR") {
    links.push({ title: "コース管理", link: "/courses-admin" });
  }
  if (user.role === "ADMIN") {
    links.push({ title: "管理画面", link: "/admin" });
  }
  const sidebarData = [
    {
      icon: "link",
      label: "リンク",
      items: links,
    },
  ];
  return { courses, sidebarData };
}

export default function CoursesIndex({ loaderData }: Route.ComponentProps) {
  return (
    <Container fluid>
      <Group justify="space-between" mb="md">
        <Title order={2}>コース一覧</Title>
        <Button variant="outline" leftSection={<Filter size={16} />}>
          絞り込み
        </Button>
      </Group>

      <Grid>
        {loaderData.courses.map((course) => (
          <Grid.Col key={course.id} span={{ base: 12, md: 6, lg: 4 }}>
            <CourseCard course={course} />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
