import type { Prisma } from "generated/prisma/client";
import { prisma } from "~/lib/prisma.server";

export async function upsertAnswer(
  answerFieldId: string,
  userId: string,
  answer: string,
  fileId?: string,
) {
  return prisma.answer.upsert({
    where: { answerFieldId_userId: { answerFieldId, userId } },
    update: {
      answer,
      fileId,
    },
    create: {
      userId,
      answerFieldId,
      answer,
      fileId,
    },
  });
}

export type AnswerWithAnswerField = Prisma.AnswerGetPayload<{
  include: { answerField: true; file: true };
}>;

export async function getAnswersByProblemIds(
  problemIds: string[],
  userId: string,
) {
  return prisma.answer.findMany({
    where: { answerField: { problemId: { in: problemIds } }, userId },
    include: { answerField: true, file: true },
  });
}
