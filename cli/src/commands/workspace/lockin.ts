import type { CommandModule, ArgumentsCamelCase } from "yargs";
import chalk from "chalk";
import ora from "ora";
import { simpleGit, type SimpleGit } from "simple-git";
import { TrackingService } from "../../services/tracking.service.js";
// import { RecommendationService } from "../services/recommendation.service.js";
import { handleError } from "../../utils/errors.js";
import { Logger } from "../../utils/logger.js";
import yargs from "yargs";

interface LockinArgs {
  remoteUrl: string;
  branch: string;
}

export const lockinCommand: CommandModule<{}, LockinArgs> = {
  command: "lockin",
  describe:
    "initialize a new remote repository and lock in the current workspace",

  builder: (yargs) => {
    return yargs
      .option("remoteUrl", {
        type: "string",
        description: "URL of the remote repository",
        alias: "r",
        demandOption: true,
      })
      .option("branch", {
        type: "string",
        description: "Branch to lock in",
        alias: "b",
        default: "main",
      })
      .example(
        '$0 lockin -r "https://github.com/user/repo.git" -b "main"',
        "Initialize and lock in the main branch of the remote repository"
      );
  },
  handler: async (argv: ArgumentsCamelCase<LockinArgs>) => {
    const git: SimpleGit = simpleGit();
    const spinner = ora();

    try {
      spinner.start("Making your remote repository...");
      await git.init();
      await git.add(".");
      await git.commit("first commit");
      await git.addRemote("origin", argv.remoteUrl);
      await git.push(["-u", "origin", argv.branch]);
      spinner.succeed(
        "Remote repository initialized and locked in successfully."
      );
    } catch (error) {
      spinner.fail(chalk.red("Failed to lock in the workspace."));
      handleError(error);
    }
  },
};
