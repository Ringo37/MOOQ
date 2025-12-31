import { prisma } from "~/lib/prisma.server";

export async function getProblemById(id: string) {
  return prisma.problem.findUnique({
    where: { id },
  });
}
