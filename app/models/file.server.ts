import { prisma } from "~/lib/prisma.server";
import {
  ensureBucket,
  ensurePublicBucket,
  uploadObject,
} from "~/services/storage.server";

export async function uploadFile(file: File, bucket: string, key: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";

  await ensureBucket(bucket);
  await uploadObject(bucket, key, buffer, mimeType);

  return await prisma.file.create({
    data: {
      name: file.name,
      objectName: key,
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
  const url = `${process.env.STORAGE_PUBLIC_ENDPOINT}/${bucket}/${key}`;

  await ensurePublicBucket(bucket);
  await uploadObject(bucket, key, buffer, mimeType);

  return await prisma.file.create({
    data: {
      name: file.name,
      objectName: key,
      bucket,
      mimeType,
      url,
    },
  });
}
