import { CommandModule } from "yargs";
import { simpleGit } from "simple-git";
import * as fs from "fs-extra";
import * as path from "path";
import { execSync } from "child_process";
import prompts from "prompts";

// 1. Interface
interface GetArgs {
  url: string;
  install: boolean;
}

/** Clone a repo and optionally setup dependencies */

export const getCommand: CommandModule<unknown, GetArgs> = {
  command: "get <url>",
  aliases: ["clone"],
  describe: "Clone a repo and optionally setup dependencies",

  // 3. Builder
  builder: (yargs) => {
    return yargs
      .positional("url", {
        describe: "The Git URL to clone",
        type: "string",
        demandOption: true,
      })
      .option("install", {
        alias: "i",
        describe: "Auto-install dependencies (use --no-install to skip)",
        type: "boolean",
        default: true,
      });
  },

  // 4. Handler
  handler: async (argv) => {
    const url = argv.url;
    // Extract folder name safely
    const repoName = url.split("/").pop()?.replace(".git", "") || "repo";
    const targetPath = path.join(process.cwd(), repoName);

    if (fs.existsSync(targetPath)) {
      console.error(`❌ Error: Folder "${repoName}" already exists.`);
      process.exit(1);
    }

    console.log(`🐐 \x1b[36mCloning ${url}...\x1b[0m`);

    try {
      await simpleGit().clone(url, targetPath);
    } catch (e: any) {
      console.error("❌ Clone failed:", e.message);
      process.exit(1);
    }

    // Dependency Logic
    if (!argv.install) {
      console.log(`\n✅ Cloned into ${repoName}. (Skipping install)`);
      return;
    }

    // Detect Package Manager
    let installCmd = "";
    if (fs.existsSync(path.join(targetPath, "package.json"))) {
      installCmd = "npm install";
    } else if (fs.existsSync(path.join(targetPath, "requirements.txt"))) {
      installCmd = "pip install -r requirements.txt";
    } else if (fs.existsSync(path.join(targetPath, "go.mod"))) {
      installCmd = "go mod download";
    } 

    if (installCmd) {
      // Interactive Prompt
      const response = await prompts({
        type: "confirm",
        name: "shouldInstall",
        message: `Detected dependencies. Run '${installCmd}'?`,
        initial: true,
      });

      if (response.shouldInstall) {
        console.log(`📦 Running ${installCmd}...`);
        try {
          execSync(installCmd, { cwd: targetPath, stdio: "inherit" });
          console.log("✅ Dependencies installed.");
        } catch (e) {
          console.error("⚠️ Installation failed, but repo is safe.");
        }
      }
    }

    console.log(`\n👉 \x1b[33mcd ${repoName}\x1b[0m to begin.`);
  },
};
