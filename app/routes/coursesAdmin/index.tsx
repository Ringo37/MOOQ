import { Container, Grid, Button, Group, Title } from "@mantine/core";
import { Filter, Plus } from "lucide-react";
import { Link } from "react-router";

import { AdminCourseCard } from "~/components/adminCourseCard";
import { getAllOwnedCourses } from "~/models/course.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courses = await getAllOwnedCourses(userId);
  const sidebarData = [
    {
      icon: "link",
      label: "リンク",
      items: [
        { title: "トップ", link: "/courses" },
        { title: "コース管理", link: "/courses-admin" },
      ],
    },
  ];
  return { courses, sidebarData };
}

export default function CoursesAdminIndex({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Container fluid>
      <Title order={2} mb="md">
        コース一覧
      </Title>
      <Group justify="space-between" mb="md">
        <Button variant="outline" leftSection={<Filter size={16} />}>
          絞り込み
        </Button>
        <Link to="/courses-admin/create">
          <Button leftSection={<Plus size={16} />}>コースを追加</Button>
        </Link>
      </Group>

      <Grid>
        {loaderData.courses.map((course) => (
          <Grid.Col key={course.id} span={{ base: 12, md: 6, lg: 4 }}>
            <AdminCourseCard course={course} />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
