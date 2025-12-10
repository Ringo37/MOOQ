import { Container, Grid, Skeleton, Button, Group, Title } from "@mantine/core";
import { Filter } from "lucide-react";

const child = <Skeleton height={140} radius="md" animate={false} />;

export default function CoursesIndex() {
  return (
    <Container fluid>
      <Group justify="space-between" mb="md">
        <Title order={2}>コース一覧</Title>
        <Button variant="outline" leftSection={<Filter size={16} />}>
          絞り込み
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>{child}</Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>{child}</Grid.Col>
      </Grid>
    </Container>
  );
}
