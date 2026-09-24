import path from 'path';

/** Uploaded client documents live outside `public/` so they're only served through an auth check. */
export const STORAGE_DIR = path.join(process.cwd(), 'storage', 'documents');

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function storagePathFor(relative: string) {
  const full = path.join(STORAGE_DIR, relative);
  if (!full.startsWith(STORAGE_DIR + path.sep)) throw new Error('Invalid path');
  return full;
}
