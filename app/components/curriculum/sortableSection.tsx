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
  Text,
  ActionIcon,
  Stack,
  Button,
} from "@mantine/core";
import { GripVertical, Layers, Settings, Trash, Plus } from "lucide-react";
import { useMemo } from "react";

import type { SectionItem } from "~/hooks/useCurriculumDnd";

import { SortableLecture } from "./sortableLecture";

interface SortableSectionProps {
  section: SectionItem;
  onAddLecture: () => void;
  onAddPage: (lectureId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteLecture: (lectureId: string) => void;
  onDeletePage: (pageId: string) => void;
}

export function SortableSection({
  section,
  onAddLecture,
  onAddPage,
  onDeleteSection,
  onDeleteLecture,
  onDeletePage,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { type: "section", section },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const lectureIds = useMemo(
    () => section.lectures.map((l) => l.id),
    [section.lectures],
  );

  return (
    <Paper ref={setNodeRef} style={style} withBorder p={0} radius="md" mb="sm">
      <Box
        p="md"
        style={{
          borderBottom: "1px solid #e9ecef",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Group justify="space-between">
          <Group gap="xs">
            <div
              {...attributes}
              {...listeners}
              style={{ cursor: "grab", display: "flex" }}
            >
              <GripVertical size={20} color="#868e96" />
            </div>
            <Layers size={18} color="#228be6" />
            <Text fw={700} size="lg">
              {section.name}
            </Text>
          </Group>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray">
              <Settings size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onDeleteSection(section.id)}
            >
              <Trash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      <Stack gap="sm" p="md">
        <SortableContext
          items={lectureIds}
          strategy={verticalListSortingStrategy}
        >
          {section.lectures.map((lecture) => (
            <SortableLecture
              key={lecture.id}
              lecture={lecture}
              onAddPage={() => onAddPage(lecture.id)}
              onDeleteLecture={onDeleteLecture}
              onDeletePage={onDeletePage}
            />
          ))}
        </SortableContext>

        <Button
          variant="subtle"
          size="sm"
          leftSection={<Plus size={14} />}
          justify="start"
          color="blue"
          onClick={onAddLecture}
        >
          レクチャーを追加
        </Button>
      </Stack>
    </Paper>
  );
}
