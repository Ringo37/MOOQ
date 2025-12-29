import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Container,
  Divider,
  Group,
  Title,
  Paper,
  Text,
  Menu,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Edit, GripVertical, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useFetcher, useBlocker } from "react-router";

import { savePageBlocks, type SubmittedBlock } from "~/models/block.server";
import { canEditCourseBySlug, getCourseBySlug } from "~/models/course.server";
import { getLectureBySlug } from "~/models/lecture.server";
import { getPageBySlug } from "~/models/page.server";
import { getSectionBySlug } from "~/models/section.server";
import { requireUserId } from "~/services/auth.server";

import type { Route } from "./+types/page";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const sectionSlug = params.sectionSlug;
  const lectureSlug = params.lectureSlug;
  const pageSlug = params.pageSlug;
  const canEdit = await canEditCourseBySlug(courseSlug, userId);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }

  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    throw new Response("Not Found", { status: 404 });
  }
  const section = await getSectionBySlug(sectionSlug, course.id);
  if (!section) {
    throw new Response("Not Found", { status: 404 });
  }
  const lecture = await getLectureBySlug(lectureSlug, section.id);
  if (!lecture) {
    throw new Response("Not Found", { status: 404 });
  }
  const page = await getPageBySlug(pageSlug, lecture.id);
  if (!page) {
    throw new Response("Not Found", { status: 404 });
  }
  return { page };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const courseSlug = params.courseSlug;
  const canEdit = await canEditCourseBySlug(courseSlug, userId);
  if (!canEdit) {
    throw new Response("Forbidden", { status: 403 });
  }
  const formData = await request.formData();

  const pageId = formData.get("pageId") as string;
  const blocksJson = formData.get("blocks") as string;
  const submittedBlocks = JSON.parse(blocksJson) as SubmittedBlock[];
  await savePageBlocks(pageId, submittedBlocks);
  return { success: true };
}

interface SortableBlockProps {
  block: { id: string; type: string; content: string | null };
  onDelete: (id: string) => void;
}

function SortableBlock({ block, onDelete }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: "10px",
    position: "relative",
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      withBorder
      p="sm"
      shadow={isDragging ? "lg" : "xs"}
      bg={isDragging ? "var(--mantine-color-gray-0)" : undefined}
    >
      <Group align="center" wrap="nowrap">
        <div
          {...attributes}
          {...listeners}
          style={{ cursor: "grab", display: "flex", alignItems: "center" }}
        >
          <GripVertical size={18} color="gray" />
        </div>

        <div style={{ flex: 1 }}>
          <Group mb={4}>
            <Badge color={block.type === "PROBLEM" ? "orange" : "blue"}>
              {block.type}
            </Badge>
            <Text size="xs" c="dimmed">
              ID: {block.id.startsWith("temp-") ? "New" : block.id}
            </Text>
          </Group>
        </div>
        <Link to={block.id}>
          <ActionIcon color="blue" variant="subtle" aria-label="Edit block">
            <Edit size={18} />
          </ActionIcon>
        </Link>

        <ActionIcon
          color="red"
          variant="subtle"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block.id);
          }}
          aria-label="Delete block"
        >
          <Trash size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}

export default function CoursesAdminPageIndex({
  params,
  loaderData,
}: Route.ComponentProps) {
  const { page } = loaderData;
  const fetcher = useFetcher();

  const [blocks, setBlocks] = useState(page.blocks);
  const [isDirty, setIsDirty] = useState(false);

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setBlocks(page.blocks);
      setIsDirty(false);
    } else if (!isDirty) {
      setBlocks(page.blocks);
    }
  }, [page.blocks, fetcher.state, fetcher.data]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      notifications.show({
        title: "保存しました",
        message: "ページの更新が完了しました",
        color: "green",
        position: "top-right",
        autoClose: 2000,
      });
    }
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "保存されていない変更があります。移動してもよろしいですか？",
      );
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    const newBlocks = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(newBlocks);
    setIsDirty(true);
  };

  const handleAddBlock = (type: "CONTENT" | "PROBLEM") => {
    const tempId = `temp-${crypto.randomUUID()}`;
    const newBlock = {
      id: tempId,
      type: type,
      content: "",
      pageId: page.id,
      order: blocks.length,
      problemId: null,
      problem: null,
    };

    setBlocks([...blocks, newBlock]);
    setIsDirty(true);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!confirm("本当にこのブロックを削除しますか？")) return;

    setBlocks((currentBlocks) => currentBlocks.filter((b) => b.id !== blockId));
    setIsDirty(true);
  };

  const handleSave = () => {
    fetcher.submit(
      {
        pageId: page.id,
        blocks: JSON.stringify(blocks),
      },
      { method: "post" },
    );
  };

  return (
    <Container size="full" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>ページ編集 : {page?.name}</Title>
        <Group>
          <Button onClick={handleSave}>保存</Button>
          <Link to={`/courses-admin/${params.courseSlug}/curriculum`}>
            <Button color="green">カリキュラム編集</Button>
          </Link>
        </Group>
      </Group>
      <Divider mb="md" />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onDelete={handleDeleteBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Paper p="md" withBorder style={{ borderStyle: "dashed" }} mt="md">
        <Group justify="center">
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button leftSection={<Plus size={14} />} variant="light">
                ブロックを追加
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>種類を選択</Menu.Label>
              <Menu.Item onClick={() => handleAddBlock("CONTENT")}>
                コンテンツ (文章)
              </Menu.Item>
              <Menu.Item onClick={() => handleAddBlock("PROBLEM")}>
                問題
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Paper>
    </Container>
  );
}
