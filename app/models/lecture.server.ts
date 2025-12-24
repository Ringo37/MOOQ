import { prisma } from "~/lib/prisma.server";

export async function createLecture(
  name: string,
  slug: string,
  sectionId: string,
  order: number,
) {
  return prisma.lecture.create({
    data: {
      name,
      slug,
      sectionId,
      order,
    },
  });
}

export async function upsertLectureById(
  id: string,
  name: string,
  slug: string,
  sectionId: string,
  order: number,
) {
  return prisma.lecture.upsert({
    where: { id },
    update: {
      name,
      slug,
      sectionId,
      order,
    },
    create: {
      id,
      name,
      slug,
      sectionId,
      order,
    },
  });
}
