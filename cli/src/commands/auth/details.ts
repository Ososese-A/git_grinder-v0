import { getGit } from "../../lib/git.js";
import chalk from "chalk";

/** Show Git Grinder user details */
export const command = "details";
export const describe = "Show Git Grinder user details";

export const handler = async () => {
  const git = getGit();
  const name = await git.raw(["config", "--get", "user.name"]);
  const email = await git.raw(["config", "--get", "user.email"]);

  if (name.trim() && email.trim()) {
    console.log(chalk.green("👤 Git Grinder User Details:"));
    console.log(`   Name : ${name.trim()}`);
    console.log(`   Email: ${email.trim()}`);
  } else {
    console.log(chalk.yellow("⚠️  Git user details are not fully configured."));
    console.log(
      "   Please run 'grinder setup' to configure your Git identity.",
    );
  }
};
