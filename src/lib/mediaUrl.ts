/** Resolve a file in `public/media/` for use in `src` / `poster` (handles spaces & Unicode). */
export function mediaUrl(filename: string): string {
  return `/media/${encodeURIComponent(filename)}`;
}
