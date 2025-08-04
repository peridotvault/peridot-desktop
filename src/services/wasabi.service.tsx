import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

import.meta.env.VITE_WASABI_ENDPOINT;

const s3 = new S3Client({
  region: "ap-southeast-1",
  endpoint: process.env.WASABI_ENDPOINT,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
});

export async function uploadGameFile(
  chain: string,
  appId: string,
  platform: string,
  version: string,
  filePath: string
) {
  const fileStream = fs.createReadStream(filePath);
  const key = `${chain}/${appId}/builds/${platform}/game-${version}.zip`;

  const command = new PutObjectCommand({
    Bucket: process.env.WASABI_BUCKET!,
    Key: key,
    Body: fileStream,
    ACL: "public-read", // opsional
  });

  await s3.send(command);

  return `https://s3.wasabisys.com/${process.env.WASABI_BUCKET}/${key}`;
}

export async function uploadCover(
  chain: string,
  appId: string,
  filePath: string
) {
  const fileStream = fs.createReadStream(filePath);
  const key = `${chain}/${appId}/cover/cover.png`;

  const command = new PutObjectCommand({
    Bucket: process.env.WASABI_BUCKET!,
    Key: key,
    Body: fileStream,
    ACL: "public-read",
  });

  await s3.send(command);

  return `https://s3.wasabisys.com/${process.env.WASABI_BUCKET}/${key}`;
}
