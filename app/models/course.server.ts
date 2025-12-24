import type { Prisma } from "generated/prisma/client";
import { CourseVisibility } from "generated/prisma/enums";
import { prisma } from "~/lib/prisma.server";

export type CourseWithCover = Prisma.CourseGetPayload<{
  include: { cover: true };
}>;

export type CourseWithCurriculum = Prisma.CourseGetPayload<{
  include: {
    cover: true;
    sections: {
      include: {
        lectures: { include: { pages: true } };
      };
    };
  };
}>;

export async function getAllCourses() {
  return prisma.course.findMany({
    include: { cover: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAllOwnedCourses(userId: string) {
  return prisma.course.findMany({
    where: { owners: { some: { id: userId } } },
    include: { cover: true },
    orderBy: { updatedAt: "desc" },
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
    orderBy: { updatedAt: "desc" },
    include: { cover: true },
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: { cover: true },
  });
}

export async function getCourseBySlugWithCurriculum(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      cover: true,
      sections: {
        include: {
          lectures: { include: { pages: true } },
        },
      },
    },
  });
}

export async function getCourseBySlugForUser(slug: string, userId: string) {
  return prisma.course.findFirst({
    where: {
      slug,
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
    include: { cover: true },
  });
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

export async function updateCourse(
  originalSlug: string,
  name: string,
  slug: string,
  description: string | null,
  coverId?: string | null,
  visibility: CourseVisibility = CourseVisibility.UNLISTED,
) {
  return prisma.course.update({
    where: { slug: originalSlug },
    data: {
      name,
      slug,
      description,
      visibility,
      ...(coverId !== undefined && {
        fileId: coverId,
      }),
    },
  });
}

export async function canEditCourse(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      owners: {
        where: { id: userId },
        select: { id: true },
      },
    },
  });

  if (!course) return false;

  return course.owners.length > 0;
}

export async function canEditCourseBySlug(slug: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      owners: {
        where: { id: userId },
        select: { id: true },
      },
    },
  });

  return !!course && course.owners.length > 0;
}
