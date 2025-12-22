import { CommandModule } from "yargs";
import { getGit } from "../../lib/git.js";

/** Show Git Grinder user details */
export const detailsCommand: CommandModule = {
  command: "details",
  describe: "Show Git Grinder user details",

  handler: async () => {
    const git = getGit();
    const name = await git.raw(["config", "--get", "user.name"]);
    const email = await git.raw(["config", "--get", "user.email"]);

    console.log("👤 Git Grinder User Details:");
    console.log(`   Name : ${name.trim() || "Not set"}`);
    console.log(`   Email: ${email.trim() || "Not set"}`);
  },
};
