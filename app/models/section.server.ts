import type { SectionItem } from "~/hooks/useCurriculumDnd";
import { prisma } from "~/lib/prisma.server";

export async function createSection(
  name: string,
  courseId: string,
  order: number,
) {
  return prisma.section.create({
    data: {
      name,
      courseId,
      order,
    },
  });
}

export async function upsertSectionById(
  id: string,
  name: string,
  courseId: string,
  order: number,
) {
  return prisma.section.upsert({
    where: { id },
    update: {
      name,
      courseId,
      order,
    },
    create: {
      id,
      name,
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
    for (const section of sections) {
      // =========================
      // Section
      // =========================
      if (section.id) {
        await tx.section.upsert({
          where: { id: section.id },
          update: {
            name: section.name,
            order: section.order,
          },
          create: {
            id: section.id,
            name: section.name,
            order: section.order,
            courseId,
          },
        });
      } else {
        const createdSection = await tx.section.create({
          data: {
            name: section.name,
            order: section.order,
            courseId,
          },
        });

        section.id = createdSection.id; // ★ lecture 用
      }

      // =========================
      // Lecture
      // =========================
      for (const lecture of section.lectures) {
        if (lecture.id) {
          await tx.lecture.upsert({
            where: { id: lecture.id },
            update: {
              name: lecture.name,
              slug: lecture.slug,
              order: lecture.order,
              sectionId: section.id,
            },
            create: {
              id: lecture.id,
              name: lecture.name,
              slug: lecture.slug,
              order: lecture.order,
              sectionId: section.id,
            },
          });
        } else {
          const createdLecture = await tx.lecture.create({
            data: {
              name: lecture.name,
              slug: lecture.slug,
              order: lecture.order,
              sectionId: section.id,
            },
          });

          lecture.id = createdLecture.id; // ★ page 用
        }

        // =========================
        // Page
        // =========================
        for (const page of lecture.pages) {
          if (page.id) {
            await tx.page.upsert({
              where: { id: page.id },
              update: {
                name: page.name,
                slug: page.slug,
                order: page.order,
                lectureId: lecture.id,
              },
              create: {
                id: page.id,
                name: page.name,
                slug: page.slug,
                order: page.order,
                lectureId: lecture.id,
              },
            });
          } else {
            await tx.page.create({
              data: {
                name: page.name,
                slug: page.slug,
                order: page.order,
                lectureId: lecture.id,
              },
            });
          }
        }
      }
    }
  });
}
