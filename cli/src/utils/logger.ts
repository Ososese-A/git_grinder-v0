import chalk from "chalk";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel): void {
    this.level = level;
  }

  static debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  }

  static info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.blue(`ℹ ${message}`));
    }
  }

  static success(message: string): void {
    console.log(chalk.green(`✓ ${message}`));
  }

  static warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(chalk.yellow(`⚠️  ${message}`));
    }
  }

  static error(message: string): void {
    console.error(chalk.red(`❌ ${message}`));
  }

  static dim(message: string): void {
    console.log(chalk.dim(message));
  }
}
