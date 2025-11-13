import yargs, { boolean, hide } from "yargs";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import { commitCommand } from "./commands/commit";
import { Logger, LogLevel } from "./utils/logger";

const cli = yargs(hideBin(process.argv))
  .scriptName("grinder")
  .usage("$0 <command> [options")
  .version("1.0.0")
  .alias("v", "version")
  .alias("h", "help")

  .option("debug", {
    type: "boolean",
    description: "Enable debug mode",
    global: true,
  })
  .option("no-track", {
    type: "boolean",
    description: "Disable tracking",
    global: true,
  })

  .middleware((argv) => {
    if (argv.debug) {
      Logger.setLevel(LogLevel.DEBUG);
      Logger.debug("Debug mode enabled");
    }
  })

  .command(commitCommand)
  .demandCommand(1, chalk.red("Please provide a command"))
  .strict()
  .fail((msg, err) => {
    if (err) {
      console.error(chalk.red(`\n❌ ${err.message}`));
    } else {
      console.error(chalk.red(`\n❌ ${msg}`));
    }
    process.exit(1);
  })
  .epilogue("For more information, visit http://gitgrinder.com/docs")
  .wrap(Math.min(120, process.stdout.columns || 80));

cli.parse();
