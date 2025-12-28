import type { SectionItem } from "~/hooks/useCurriculumDnd";
import { prisma } from "~/lib/prisma.server";

export async function createSection(
  name: string,
  slug: string,
  courseId: string,
  order: number,
) {
  return prisma.section.create({
    data: {
      name,
      slug,
      courseId,
      order,
    },
  });
}

export async function upsertSectionById(
  id: string,
  name: string,
  slug: string,
  courseId: string,
  order: number,
) {
  return prisma.section.upsert({
    where: { id },
    update: {
      name,
      slug,
      courseId,
      order,
    },
    create: {
      id,
      name,
      slug,
      courseId,
      order,
    },
  });
}

export async function upsertSectionTree(
  sections: SectionItem[],
  courseId: string,
) {
  return prisma.$transaction(async (tx) => {
    const keepSectionIds = sections
      .map((s) => s.id)
      .filter((id): id is string => !!id);

    const keepLectureIds = sections
      .flatMap((s) => s.lectures)
      .map((l) => l.id)
      .filter((id): id is string => !!id);

    const keepPageIds = sections
      .flatMap((s) => s.lectures)
      .flatMap((l) => l.pages)
      .map((p) => p.id)
      .filter((id): id is string => !!id);

    await tx.page.deleteMany({
      where: {
        lecture: {
          section: { courseId: courseId },
        },
        id: { notIn: keepPageIds },
      },
    });

    await tx.lecture.deleteMany({
      where: {
        section: { courseId: courseId },
        id: { notIn: keepLectureIds },
      },
    });

    await tx.section.deleteMany({
      where: {
        courseId: courseId,
        id: { notIn: keepSectionIds },
      },
    });

    for (const section of sections) {
      // Section
      if (section.id) {
        await tx.section.upsert({
          where: { id: section.id },
          update: {
            name: section.name,
            slug: section.slug,
            order: section.order,
            isOpen: section.isOpen,
          },
          create: {
            id: section.id,
            name: section.name,
            slug: section.slug,
            order: section.order,
            isOpen: section.isOpen,
            courseId,
          },
        });
      } else {
        const createdSection = await tx.section.create({
          data: {
            name: section.name,
            slug: section.slug,
            order: section.order,
            isOpen: section.isOpen,
            courseId,
          },
        });

        section.id = createdSection.id;
      }

      // Lecture
      for (const lecture of section.lectures) {
        if (lecture.id) {
          await tx.lecture.upsert({
            where: { id: lecture.id },
            update: {
              name: lecture.name,
              slug: lecture.slug,
              order: lecture.order,
              isOpen: lecture.isOpen,
              sectionId: section.id,
            },
            create: {
              id: lecture.id,
              name: lecture.name,
              slug: lecture.slug,
              order: lecture.order,
              isOpen: lecture.isOpen,
              sectionId: section.id,
            },
          });
        } else {
          const createdLecture = await tx.lecture.create({
            data: {
              name: lecture.name,
              slug: lecture.slug,
              order: lecture.order,
              isOpen: lecture.isOpen,
              sectionId: section.id,
            },
          });

          lecture.id = createdLecture.id;
        }

        // Page
        for (const page of lecture.pages) {
          if (page.id) {
            await tx.page.upsert({
              where: { id: page.id },
              update: {
                name: page.name,
                slug: page.slug,
                order: page.order,
                isOpen: page.isOpen,
                lectureId: lecture.id,
              },
              create: {
                id: page.id,
                name: page.name,
                slug: page.slug,
                order: page.order,
                isOpen: page.isOpen,
                lectureId: lecture.id,
              },
            });
          } else {
            await tx.page.create({
              data: {
                name: page.name,
                slug: page.slug,
                order: page.order,
                isOpen: page.isOpen,
                lectureId: lecture.id,
              },
            });
          }
        }
      }
    }
  });
}
