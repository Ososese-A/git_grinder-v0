import fs from "fs";
import path from "path";
import os from "os";
import { GrinderConfig } from "../types/index.js";

const DEFAULT_CONFIG: GrinderConfig = {
  apiEndpoint: "https://api.gitgrinder.com",
  trackingEnabled: true,
};

export class ConfigService {
  private static configDir = path.join(os.homedir(), ".config", "git-grinder");
  private static configFile = path.join(ConfigService.configDir, "config.json");

  static getConfigPath(): string {
    return this.configFile;
  }

  static load(): GrinderConfig {
    try {
      if (!fs.existsSync(this.configFile)) {
        return { ...DEFAULT_CONFIG };
      }

      const content = fs.readFileSync(this.configFile, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    } catch (error) {
      return { ...DEFAULT_CONFIG };
    }
  }

  static save(config: GrinderConfig): void {
    try {
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }

      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${(error as Error).message}`);
    }
  }

  static reset(): void {
    if (fs.existsSync(this.configFile)) {
      fs.unlinkSync(this.configFile);
    }
  }
}
