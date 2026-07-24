import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `diamondnursery/${Date.now()}_${cleanFilename}`;

    // If Cloudflare R2 credentials exist in environment, attempt R2 upload
    if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      try {
        const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
        const requestHandler = proxyUrl ? new NodeHttpHandler({
          httpAgent: new HttpsProxyAgent(proxyUrl),
          httpsAgent: new HttpsProxyAgent(proxyUrl),
        }) : undefined;

        const s3 = new S3Client({
          region: 'auto',
          endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
          forcePathStyle: true,
          requestHandler,
        });

        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'chf-media',
          Key: objectKey,
          Body: buffer,
          ContentType: file.type,
        });

        await s3.send(command);

        const publicUrlBase = process.env.R2_PUBLIC_URL || 'https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev';
        const fileUrl = `${publicUrlBase}/${objectKey}`;
        return NextResponse.json({ Message: "Success", status: 201, url: fileUrl });
      } catch (r2Error) {
        console.error("R2 Upload failed, falling back to local storage:", r2Error);
      }
    }

    // Fallback: Save directly to public/diamondnursery directory for instant local preview
    const uploadsDir = path.join(process.cwd(), 'public', 'diamondnursery');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFileName = `${Date.now()}_${cleanFilename}`;
    const localFilePath = path.join(uploadsDir, localFileName);
    fs.writeFileSync(localFilePath, buffer);

    const localUrl = `/diamondnursery/${localFileName}`;
    return NextResponse.json({ Message: "Success", status: 201, url: localUrl });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ Message: "Failed", status: 500, error: error.message });
  }
}
