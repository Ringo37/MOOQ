import type { Prisma } from "generated/prisma/client";
import { CourseVisibility } from "generated/prisma/enums";
import { prisma } from "~/lib/prisma.server";

export type CourseWithCover = Prisma.CourseGetPayload<{
  include: { cover: true };
}>;

export async function getAllCourses() {
  return prisma.course.findMany({ include: { cover: true } });
}

export async function getAllOwnedCourses(userId: string) {
  return prisma.course.findMany({
    where: { owners: { some: { id: userId } } },
    include: { cover: true },
  });
}

export async function getCoursesForUser(userId: string) {
  return prisma.course.findMany({
    where: {
      OR: [
        { visibility: CourseVisibility.PUBLIC },
        {
          visibility: CourseVisibility.PRIVATE,
          OR: [
            { owners: { some: { id: userId } } },
            { users: { some: { id: userId } } },
          ],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { cover: true },
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({ where: { slug } });
}

export async function createCourse(
  name: string,
  slug: string,
  description: string | null,
  ownerId: string,
  coverId?: string | null,
  visibility = CourseVisibility.UNLISTED,
) {
  return prisma.course.create({
    data: {
      name,
      slug,
      description,
      visibility,
      owners: { connect: { id: ownerId } },
      fileId: coverId,
    },
  });
}
