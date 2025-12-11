import { CommandModule } from "yargs";
import { getGit } from "../../lib/git";
import { handler as saveHandler } from "./save";

interface ShipArgs {
  message?: string;
}

export const shipCommand: CommandModule<unknown, ShipArgs> = {
  command: "ship [message]",
  aliases: ["up", "push"],
  describe: "Commit (optional) and push to remote",

  builder: (yargs) =>
    yargs.positional("message", {
      type: "string",
      describe: "Commit message (if you have uncommitted changes)",
      default: "",
    }),

  handler: async (argv) => {
    const git = getGit();
    const status = await git.status();

    // 1. commit changes if present
    if (status.files.length > 0) {
      if (!argv.message) {
        console.log("⚠️  You have uncommitted changes.");
      }

      // Reuse the save handler
      await saveHandler({
        ...argv,
        message: argv.message ?? "",
        _: [],
        $0: "",
      });
    }

    // 2. Push Logic
    console.log("🚀 Shipping to origin...");

    try {
      await git.push();
      console.log("✅ Shipped.");
    } catch (e: any) {
      // 3. Auto-fix Upstream
      if (
        e.message.includes("no upstream") ||
        e.message.includes("set-upstream")
      ) {
        const currentBranch = (await git.branch()).current;
        console.log(`🔗 Linking ${currentBranch} to origin...`);
        await git.push(["--set-upstream", "origin", currentBranch]);
        console.log("✅ Shipped & Linked.");
      } else {
        console.error("❌ Push failed:", e.message);
        process.exit(1);
      }
    }
  },
};

export const { command, aliases, describe, builder, handler } = shipCommand;
