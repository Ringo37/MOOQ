import {
  Group,
  Image,
  Stack,
  Text,
  Box,
  Button,
  Card,
  Center,
} from "@mantine/core";
import { ImageIcon } from "lucide-react";
import { Link } from "react-router";

import type { CourseWithCover } from "~/models/course.server";

interface CourseCardProps {
  course: CourseWithCover;
}

export const AdminCourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Group gap="md" align="start" wrap="nowrap">
        <Box flex="0 0 140px">
          {course.cover?.url ? (
            <Image
              src={course.cover.url}
              alt={course.name}
              w={140}
              h={140}
              radius="md"
              fit="cover"
            />
          ) : (
            <Center
              w={140}
              h={140}
              bg="gray.1"
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            >
              <Text size="xs" c="dimmed">
                No Image
              </Text>
              <ImageIcon size={30} color="gray" />
            </Center>
          )}
        </Box>

        <Stack gap="xs" style={{ flex: 1 }}>
          <Text fw={700} size="lg" lineClamp={2}>
            {course.name}
          </Text>

          <Text size="sm" c="dimmed" lineClamp={3} style={{ flex: 1 }}>
            {course.description || "No description provided."}
          </Text>

          <Box>
            <Link to={`/courses-admin/${course.slug}`}>
              <Button variant="light" size="xs">
                編集
              </Button>
            </Link>
          </Box>
        </Stack>
      </Group>
    </Card>
  );
};
