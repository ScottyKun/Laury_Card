const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET = process.env.MINIO_BUCKET_CARDS || "cards-thumbnails";

async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
    // Politique publique en lecture seule, pour que les miniatures soient affichables directement
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET, JSON.stringify(policy));
    console.log(`Bucket MinIO "${BUCKET}" créé.`);
  }
}

async function uploadThumbnail(objectName, buffer) {
  await minioClient.putObject(BUCKET, objectName, buffer, {
    "Content-Type": "image/png",
  });
  // URL publique directe (via le endpoint MinIO exposé)
  return `http://localhost:9000/${BUCKET}/${objectName}`;
}

const BUCKET_UPLOADS = process.env.MINIO_BUCKET_UPLOADS || "user-uploads";

async function ensureUploadsBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET_UPLOADS).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_UPLOADS);
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_UPLOADS}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_UPLOADS, JSON.stringify(policy));
    console.log(`Bucket MinIO "${BUCKET_UPLOADS}" créé.`);
  }
}

async function uploadImage(objectName, buffer, contentType) {
  await minioClient.putObject(BUCKET_UPLOADS, objectName, buffer, { "Content-Type": contentType });
  return `http://localhost:9000/${BUCKET_UPLOADS}/${objectName}`;
}

async function copyThumbnailByUrl(sourceUrl, newObjectName) {
  const prefix = `http://localhost:9000/${BUCKET}/`;
  if (!sourceUrl.startsWith(prefix)) return null;
  const sourceObjectName = sourceUrl.slice(prefix.length);

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
  copyThumbnailByUrl, deleteThumbnail,
};
