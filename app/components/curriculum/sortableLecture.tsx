import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Paper,
  Box,
  Group,
  ActionIcon,
  Text,
  Collapse,
  Stack,
  Button,
} from "@mantine/core";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Folder,
  Plus,
  Settings,
  Trash,
} from "lucide-react";
import { useState, useMemo } from "react";

import type { LectureItem } from "~/hooks/useCurriculumDnd";

import { SortablePage } from "./sortablePage";

interface SortableLectureProps {
  lecture: LectureItem;
  onAddPage: () => void;
  onDeleteLecture: (lectureId: string) => void;
  onDeletePage: (pageId: string) => void;
}

export function SortableLecture({
  lecture,
  onAddPage,
  onDeleteLecture,
  onDeletePage,
}: SortableLectureProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lecture.id,
    data: { type: "lecture", lecture },
  });

  const [opened, setOpened] = useState(true);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const pageIds = useMemo(
    () => lecture.pages.map((p) => p.id),
    [lecture.pages],
  );

  return (
    <Paper ref={setNodeRef} style={style} withBorder p={0} radius="md">
      <Box p="sm" style={{ borderRadius: "8px 8px 0 0" }}>
        <Group justify="space-between">
          <Group gap="sm">
            <div
              {...attributes}
              {...listeners}
              style={{ cursor: "grab", display: "flex" }}
            >
              <GripVertical size={18} color="#adb5bd" />
            </div>
            <ActionIcon
              variant="transparent"
              size="sm"
              onClick={() => setOpened(!opened)}
            >
              {opened ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </ActionIcon>
            <Folder size={16} color="#40c057" />
            <Text fw={600} size="sm">
              {lecture.name}
            </Text>
          </Group>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray">
              <Settings size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onDeleteLecture(lecture.id)}
            >
              <Trash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      <Collapse in={opened}>
        <Stack gap="xs" p="xs" pt={0} style={{ borderRadius: "0 0 8px 8px" }}>
          <SortableContext
            items={pageIds}
            strategy={verticalListSortingStrategy}
          >
            {lecture.pages.map((page) => (
              <SortablePage
                key={page.id}
                page={page}
                onDeletePage={onDeletePage}
              />
            ))}
          </SortableContext>
          {lecture.pages.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="xs">
              ページがありません
            </Text>
          )}
          <Button
            variant="subtle"
            size="xs"
            leftSection={<Plus size={14} />}
            justify="start"
            color="green"
            fullWidth
            onClick={onAddPage}
          >
            ページを追加
          </Button>
        </Stack>
      </Collapse>
    </Paper>
  );
}
