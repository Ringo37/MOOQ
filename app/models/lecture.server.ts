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

export async function getLectureBySlugForUser(slug: string, sectionId: string) {
  return prisma.lecture.findUnique({
    where: { sectionId_slug: { sectionId, slug }, isOpen: true },
    include: { pages: { where: { isOpen: true }, orderBy: { order: "asc" } } },
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
