import { TrackingService } from "./tracking.service.js";
import { Logger } from "../utils/logger.js";

interface PostCommitContext {
  commitHash: string;
  branch: string;
  hasRemote: boolean;
  filesChanged?: number;
  message?: string;
}

export class RecommendationService {
  static async getPostCommitTips(
    context: PostCommitContext
  ): Promise<string[]> {
    const tips: string[] = [];

    try {
      // Local recommendations
      if (context.hasRemote) {
        tips.push("Push your changes: grinder push");
      } else {
        tips.push("Set up remote: git remote add origin <url>");
      }

      const protectedBranches = ["main", "master", "production"];
      if (protectedBranches.includes(context.branch)) {
        tips.push("Consider creating a feature branch");
      }

      // Try to get API recommendations (non-blocking)
      try {
        const apiTips = await TrackingService.getRecommendations({
          action: "post-commit",
          ...context,
        });
        tips.push(...apiTips);
      } catch (error) {
        Logger.debug(`Could not fetch API recommendations`);
      }
    } catch (error) {
      Logger.debug(`Error generating recommendations`);
    }

    return tips.slice(0, 3);
  }
}
