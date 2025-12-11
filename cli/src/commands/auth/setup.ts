import { CommandModule } from "yargs";
import { getGit } from "../../lib/git";
import { runCommand, runInteractive } from "../../lib/shell";
import * as fs from "fs-extra";
import * as path from "path";
import os from "os";
import chalk from "chalk";
import prompts from "prompts";

export const command = "setup";
export const describe = "Set up authentication for Git Grinder";

export const handler = async () => {
  const git = getGit();
  console.log(chalk.green("Welcome to Git Grinder setup!"));

  // git identity setup
  const currentName = runCommand("git config --global user.name") || "";
  const currentEmail = runCommand("git config --global user.email") || "";

  const response = await prompts([
    {
      type: "text",
      name: "name",
      message: "Git User Name",
      initial: currentName || "Your name",
    },
    {
      type: "text",
      name: "email",
      message: "Git User Email",
      initial: currentEmail || "your.email@example.com",
    },
  ]);

  if (!response.name || !response.email) {
    console.log(chalk.red("Setup aborted. Name and email are required."));
    return;
  }

  // apply git config
  await git.addConfig("user.name", response.name, true);
  await git.addConfig("user.email", response.email, true);
  await git.addConfig("credential.helper", "store", true);
  await git.addConfig("init.defaultBranch", "main", true);

  console.log(chalk.green("Git identity configured successfully."));

  // create credential store file if not exists
  // const gitCredentialsPath = path.join(os.homedir(), '.git-credentials');
  // if (!fs.existsSync(gitCredentialsPath)) {
  //   fs.writeFileSync(gitCredentialsPath, '');
  //   console.log(chalk.green("Created Git credentials store file."));
  // } else {
  //   console.log(chalk.yellow("Git credentials store file already exists."));
  // }

  // console.log(chalk.green("Setup completed successfully!"));

  const sshDir = path.join(os.homedir(), ".ssh");
  const keyPath = path.join(sshDir, "id_rsa_gitgrinder");
  if (fs.existsSync(keyPath)) {
    console.log(chalk.yellow(`SSH key already exists at ${keyPath}`));
  } else {
    const { createKey } = await prompts({
      type: "confirm",
      name: "createKey",
      message: `No SSH key found. Do you want to create one?`,
      initial: true,
    });

    if (createKey) {
      // ensure .ssh dir exists
      fs.ensureDirSync(sshDir);
      console.log(chalk.green("Generating SSH key..."));
      runInteractive(
        `ssh-keygen -t rsa -b 4096 -C "${response.email}" -f "${keyPath}" -N ""`
      );
      runCommand(
        `eval "$(ssh-agent -s)" && ssh-add --apple-use-keychain ~/.ssh/id_rsa_gitgrinder`
      );
      console.log(chalk.green(`SSH key generated at ${keyPath}`));
    }
  }

  //   display public key
  if (fs.existsSync(`${keyPath}.pub`)) {
    const publicKey = fs.readFileSync(`${keyPath}.pub`, "utf-8");
    console.log(chalk.green("\nYour SSH Public Key:\n"));
    console.log(chalk.blue(publicKey));
    console.log(
      chalk.green(
        "\nAdd this public key to your Git hosting provider (e.g., GitHub, GitLab) to enable SSH authentication."
      )
    );
  }
};
