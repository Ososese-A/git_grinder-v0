import type { CommandModule, ArgumentsCamelCase } from "yargs";
import chalk from "chalk";
import ora from "ora";
import { simpleGit, type SimpleGit } from "simple-git";
import { TrackingService } from "../../services/tracking.service.js";
// import { RecommendationService } from "../services/recommendation.service.js";
import { handleError } from "../../utils/errors.js";
import { Logger } from "../../utils/logger.js";

interface UpdateArgs {
  message: string;
  force: boolean;
}

// TODO: add option to add selected files

export const updateCommand: CommandModule<{}, UpdateArgs> = {
  command: "update",
  describe: "updates the repository with the latest code changes with tracking",

  builder: (yargs) => {
    return yargs
      .option("message", {
        type: "string",
        description: "update message",
        alias: "m",
        demandOption: true,
      })
      .option("force", {
        type: "boolean",
        description: "forcefully update the repository",
        alias: "f",
        default: false,
      })
      .example('$0 commit -m "Initial commit"', "Simple commit")
      .example('$0 commit -am "Fix bug"', "Stage all and commit");
  },
  handler: async (argv: ArgumentsCamelCase<UpdateArgs>) => {
    const git: SimpleGit = simpleGit();
    const spinner = ora();

    try {
      const status = await git.status();
      const hasChanges = !status.isClean();
      const currentBranch = status.current || "main";
      const updatesFiles = [
        ...status.modified,
        ...status.created,
        ...status.deleted,
      ];
      const pushOptions = argv.force ? ["--force"] : [];

      if (status.files.length === 0) {
        Logger.warn(
          "Heads up: the repo is empty, add some files before updating."
        );
        return;
      }
      if (!hasChanges) {
        Logger.warn(
          "Bro… you didn’t touch a single file 😭 Nothing to update fr."
        );
        return;
      }

      if (!argv.message) {
        Logger.error("You need to provide an update message");
        Logger.dim('Use: grinder update -m "your message"');
        process.exit(1);
      }
      spinner.start("Updating...");
      // STEP 1: Add files
      await git.add(updatesFiles);
      // STEP 2: Commit files
      const result = await git.commit(argv.message);
      const shortHash = result.commit.substring(0, 7);
      // STEP 3: Push files
      await git.push("origin", currentBranch, pushOptions);
      spinner.succeed(chalk.green(`Updated: ${shortHash}`));
      console.log(chalk.dim(` ${result.summary.changes} file(s) changed`));

      // tracking
      await TrackingService.track({
        action: "update",
        hash: result.commit,
        message: argv.message,
      });

      // recommendations
      // const tips = await RecommendationService.getPostCommitTips({
      //   commitHash: result.commit,
      //   branch: status.current ? status.current : "",
      //   hasRemote: status.tracking !== null,
      // });

      // if (tips.length > 0) {
      //   console.log(chalk.blue("\n💡 Next Steps:"));
      //   tips.forEach((tip) => Logger.dim(`ׁ‧ ${tip}`));
      // }
    } catch (error) {
      spinner.fail(chalk.red("x Update failed"));
      handleError(error);
    }
  },
};
