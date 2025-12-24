import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState, useMemo } from "react";

export type PageItem = {
  id: string;
  name: string;
  slug: string;
  order: number;
  isOpen: boolean;
  lectureId: string;
};

export type LectureItem = {
  id: string;
  name: string;
  slug: string;
  order: number;
  isOpen: boolean;
  sectionId: string;
  pages: PageItem[];
};

export type SectionItem = {
  id: string;
  name: string;
  order: number;
  lectures: LectureItem[];
};

export function useCurriculumDnd(initialSections: SectionItem[] = []) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);

  const [activeItem, setActiveItem] = useState<
    SectionItem | LectureItem | PageItem | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  // --- Helpers ---
  function findSection(id: string): SectionItem | undefined {
    return sections.find((s) => s.id === id);
  }

  function findLecture(
    id: string,
  ): { lecture: LectureItem; parentSection: SectionItem } | undefined {
    for (const sec of sections) {
      const lecture = sec.lectures.find((l) => l.id === id);
      if (lecture) return { lecture, parentSection: sec };
    }
    return undefined;
  }

  function findPageContainer(
    id: string,
  ): { lecture: LectureItem; parentSection: SectionItem } | undefined {
    for (const sec of sections) {
      for (const lec of sec.lectures) {
        if (lec.pages.some((p) => p.id === id)) {
          return { lecture: lec, parentSection: sec };
        }
      }
    }
    return undefined;
  }

  function normalizeOrders(sections: SectionItem[]): SectionItem[] {
    return sections.map((sec, secIndex) => ({
      ...sec,
      order: secIndex,
      lectures: sec.lectures.map((lec, lecIndex) => ({
        ...lec,
        order: lecIndex,
        pages: lec.pages.map((page, pageIndex) => ({
          ...page,
          order: pageIndex,
        })),
      })),
    }));
  }

  // --- Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    const activeData = active.data.current;
    if (activeData) {
      if (activeData.type === "section") setActiveItem(activeData.section);
      if (activeData.type === "lecture") setActiveItem(activeData.lecture);
      if (activeData.type === "page") setActiveItem(activeData.page);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (!activeType || !overType) return;

    // Page Logic
    if (activeType === "page") {
      if (overType === "page") {
        const activeContainer = findPageContainer(active.id as string);
        const overContainer = findPageContainer(over.id as string);

        if (
          activeContainer &&
          overContainer &&
          activeContainer.lecture.id !== overContainer.lecture.id
        ) {
          setSections((prev) => {
            const newSections = JSON.parse(
              JSON.stringify(prev),
            ) as SectionItem[];
            const srcSec = newSections.find(
              (s) => s.id === activeContainer.parentSection.id,
            );
            const srcLec = srcSec?.lectures.find(
              (l) => l.id === activeContainer.lecture.id,
            );
            const activePageIndex = srcLec?.pages.findIndex(
              (p) => p.id === active.id,
            );

            if (
              !srcLec ||
              activePageIndex === undefined ||
              activePageIndex === -1
            )
              return prev;
            const [movedPage] = srcLec.pages.splice(activePageIndex, 1);

            const destSec = newSections.find(
              (s) => s.id === overContainer.parentSection.id,
            );
            const destLec = destSec?.lectures.find(
              (l) => l.id === overContainer.lecture.id,
            );
            const overPageIndex = destLec?.pages.findIndex(
              (p) => p.id === over.id,
            );

            if (!destLec || overPageIndex === undefined) return prev;

            let newIndex = overPageIndex;
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height;
            const modifier = isBelowOverItem ? 1 : 0;
            newIndex =
              newIndex >= 0 ? newIndex + modifier : destLec.pages.length + 1;

            movedPage.lectureId = destLec.id;
            destLec.pages.splice(newIndex, 0, movedPage);
            return newSections;
          });
        }
      }

      if (overType === "lecture") {
        const activeContainer = findPageContainer(active.id as string);
        const overLectureInfo = findLecture(over.id as string);

        if (
          activeContainer &&
          overLectureInfo &&
          activeContainer.lecture.id !== overLectureInfo.lecture.id
        ) {
          setSections((prev) => {
            const newSections = JSON.parse(
              JSON.stringify(prev),
            ) as SectionItem[];
            const srcSec = newSections.find(
              (s) => s.id === activeContainer.parentSection.id,
            );
            const srcLec = srcSec?.lectures.find(
              (l) => l.id === activeContainer.lecture.id,
            );
            const activePageIndex = srcLec?.pages.findIndex(
              (p) => p.id === active.id,
            );

            if (
              !srcLec ||
              activePageIndex === undefined ||
              activePageIndex === -1
            )
              return prev;
            const [movedPage] = srcLec.pages.splice(activePageIndex, 1);

            const destSec = newSections.find(
              (s) => s.id === overLectureInfo.parentSection.id,
            );
            const destLec = destSec?.lectures.find(
              (l) => l.id === overLectureInfo.lecture.id,
            );

            if (!destLec) return prev;

            movedPage.lectureId = destLec.id;
            destLec.pages.push(movedPage);
            return newSections;
          });
        }
      }
    }

    // Lecture Logic
    if (activeType === "lecture") {
      if (overType === "lecture") {
        const activeInfo = findLecture(active.id as string);
        const overInfo = findLecture(over.id as string);

        if (
          activeInfo &&
          overInfo &&
          activeInfo.parentSection.id !== overInfo.parentSection.id
        ) {
          setSections((prev) => {
            const newSections = JSON.parse(
              JSON.stringify(prev),
            ) as SectionItem[];
            const srcSec = newSections.find(
              (s) => s.id === activeInfo.parentSection.id,
            );
            const srcIndex = srcSec?.lectures.findIndex(
              (l) => l.id === active.id,
            );
            if (!srcSec || srcIndex === undefined || srcIndex === -1)
              return prev;
            const [movedLec] = srcSec.lectures.splice(srcIndex, 1);

            const destSec = newSections.find(
              (s) => s.id === overInfo.parentSection.id,
            );
            const destIndex = destSec?.lectures.findIndex(
              (l) => l.id === over.id,
            );
            if (!destSec || destIndex === undefined) return prev;

            let newIndex = destIndex;
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height;
            const modifier = isBelowOverItem ? 1 : 0;
            newIndex =
              newIndex >= 0 ? newIndex + modifier : destSec.lectures.length + 1;

            movedLec.sectionId = destSec.id;
            destSec.lectures.splice(newIndex, 0, movedLec);
            return newSections;
          });
        }
      }

      if (overType === "section") {
        const activeInfo = findLecture(active.id as string);
        const overSec = findSection(over.id as string);

        if (
          activeInfo &&
          overSec &&
          activeInfo.parentSection.id !== overSec.id
        ) {
          setSections((prev) => {
            const newSections = JSON.parse(
              JSON.stringify(prev),
            ) as SectionItem[];
            const srcSec = newSections.find(
              (s) => s.id === activeInfo.parentSection.id,
            );
            const srcIndex = srcSec?.lectures.findIndex(
              (l) => l.id === active.id,
            );
            if (!srcSec || srcIndex === undefined || srcIndex === -1)
              return prev;
            const [movedLec] = srcSec.lectures.splice(srcIndex, 1);

            const destSec = newSections.find((s) => s.id === overSec.id);
            if (!destSec) return prev;

            movedLec.sectionId = destSec.id;
            destSec.lectures.push(movedLec);
            return newSections;
          });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Section Sort
    if (activeType === "section" && overType === "section") {
      setSections((items) => {
        const oldIndex = items.findIndex((s) => s.id === active.id);
        const newIndex = items.findIndex((s) => s.id === over.id);
        return normalizeOrders(arrayMove(items, oldIndex, newIndex));
      });
    }

    // Lecture Sort
    if (activeType === "lecture" && overType === "lecture") {
      const activeInfo = findLecture(active.id as string);
      const overInfo = findLecture(over.id as string);

      if (
        activeInfo &&
        overInfo &&
        activeInfo.parentSection.id === overInfo.parentSection.id
      ) {
        setSections((prev) => {
          const newSections = [...prev];
          const secIndex = newSections.findIndex(
            (s) => s.id === activeInfo.parentSection.id,
          );
          const lectures = newSections[secIndex].lectures;
          const oldIndex = lectures.findIndex((l) => l.id === active.id);
          const newIndex = lectures.findIndex((l) => l.id === over.id);
          newSections[secIndex] = {
            ...newSections[secIndex],
            lectures: arrayMove(lectures, oldIndex, newIndex),
          };
          return normalizeOrders(newSections);
        });
      }
    }

    // Page Sort
    if (activeType === "page" && overType === "page") {
      const activeContainer = findPageContainer(active.id as string);
      const overContainer = findPageContainer(over.id as string);

      if (
        activeContainer &&
        overContainer &&
        activeContainer.lecture.id === overContainer.lecture.id
      ) {
        setSections((prev) => {
          const newSections = JSON.parse(JSON.stringify(prev)) as SectionItem[];
          const secIndex = newSections.findIndex(
            (s) => s.id === activeContainer.parentSection.id,
          );
          const lecIndex = newSections[secIndex].lectures.findIndex(
            (l) => l.id === activeContainer.lecture.id,
          );

          const pages = newSections[secIndex].lectures[lecIndex].pages;
          const oldIndex = pages.findIndex((p) => p.id === active.id);
          const newIndex = pages.findIndex((p) => p.id === over.id);

          newSections[secIndex].lectures[lecIndex].pages = arrayMove(
            pages,
            oldIndex,
            newIndex,
          );
          return normalizeOrders(newSections);
        });
      }
    }
  };

  const generateId = () => crypto.randomUUID();

  const addSection = () => {
    const newSection: SectionItem = {
      id: `section-${generateId()}`,
      name: "新規セクション",
      order: sections.length,
      lectures: [],
    };
    setSections((prev) => [...prev, newSection]);
  };

  const addLecture = (sectionId: string) => {
    setSections((prev) => {
      return prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newLecture: LectureItem = {
          id: `lecture-${generateId()}`,
          name: "新規レクチャー",
          slug: String(sec.lectures.length),
          order: sec.lectures.length,
          isOpen: true,
          sectionId: sec.id,
          pages: [],
        };
        return { ...sec, lectures: [...sec.lectures, newLecture] };
      });
    });
  };

  const addPage = (lectureId: string) => {
    setSections((prev) => {
      return prev.map((sec) => {
        const targetLectureIndex = sec.lectures.findIndex(
          (l) => l.id === lectureId,
        );
        if (targetLectureIndex === -1) return sec;

        const newLectures = [...sec.lectures];
        const targetLecture = newLectures[targetLectureIndex];

        const newPage: PageItem = {
          id: `page-${generateId()}`,
          name: "新規ページ",
          slug: String(targetLecture.pages.length),
          order: targetLecture.pages.length,
          isOpen: true,
          lectureId: targetLecture.id,
        };

        newLectures[targetLectureIndex] = {
          ...targetLecture,
          pages: [...targetLecture.pages, newPage],
        };

        return { ...sec, lectures: newLectures };
      });
    });
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const deleteLecture = (lectureId: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        lectures: sec.lectures.filter((l) => l.id !== lectureId),
      })),
    );
  };

  const deletePage = (pageId: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        lectures: sec.lectures.map((lec) => ({
          ...lec,
          pages: lec.pages.filter((p) => p.id !== pageId),
        })),
      })),
    );
  };

  const renameSection = (sectionId: string, name: string) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === sectionId ? { ...sec, name } : sec)),
    );
  };

  const renameLecture = (lectureId: string, name: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        lectures: sec.lectures.map((lec) =>
          lec.id === lectureId ? { ...lec, name } : lec,
        ),
      })),
    );
  };

  const renamePage = (pageId: string, name: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        lectures: sec.lectures.map((lec) => ({
          ...lec,
          pages: lec.pages.map((p) => (p.id === pageId ? { ...p, name } : p)),
        })),
      })),
    );
  };

  const reset = (nextSections: SectionItem[]) => {
    setSections(nextSections);
  };

  return {
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
    reset,
  };
}
