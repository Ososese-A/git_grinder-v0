import { CommandModule } from "yargs";
import { getGit } from "../../lib/git";

export const syncCommand: CommandModule = {
  command: "sync",
  aliases: ["pull", "get"],
  describe: "Pull updates (Rebase + Autostash)",

  handler: async () => {
    const git = getGit();
    console.log("🔄 Syncing with origin...");

    try {
      // fetch + pull --rebase --autostash
      await git.pull(["--rebase", "--autostash"]);
      console.log("✅ Up to date.");
    } catch (e: any) {
      if (e.message.includes("conflict")) {
        console.error("💥 Conflicts detected during rebase.");
        console.error('👉 Fix the files, then run "git rebase --continue"');
        // Future brainstorm: 'grinder fix' to help here?
      } else {
        console.error("❌ Sync failed:", e.message);
      }
    }
  },
};

export const { command, aliases, describe, builder, handler } = syncCommand;
