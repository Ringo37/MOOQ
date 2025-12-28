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
  TextInput,
  Badge,
  Menu,
} from "@mantine/core";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Folder,
  Plus,
  Settings,
  Trash,
  EyeOff,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";

import type { LectureItem } from "~/hooks/useCurriculumDnd";

import { SortablePage } from "./sortablePage";

interface SortableLectureProps {
  lecture: LectureItem;
  courseSlug: string;
  sectionSlug: string;
  onAddPage: () => void;
  onDeleteLecture: (lectureId: string) => void;
  onDeletePage: (pageId: string) => void;
  onRenameLecture: (lectureId: string, name: string, slug: string) => void;
  onRenamePage: (pageId: string, name: string, slug?: string) => void;
  onToggleLectureOpen: (
    lectureId: string,
    isOpen: boolean,
    recursive?: boolean,
  ) => void;
  onTogglePageOpen: (pageId: string, isOpen: boolean) => void;
}

export function SortableLecture({
  lecture,
  courseSlug,
  sectionSlug,
  onAddPage,
  onDeleteLecture,
  onDeletePage,
  onRenameLecture,
  onRenamePage,
  onToggleLectureOpen,
  onTogglePageOpen,
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

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(lecture.name);

  const [slugEditing, setSlugEditing] = useState(false);
  const [slug, setSlug] = useState(lecture.slug);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const pageIds = useMemo(
    () => lecture.pages.map((p) => p.id),
    [lecture.pages],
  );

  const commitNameRename = () => {
    setIsEditing(false);
    if (name.trim() && name !== lecture.name) {
      onRenameLecture(lecture.id, name.trim(), slug);
    } else {
      setName(lecture.name);
    }
  };

  const commitSlugRename = () => {
    setSlugEditing(false);
    if (slug.trim() && slug !== lecture.slug) {
      onRenameLecture(lecture.id, name, slug.trim());
    } else {
      setSlug(lecture.slug);
    }
  };

  return (
    <Paper ref={setNodeRef} style={style} withBorder p={0} radius="md">
      <Box p="sm" style={{ borderRadius: "8px 8px 0 0" }}>
        <Group justify="space-between">
          <Group gap="sm">
            {!isEditing && !slugEditing && (
              <div
                {...attributes}
                {...listeners}
                style={{ cursor: "grab", display: "flex" }}
              >
                <GripVertical size={18} color="#adb5bd" />
              </div>
            )}

            <ActionIcon
              variant="transparent"
              size="sm"
              onClick={() => setOpened(!opened)}
            >
              {opened ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </ActionIcon>

            <Folder size={16} color={lecture.isOpen ? "#40c057" : "gray"} />

            {isEditing ? (
              <TextInput
                size="xs"
                value={name}
                autoFocus
                onChange={(e) => setName(e.currentTarget.value)}
                onBlur={commitNameRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitNameRename();
                  if (e.key === "Escape") {
                    setName(lecture.name);
                    setIsEditing(false);
                  }
                }}
              />
            ) : (
              <Text
                fw={600}
                size="sm"
                onDoubleClick={() => setIsEditing(true)}
                style={{ cursor: "text" }}
              >
                {lecture.name}
              </Text>
            )}

            <Badge
              size="xs"
              color={lecture.isOpen ? "green" : "gray"}
              variant="outline"
            >
              {lecture.isOpen ? "公開" : "非公開"}
            </Badge>

            <Text size="sm">/</Text>
            {slugEditing ? (
              <TextInput
                size="xs"
                value={slug}
                onChange={(e) => setSlug(e.currentTarget.value)}
                onBlur={commitSlugRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitSlugRename();
                  if (e.key === "Escape") {
                    setSlug(lecture.slug);
                    setSlugEditing(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <Text
                size="sm"
                onDoubleClick={() => setSlugEditing(true)}
                style={{ cursor: "text" }}
              >
                {slug}
              </Text>
            )}
          </Group>

          <Group gap="xs">
            <Menu withinPortal position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <Settings size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    lecture.isOpen ? <EyeOff size={14} /> : <Eye size={14} />
                  }
                  onClick={() =>
                    onToggleLectureOpen(lecture.id, !lecture.isOpen)
                  }
                >
                  {lecture.isOpen ? "非公開にする" : "公開する"}
                </Menu.Item>

                <Menu.Item
                  leftSection={
                    lecture.isOpen ? <EyeOff size={14} /> : <Eye size={14} />
                  }
                  onClick={() =>
                    onToggleLectureOpen(lecture.id, !lecture.isOpen, true)
                  }
                >
                  {lecture.isOpen ? "すべて非公開にする" : "すべて公開する"}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
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
                onRenamePage={onRenamePage}
                onTogglePageOpen={onTogglePageOpen}
                courseSlug={courseSlug}
                sectionSlug={sectionSlug}
                lectureSlug={lecture.slug}
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
