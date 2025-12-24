import { prisma } from "~/lib/prisma.server";
import { ensureBucket, uploadObject } from "~/services/storage.server";

export async function uploadFile(file: File, bucket: string, key: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  await ensureBucket(bucket);
  await uploadObject(bucket, key, buffer, mimeType);

  return await prisma.file.create({
    data: {
      name: file.name,
      key: key,
      bucket,
      mimeType,
    },
  });
}

export async function uploadPublicFile(
  file: File,
  bucket: string,
  key: string,
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const url = `/api/file/${bucket}/${key}`;

  await ensureBucket(bucket);
  await uploadObject(bucket, key, buffer, mimeType);

  return await prisma.file.upsert({
    where: {
      key,
    },
    update: {
      name: file.name,
      bucket,
      mimeType,
      url,
      visibility: "PUBLIC",
    },
    create: {
      name: file.name,
      key,
      bucket,
      mimeType,
      url,
      visibility: "PUBLIC",
    },
  });
}
