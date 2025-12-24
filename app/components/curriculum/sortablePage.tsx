import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Paper,
  Group,
  ThemeIcon,
  Text,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { GripVertical, FileText, Settings, Trash } from "lucide-react";

import type { PageItem } from "~/hooks/useCurriculumDnd";

export function SortablePage({
  page,
  onDeletePage,
}: {
  page: PageItem;
  onDeletePage: (pageId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: page.id,
    data: { type: "page", page },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <Paper ref={setNodeRef} style={style} withBorder p="xs" radius="sm">
      <Group justify="space-between">
        <Group gap="sm">
          <div
            {...attributes}
            {...listeners}
            style={{ cursor: "grab", display: "flex", alignItems: "center" }}
          >
            <GripVertical size={16} color="#adb5bd" />
          </div>

          <ThemeIcon
            size="sm"
            variant="light"
            color={page.isOpen ? "cyan" : "gray"}
          >
            <FileText size={12} />
          </ThemeIcon>

          <Text size="sm">{page.name}</Text>

          {!page.isOpen && (
            <Badge size="xs" color="gray" variant="outline">
              非公開
            </Badge>
          )}
        </Group>

        <Group gap="xs">
          <ActionIcon variant="subtle" color="gray">
            <Settings size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDeletePage(page.id)}
          >
            <Trash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}
