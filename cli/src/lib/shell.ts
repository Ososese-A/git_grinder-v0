import { execSync } from "child_process";
import { command } from "yargs";

export const runCommand = (command: string): string | null => {
  try {
    return execSync(command, {
      encoding: "utf-8",
      stdio: "pipe",
    }).trim();
  } catch (error) {
    return null;
  }
};

export const runInteractive = (command: string) => {
  try {
    execSync(command, {
      stdio: "inherit",
    });
  } catch (error) {
    return false;
  }
};
