import type { CommandModule, ArgumentsCamelCase } from "yargs";
import chalk from "chalk";
import ora from "ora";
import { simpleGit, type SimpleGit } from "simple-git";
import { TrackingService } from "../services/tracking.service";
import { RecommendationService } from "../services/recommendation.service";
import { handleError } from "../utils/errors";
import { Logger } from "../utils/logger";

interface CommitArgs {
  message: string;
  all: boolean;
}

export const commitCommand: CommandModule<{}, CommitArgs> = {
  command: "commit",
  describe: "commits changes with tracking",

  builder: (yargs) => {
    return yargs
      .option("message", {
        type: "string",
        description: "Commit message",
        alias: "m",
        demandOption: true,
      })
      .option("all", {
        type: "boolean",
        description: "Stage all changes",
        alias: "a",
        default: false,
      })
      .example('$0 commit -m "Initial commit"', "Simple commit")
      .example('$0 commit -am "Fix bug"', "Stage all and commit");
  },
  handler: async (argv: ArgumentsCamelCase<CommitArgs>) => {
    const git: SimpleGit = simpleGit();
    const spinner = ora();

    try {
      const status = await git.status();
      if (status.files.length === 0) {
        Logger.warn("No chnages to commit");
        return;
      }
      if (!argv.message) {
        Logger.error("Commit message is required");
        Logger.dim('Use: grinder commit -m "your message"');
        process.exit(1);
      }
      if (argv.all) {
        spinner.start("Staging changes...");
        await git.add(".");
        spinner.succeed(chalk.gray("Staged all changes"));
      }
      spinner.start("Committing...");
      const result = await git.commit(argv.message);
      const shortHash = result.commit.substring(0, 7);
      spinner.succeed(chalk.green(`✓ Commited: ${shortHash}`));
      console.log(chalk.dim(` ${result.summary.changes} file(s) changed`));

      // tracking
      await TrackingService.track({
        action: "commit",
        hash: result.commit,
        message: argv.message,
      });

      // recommendations
      const tips = await RecommendationService.getPostCommitTips({
        commitHash: result.commit,
        branch: status.current ? status.current : "",
        hasRemote: status.tracking !== null,
      });

      if (tips.length > 0) {
        console.log(chalk.blue("\n💡 Next Steps:"));
        tips.forEach((tip) => Logger.dim(`ׁ‧ ${tip}`));
      }
    } catch (error) {
      spinner.fail(chalk.red("x Commit failed"));
      handleError(error);
    }
  },
};
