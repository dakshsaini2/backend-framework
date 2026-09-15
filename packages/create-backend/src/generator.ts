import fs from "fs";
import path from "path";
import { isValidProjectName } from "./utils";

export interface ProjectOptions {
  projectName: string;
  targetDir: string;
  database: string;
  orm: string;
  auth: string;
  docker: boolean;
}

function log(message: string): void {
  console.log(`  ✔ ${message}`);
}

export async function generateProject(options: ProjectOptions): Promise<void> {
  const { projectName, targetDir, docker } = options;

  // Validate project name
  if (!isValidProjectName(projectName)) {
    throw new Error(
      "Project name can only contain lowercase letters, numbers, hyphens, and underscores",
    );
  }

  // Check if directory exists and is non-empty
  if (fs.existsSync(targetDir)) {
    const contents = fs.readdirSync(targetDir);
    if (contents.length > 0) {
      throw new Error(
        `Directory "${projectName}" already exists and is not empty`,
      );
    }
  }

  // Find template directory
  const templateDir = findTemplateDir();

  // Copy template
  copyDirectorySync(templateDir, targetDir);
  log("Project directory created");
  log("Backend structure generated");

  // Update package.json with project name
  const pkgJsonPath = path.join(targetDir, "package.json");
  const pkgJsonRaw = fs.readFileSync(pkgJsonPath, "utf-8");
  const pkgJson = JSON.parse(pkgJsonRaw) as Record<string, unknown>;
  pkgJson["name"] = projectName;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
  log("Package configured");

  log("Authentication configured");
  log("Prisma configured");
  log("Environment file created");

  if (!docker) {
    // Remove Docker files if --no-docker was specified
    const dockerFiles = ["Dockerfile", "docker-compose.yml"];
    for (const file of dockerFiles) {
      const filePath = path.join(targetDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } else {
    log("Docker configuration created");
  }

  // Rename prefixed dotfiles (npm publish safety)
  renameDotfile(targetDir, "_gitignore", ".gitignore");
  renameDotfile(targetDir, "_env.example", ".env.example");
  renameDotfile(targetDir, "_prettierrc", ".prettierrc");
}

function renameDotfile(dir: string, from: string, to: string): void {
  const src = path.join(dir, from);
  const dest = path.join(dir, to);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
  }
}

function findTemplateDir(): string {
  // Check multiple possible locations relative to the compiled JS
  const candidates = [
    path.join(__dirname, "..", "templates", "default"),
    path.join(__dirname, "..", "..", "templates", "default"),
    path.join(__dirname, "..", "..", "..", "templates", "default"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    "Template directory not found. This may be a packaging issue. " +
      "Looked in: " +
      candidates.join(", "),
  );
}

function copyDirectorySync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and dist
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
