import { prisma } from "~/lib/prisma.server";
import { uploadObject } from "~/services/storage.server";

export async function uploadFile(file: File, key: string, url: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  await uploadObject(key, buffer, mimeType);

  return await prisma.file.upsert({
    where: {
      key,
    },
    update: {
      name: file.name,
      mimeType,
      url,
    },
    create: {
      name: file.name,
      key,
      mimeType,
      url,
    },
  });
}

export async function uploadPublicFile(file: File, key: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const url = `/api/file/${key}`;

  await uploadObject(key, buffer, mimeType);

  return await prisma.file.upsert({
    where: {
      key,
    },
    update: {
      name: file.name,
      mimeType,
      url,
      visibility: "PUBLIC",
    },
    create: {
      name: file.name,
      key,
      mimeType,
      url,
      visibility: "PUBLIC",
    },
  });
}
