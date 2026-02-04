import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function getObjectURL(key: string): Promise<string> {
  try {
    // If already a full URL, return as is
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return url;
  } catch (error) {
    console.error('❌ Error generating presigned URL for key:', key, error);
    return key; // Return original key if error
  }
}

export async function getPresignedUrls(images: string[]): Promise<string[]> {
  try {
    const urlPromises = images.map(async (imageKey) => {
      return await getObjectURL(imageKey);
    });
    return await Promise.all(urlPromises);
  } catch (error) {
    console.error('❌ Error generating presigned URLs:', error);
    return images; // Return original keys if error
  }
}

export { s3Client };
