import { CommandModule } from "yargs";

export const command = "auth <command>";
export const describe = "Manage authentication and config";

// This builder function registers the subcommands found in this directory
export const builder = (yargs: any) => {
  return yargs.commandDir(".", {
    extensions: ["ts", "js"],
    exclude: /index\.[jt]s/,
  });
};

export const handler = async () => {};
