#!/usr/bin/env node

import { Command } from "commander";
import path from "path";
import { generateProject } from "./generator";

const program = new Command();

program
  .name("create-dk-backend")
  .description(
    "Generate a production-ready TypeScript backend with Express, Prisma, and JWT authentication",
  )
  .version("1.0.0")
  .argument("<project-name>", "Name of the project directory to create")
  .option("--database <type>", "Database type (default: postgres)", "postgres")
  .option("--orm <type>", "ORM type (default: prisma)", "prisma")
  .option("--auth <type>", "Auth type (default: jwt)", "jwt")
  .option("--no-docker", "Skip Docker configuration")
  .action(async (projectName: string, options: Record<string, unknown>) => {
    const targetDir = path.resolve(process.cwd(), projectName);

    console.log();
    console.log(`🚀 Creating backend project: ${projectName}`);
    console.log();

    try {
      await generateProject({
        projectName,
        targetDir,
        database: (options["database"] as string) || "postgres",
        orm: (options["orm"] as string) || "prisma",
        auth: (options["auth"] as string) || "jwt",
        docker: options["docker"] !== false,
      });

      console.log();
      console.log("✅ Backend created successfully!");
      console.log();
      console.log("Next steps:");
      console.log();
      console.log(`  cd ${projectName}`);
      console.log("  npm install");
      console.log("  cp .env.example .env");
      console.log("  # Update .env with your database credentials");
      console.log("  npm run db:migrate");
      console.log("  npm run dev");
      console.log();
      console.log(`Server will start at http://localhost:5000`);
      console.log();
    } catch (error) {
      console.error();
      console.error("❌ Failed to create project:", (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
