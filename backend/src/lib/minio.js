const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET_CARDS || "cards-thumbnails";
const BUCKET_UPLOADS = process.env.MINIO_BUCKET_UPLOADS || "user-uploads";
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "http://localhost:9000"; // ex: https://minio.famproject.cloud en prod

function buildPublicUrl(bucket, objectName) {
  return `${PUBLIC_URL}/${bucket}/${objectName}`;
}

function extractObjectName(url, bucket) {
  const prefix = `${PUBLIC_URL}/${bucket}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
    await minioClient.setBucketPolicy(BUCKET, JSON.stringify({
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Principal: { AWS: ["*"] }, Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
    }));
  }
}

async function ensureUploadsBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET_UPLOADS).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_UPLOADS);
    await minioClient.setBucketPolicy(BUCKET_UPLOADS, JSON.stringify({
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Principal: { AWS: ["*"] }, Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${BUCKET_UPLOADS}/*`] }],
    }));
  }
}

async function uploadThumbnail(objectName, buffer) {
  await minioClient.putObject(BUCKET, objectName, buffer, { "Content-Type": "image/png" });
  return buildPublicUrl(BUCKET, objectName);
}

async function uploadImage(objectName, buffer, contentType) {
  await minioClient.putObject(BUCKET_UPLOADS, objectName, buffer, { "Content-Type": contentType });
  return buildPublicUrl(BUCKET_UPLOADS, objectName);
}

async function copyThumbnailByUrl(sourceUrl, newObjectName) {
  const sourceObjectName = extractObjectName(sourceUrl, BUCKET);
  if (!sourceObjectName) return null;

  const stream = await minioClient.getObject(BUCKET, sourceObjectName);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  return uploadThumbnail(newObjectName, buffer);
}

async function deleteThumbnail(objectName) {
  try {
    await minioClient.removeObject(BUCKET, objectName);
  } catch (err) {
    console.error("Erreur suppression MinIO:", err.message);
  }
}

module.exports = {
  minioClient, ensureBucketExists, uploadThumbnail, BUCKET,
  ensureUploadsBucketExists, uploadImage, BUCKET_UPLOADS,
  copyThumbnailByUrl, deleteThumbnail, extractObjectName, buildPublicUrl,
};