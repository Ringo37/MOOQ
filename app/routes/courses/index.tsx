import { Container, Grid, Button, Group, Title } from "@mantine/core";
import { Filter } from "lucide-react";

import { CourseCard } from "~/components/courseCard";
import { getCoursesForUser } from "~/models/course.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courses = await getCoursesForUser(userId);

  return { courses };
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
