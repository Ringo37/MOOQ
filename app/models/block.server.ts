import type { YooptaContentValue } from "@yoopta/editor";

import type { BlockType, Prisma, ProblemStatus } from "generated/prisma/client";
import { prisma } from "~/lib/prisma.server";
import { extractAnswerFieldNames } from "~/utils/problem";

export type SubmittedBlock = {
  id: string;
  type: string;
  content: string | null;
};

export async function getBlockById(id: string) {
  return prisma.block.findUnique({
    where: { id },
    include: { problem: true },
  });
}

export async function updateBlock(id: string, content: string | null) {
  return prisma.block.update({
    where: { id },
    data: {
      content,
    },
  });
}

export async function updateBlockWithProblemAndAnswers(
  blockId: string,
  content: string,
  problemName: string,
  problemContent: string,
  problemStatus: ProblemStatus,
) {
  return prisma.$transaction(async (tx) => {
    const block = await tx.block.update({
      where: { id: blockId },
      data: {
        content,
        problem: {
          upsert: {
            create: {
              name: problemName,
              content: problemContent,
              status: problemStatus,
            },
            update: {
              name: problemName,
              content: problemContent,
              status: problemStatus,
            },
          },
        },
      },
      include: {
        problem: {
          include: { answerFields: true },
        },
      },
    });

    if (!block.problem) return block;

    const newNames = extractAnswerFieldNames(
      JSON.parse(problemContent) as YooptaContentValue,
    );
    const existing = block.problem.answerFields.map((a) => a.name);
    const toCreate = newNames.filter((name) => !existing.includes(name));
    const toDelete = existing.filter((name) => !newNames.includes(name));
    if (toDelete.length > 0) {
      await tx.answerField.deleteMany({
        where: {
          problemId: block.problem.id,
          name: { in: toDelete },
        },
      });
    }
    if (toCreate.length > 0) {
      await tx.answerField.createMany({
        data: toCreate.map((name) => ({
          problemId: block.problem!.id,
          name,
        })),
        skipDuplicates: true,
      });
    }

    return block;
  });
}

export async function savePageBlocks(
  pageId: string,
  submittedBlocks: SubmittedBlock[],
) {
  return prisma.$transaction(async (tx) => {
    await deleteMissingBlocks(tx, pageId, submittedBlocks);

    for (let i = 0; i < submittedBlocks.length; i++) {
      await upsertBlock(tx, pageId, submittedBlocks[i], i);
    }
  });
}

export async function deleteMissingBlocks(
  tx: Prisma.TransactionClient,
  pageId: string,
  submittedBlocks: SubmittedBlock[],
) {
  const existingIdsToKeep = submittedBlocks
    .map((b) => b.id)
    .filter((id) => !id.startsWith("temp-"));

  await tx.block.deleteMany({
    where: {
      pageId: pageId,
      id: {
        notIn: existingIdsToKeep,
      },
    },
  });
}

async function upsertBlock(
  tx: Prisma.TransactionClient,
  pageId: string,
  block: SubmittedBlock,
  index: number,
) {
  const isNew = block.id.startsWith("temp-");

  if (isNew) {
    await tx.block.create({
      data: {
        pageId: pageId,
        type: block.type as BlockType,
        content: block.content || "",
        order: index,
      },
    });
  } else {
    await tx.block.update({
      where: { id: block.id },
      data: {
        order: index,
      },
    });
  }
}
