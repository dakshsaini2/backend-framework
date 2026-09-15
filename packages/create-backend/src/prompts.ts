/**
 * Future interactive prompts support.
 * This module provides a structure for adding interactive CLI prompts
 * using a library like inquirer or prompts in a future version.
 */

export interface ProjectPromptAnswers {
  projectName: string;
  database: "postgres" | "mysql" | "mongodb";
  orm: "prisma" | "drizzle";
  auth: "jwt" | "session";
  docker: boolean;
  typescript: boolean;
}

/**
 * Returns default options for v1.
 * In a future version, this can prompt the user interactively.
 */
export function getDefaultOptions(): Partial<ProjectPromptAnswers> {
  return {
    database: "postgres",
    orm: "prisma",
    auth: "jwt",
    docker: true,
    typescript: true,
  };
}
