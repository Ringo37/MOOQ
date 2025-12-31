import { prisma } from "~/lib/prisma.server";

export async function getProblemById(id: string) {
  return prisma.problem.findUnique({
    where: { id },
  });
}

export async function getProblemStatus(id: string) {
  const problem = await prisma.problem.findUnique({
    where: { id },
    select: { status: true },
  });
  return problem?.status;
}
