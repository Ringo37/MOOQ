import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Paper,
  Group,
  ThemeIcon,
  Text,
  Badge,
  ActionIcon,
  TextInput,
  Menu,
} from "@mantine/core";
import {
  GripVertical,
  FileText,
  Settings,
  Trash,
  EyeOff,
  Eye,
} from "lucide-react";
import { useState } from "react";

import type { PageItem } from "~/hooks/useCurriculumDnd";

interface SortablePageProps {
  page: PageItem;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, name: string, slug?: string) => void;
  onTogglePageOpen: (pageId: string, isOpen: boolean) => void;
}

export function SortablePage({
  page,
  onDeletePage,
  onRenamePage,
  onTogglePageOpen,
}: SortablePageProps) {
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

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(page.name);

  const [slugEditing, setSlugEditing] = useState(false);
  const [slug, setSlug] = useState(page.slug);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const commitNameRename = () => {
    setIsEditing(false);
    if (name.trim() && name !== page.name) {
      onRenamePage(page.id, name.trim(), slug);
    } else {
      setName(page.name);
    }
  };

  const commitSlugRename = () => {
    setSlugEditing(false);
    if (slug.trim() && slug !== page.slug) {
      onRenamePage(page.id, name, slug.trim());
    } else {
      setSlug(page.slug);
    }
  };

  return (
    <Paper ref={setNodeRef} style={style} withBorder p="xs" radius="sm">
      <Group justify="space-between">
        <Group gap="sm">
          {!isEditing && !slugEditing && (
            <div
              {...attributes}
              {...listeners}
              style={{ cursor: "grab", display: "flex", alignItems: "center" }}
            >
              <GripVertical size={16} color="#adb5bd" />
            </div>
          )}

          <ThemeIcon
            size="sm"
            variant="light"
            color={page.isOpen ? "cyan" : "gray"}
          >
            <FileText size={12} />
          </ThemeIcon>

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
                  setName(page.name);
                  setIsEditing(false);
                }
              }}
            />
          ) : (
            <Text
              size="sm"
              onDoubleClick={() => setIsEditing(true)}
              style={{ cursor: "text" }}
            >
              {page.name}
            </Text>
          )}

          <Badge
            size="xs"
            color={page.isOpen ? "green" : "gray"}
            variant="outline"
          >
            {page.isOpen ? "公開" : "非公開"}
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
                  setSlug(page.slug);
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
                  page.isOpen ? <EyeOff size={14} /> : <Eye size={14} />
                }
                onClick={() => onTogglePageOpen(page.id, !page.isOpen)}
              >
                {page.isOpen ? "非公開にする" : "公開する"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
