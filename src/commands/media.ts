import { readFileSync, statSync } from 'fs';
import { basename } from 'path';
import type { Argv } from 'yargs';
import { createClient } from '../client.js';
import { output, outputError } from '../utils/output.js';
import { handleError } from '../utils/errors.js';

/** Minimal MIME lookup for media types Late supports. */
const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.webm': 'video/webm',
  '.m4v': 'video/x-m4v',
  '.mpeg': 'video/mpeg',
  '.pdf': 'application/pdf',
};

function getMimeType(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
}

/** Register media commands: media:upload */
export function registerMediaCommands(yargs: Argv): Argv {
  return yargs.command(
    'media:upload <file>',
    'Upload a media file (returns URL for use in posts)',
    (y) =>
      y.positional('file', { type: 'string', describe: 'Path to media file', demandOption: true }),
    async (argv) => {
      try {
        const filePath = argv.file!;

        // Validate file exists
        let stat;
        try {
          stat = statSync(filePath);
        } catch {
          outputError(`File not found: ${filePath}`);
        }

        if (!stat!.isFile()) {
          outputError(`Not a file: ${filePath}`);
        }

        const fileName = basename(filePath);
        const contentType = getMimeType(fileName) as any;
        const fileBuffer = readFileSync(filePath);

        // Get presigned URL via SDK
        const late = createClient();
        const { data: presign } = await late.media.getMediaPresignedUrl({
          body: {
            filename: fileName,
            contentType,
            size: stat!.size,
          },
        });

        const presignData = presign as any;

        // Upload file to presigned URL
        const uploadRes = await fetch(presignData.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: fileBuffer,
        });

        if (!uploadRes.ok) {
          outputError(`Upload failed: ${uploadRes.statusText}`, uploadRes.status);
        }

        output({
          success: true,
          url: presignData.publicUrl,
          key: presignData.key,
          filename: fileName,
          size: stat!.size,
          contentType,
        }, argv.pretty as boolean);
      } catch (err) {
        handleError(err);
      }
    },
  );
}
