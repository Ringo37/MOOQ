import { prisma } from "~/lib/prisma.server";

export async function upsertAnswerField(problemId: string, name: string) {
  return prisma.answerField.upsert({
    where: {
      problemId_name: { problemId, name },
    },
    update: {},
    create: {
      problemId,
      name,
    },
  });
}

export async function upsertAnswerFields(problemId: string, names: string[]) {
  return prisma.$transaction(
    names.map((name) =>
      prisma.answerField.upsert({
        where: {
          problemId_name: { problemId, name },
        },
        update: {},
        create: {
          problemId,
          name,
        },
      }),
    ),
  );
}
