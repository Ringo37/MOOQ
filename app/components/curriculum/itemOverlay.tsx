import { Paper, Group, Text, ThemeIcon } from "@mantine/core";
import { Layers, Folder, FileText } from "lucide-react";

import type {
  SectionItem,
  LectureItem,
  PageItem,
} from "~/hooks/useCurriculumDnd";

// eslint-disable-next-line
function isSection(item: any): item is SectionItem {
  return "lectures" in item;
}
// eslint-disable-next-line
function isLecture(item: any): item is LectureItem {
  return "pages" in item && !("lectures" in item);
}

export function ItemOverlay({
  item,
}: {
  item: SectionItem | LectureItem | PageItem;
}) {
  if (isSection(item)) {
    return (
      <Paper
        withBorder
        p="md"
        radius="md"
        bg="white"
        shadow="lg"
        style={{ width: 400 }}
      >
        <Group gap="xs">
          <Layers size={18} color="#228be6" />
          <Text fw={700} size="lg">
            {item.name}
          </Text>
        </Group>
      </Paper>
    );
  }
  if (isLecture(item)) {
    return (
      <Paper
        withBorder
        p="sm"
        radius="md"
        bg="white"
        shadow="lg"
        style={{ width: 350 }}
      >
        <Group gap="sm">
          <Folder size={16} color="#40c057" />
          <Text fw={600} size="sm">
            {item.name}
          </Text>
        </Group>
      </Paper>
    );
  }
  // Page
  return (
    <Paper
      withBorder
      p="xs"
      radius="sm"
      bg="white"
      shadow="lg"
      style={{ width: 300 }}
    >
      <Group gap="sm">
        <ThemeIcon size="sm" variant="light" color="cyan">
          <FileText size={12} />
        </ThemeIcon>
        <Text size="sm">{item.name}</Text>
      </Group>
    </Paper>
  );
}
