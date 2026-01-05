import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type PutObjectCommandInput,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import invariant from "tiny-invariant";

invariant(process.env.STORAGE_ENDPOINT, "STORAGE_ENDPOINT must be set");
invariant(process.env.STORAGE_ACCESS_KEY, "STORAGE_ACCESS_KEY must be set");
invariant(process.env.STORAGE_SECRET_KEY, "STORAGE_SECRET_KEY must be set");
invariant(process.env.STORAGE_BUCKET_NAME, "STORAGE_BUCKET_NAME must be set");

export function createS3Client(): S3Client {
  return new S3Client({
    region: process.env.STORAGE_REGION || "auto",
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET_KEY!,
    },
    forcePathStyle: true,
  });
}

const s3 = createS3Client();
const bucket = process.env.STORAGE_BUCKET_NAME;

export async function uploadObject(
  key: string,
  body: PutObjectCommandInput["Body"],
  contentType?: string,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getObject(key: string) {
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  return res.Body;
}

export async function createPresignedGetUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60 * 60,
  });

  return url;
}

export async function deleteObject(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  }
}
