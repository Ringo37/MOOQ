import type { SectionItem } from "~/hooks/useCurriculumDnd";
import type { CourseWithCurriculum } from "~/models/course.server";

export function createInitialSections(
  course: CourseWithCurriculum,
): SectionItem[] {
  return course.sections.map((section) => ({
    id: section.id,
    name: section.name,
    order: section.order,
    lectures: section.lectures.map((lecture) => ({
      id: lecture.id,
      name: lecture.name,
      slug: lecture.slug,
      order: lecture.order,
      sectionId: section.id,
      isOpen: lecture.isOpen,
      pages: lecture.pages.map((page) => ({
        id: page.id,
        name: page.name,
        slug: page.slug,
        order: page.order,
        lectureId: lecture.id,
        isOpen: page.isOpen,
      })),
    })),
  }));
}
