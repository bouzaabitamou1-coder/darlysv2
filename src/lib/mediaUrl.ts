/** Resolve a file in `public/media/` for use in `src` / `poster`. */
export function mediaUrl(filename: string): string {
  return `/media/${filename}`;
}
