import fs from "fs";

/**
 * Validate project name — lowercase letters, numbers, hyphens, underscores.
 * Max 214 characters (npm naming convention).
 */
export function isValidProjectName(name: string): boolean {
  return /^[a-z0-9_-]+$/.test(name) && name.length > 0 && name.length <= 214;
}

/**
 * Check if a directory is empty or doesn't exist.
 */
export function isDirectoryEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) return true;
  return fs.readdirSync(dir).length === 0;
}
