import {
  DndContext,
  closestCenter,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Group, Title, Text, Button, Stack } from "@mantine/core";
import { Plus } from "lucide-react";

import { ItemOverlay } from "~/components/curriculum/itemOverlay";
import { SortableSection } from "~/components/curriculum/sortableSection";
import { useCurriculumDnd } from "~/hooks/useCurriculumDnd";
import {
  canEditCourseBySlug,
  getCourseBySlug,
  getCourseBySlugWithCurriculum,
} from "~/models/course.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "../../coursesAdmin/edit/+types/curriculum";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.5" } },
  }),
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const slug = params.slug;

  const canEdit = await canEditCourseBySlug(slug, user.id);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }

  const course = await getCourseBySlugWithCurriculum(slug);
  if (!course) {
    throw new Response("Not Found", { status: 404 });
  }

  const sidebarData = [
    {
      icon: "link",
      label: "リンク",
      items: [
        { title: "トップ", link: "/courses" },
        { title: "コース管理", link: "/courses-admin" },
      ],
    },
  ];

  return { course, sidebarData };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireUser(request);
  const slug = params.slug;

  const canEdit = await canEditCourseBySlug(slug, user.id);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }

  const course = await getCourseBySlug(slug);
  if (!course) {
    throw new Response("Not Found", { status: 404 });
  }
}

export default function CurriculumEditorTab() {
  const {
    sections,
    activeItem,
    sensors,
    sectionIds,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    addSection,
    addLecture,
    addPage,
    deleteSection,
    deleteLecture,
    deletePage,
    renameSection,
    renameLecture,
    renamePage,
  } = useCurriculumDnd();

  return (
    <Box mx="auto">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={4}>カリキュラム構成</Title>
          <Text c="dimmed" size="sm">
            セクション・レクチャー・ページを管理します
          </Text>
        </div>
        <Button
          leftSection={<Plus size={16} />}
          variant="light"
          color="cyan"
          onClick={addSection}
        >
          セクションを追加
        </Button>
      </Group>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Stack gap="md">
          <SortableContext
            items={sectionIds}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onAddLecture={() => addLecture(section.id)}
                onAddPage={addPage}
                onDeleteSection={deleteSection}
                onDeleteLecture={deleteLecture}
                onDeletePage={deletePage}
                onRenameSection={renameSection}
                onRenameLecture={renameLecture}
                onRenamePage={renamePage}
              />
            ))}
          </SortableContext>
        </Stack>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeItem && <ItemOverlay item={activeItem} />}
        </DragOverlay>
      </DndContext>
      <Group justify="flex-end">
        <Button>保存</Button>
      </Group>
    </Box>
  );
}
