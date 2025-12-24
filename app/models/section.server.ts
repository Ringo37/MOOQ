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
