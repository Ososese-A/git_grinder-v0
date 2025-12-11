import axios, { AxiosInstance } from "axios";
import { ConfigService } from "./config.service.js";
import { ActivityPayload } from "../types";
import { Logger } from "../utils/logger.js";

export class TrackingService {
  private static client: AxiosInstance | null = null;

  private static getClient(): AxiosInstance {
    if (!this.client) {
      const config = ConfigService.load();

      this.client = axios.create({
        baseURL: config.apiEndpoint,
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
          ...(config.apiToken && {
            Authorization: `Bearer ${config.apiToken}`,
          }),
        },
      });
    }

    return this.client;
  }

  static async track(payload: ActivityPayload): Promise<void> {
    const config = ConfigService.load();

    if (!config.trackingEnabled) {
      return;
    }

    if (!config.apiToken) {
      Logger.debug("Skipping tracking - no API token configured");
      return;
    }

    try {
      const data = {
        ...payload,
        timestamp: new Date().toISOString(),
        userId: config.userId,
      };

      await this.getClient().post("/api/activity", data);
      Logger.debug("Activity tracked successfully");
    } catch (error) {
      // Fail silently - don't interrupt user workflow
      Logger.debug(`Could not track activity: ${(error as Error).message}`);
    }
  }

  static async getRecommendations(context: any): Promise<string[]> {
    const config = ConfigService.load();

    if (!config.apiToken) {
      return [];
    }

    try {
      const response = await this.getClient().post(
        "/api/recommendations",
        context
      );
      return response.data.tips || [];
    } catch (error) {
      Logger.debug(
        `Could not fetch recommendations: ${(error as Error).message}`
      );
      return [];
    }
  }
}
