import type { BlockType, Prisma, ProblemStatus } from "generated/prisma/client";
import { prisma } from "~/lib/prisma.server";

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

export async function updateBlock(
  id: string,
  content: string | null,
  problemName?: string | null,
  problemContent?: string | null,
  problemStatus?: ProblemStatus,
) {
  return prisma.block.update({
    where: { id },
    data: {
      content,
      problem:
        problemContent && problemName
          ? {
              upsert: {
                update: {
                  name: problemName,
                  content: problemContent,
                  status: problemStatus,
                },
                create: {
                  name: problemName,
                  content: problemContent,
                  status: problemStatus,
                },
              },
            }
          : undefined,
    },
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
