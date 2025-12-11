import { CommandModule } from "yargs";
import { getGit } from "../../lib/git";
import prompts from "prompts";

interface SaveArgs {
  message: string;
}

export const saveCommand: CommandModule<unknown, SaveArgs> = {
  command: "save [message]",
  aliases: ["commit", "ci"], 
  describe: "Stage and commit all changes",

  builder: (yargs) =>
    yargs.positional("message", {
      type: "string",
      describe: "Commit message",
      demandOption: true,
    }),

  handler: async (argv) => {
    const git = getGit();

    // 1. Check Status
    const status = await git.status();
    if (status.files.length === 0) {
      console.log("✨ Workspace is clean. Nothing to save.");
      return;
    }

    // 2. Handle Message (Prompt if missing)
    let msg = argv.message;
    if (!msg) {
      const response = await prompts({
        type: "text",
        name: "message",
        message: "Enter commit message:",
        validate: (value) =>
          value.length > 0 ? true : "Message cannot be empty",
      });
      if (!response.message) return; // User cancelled
      msg = response.message;
    }

    console.log("📦 Saving work...");
    await git.add(".");
    await git.commit(msg as string);
    console.log(`✅ Saved: "${msg}"`);
  },
};

export const { command, aliases, describe, builder, handler } = saveCommand;
