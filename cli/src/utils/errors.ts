import chalk from "chalk";
import { Logger } from "./logger";

export function handleError(error: any): void {
  if (error.message) {
    Logger.error(error.message);
  }

  if (process.env.DEBUG) {
    console.error(chalk.dim("\nStack trace:"));
    console.error(chalk.dim(error.stack));
  }

  process.exit(1);
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
