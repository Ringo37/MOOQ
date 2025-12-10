import { Container, Grid, Skeleton, Button, Group, Title } from "@mantine/core";
import { Filter, Plus } from "lucide-react";
import { Link } from "react-router";

const child = <Skeleton height={140} radius="md" animate={false} />;

export default function CoursesAdminIndex() {
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
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, xs: 6, sm: 4, md: 3 }}>{child}</Grid.Col>
      </Grid>
    </Container>
  );
}
