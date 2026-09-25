/**
 * Prefix for files in /public. Empty on a normal deploy; set
 * NEXT_PUBLIC_BASE_PATH (e.g. "/Venbeemail") when the site lives under a
 * sub-path such as GitHub Pages. Must match `basePath` in next.config.ts.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;
