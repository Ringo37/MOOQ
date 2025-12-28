import { prisma } from "~/lib/prisma.server";

export async function createPage(
  name: string,
  slug: string,
  lectureId: string,
  order: number,
) {
  return prisma.page.create({
    data: {
      name,
      slug,
      lectureId,
      order,
    },
  });
}

export async function getPageBySlugForUser(slug: string, lectureId: string) {
  return prisma.page.findUnique({
    where: { lectureId_slug: { lectureId, slug }, isOpen: true },
    include: {
      blocks: { orderBy: { order: "asc" }, include: { problem: true } },
    },
  });
}

export async function getPageBySlug(slug: string, lectureId: string) {
  return prisma.page.findUnique({
    where: { lectureId_slug: { lectureId, slug } },
    include: {
      blocks: { orderBy: { order: "asc" }, include: { problem: true } },
    },
  });
}

export async function upsertPageById(
  id: string,
  name: string,
  slug: string,
  lectureId: string,
  order: number,
) {
  return prisma.page.upsert({
    where: { id },
    update: {
      name,
      slug,
      lectureId,
      order,
    },
    create: {
      id,
      name,
      slug,
      lectureId,
      order,
    },
  });
}
