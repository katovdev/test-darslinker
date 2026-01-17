/**
 * Onboarding API Module
 * Handles teacher onboarding (become a teacher) endpoints
 */

import { api } from "./client";
import { onboardingEndpoints } from "./config";
import { logger } from "../logger";

// ============================================================================
// Types
// ============================================================================

export interface OnboardingRequest {
  username: string;
  businessName?: string;
  bio?: string;
  socialLinks?: {
    telegram?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
}

export interface OnboardingStatus {
  status: "none" | "pending" | "approved" | "rejected";
  requestId: string | null;
  requestedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  requestData: OnboardingRequest | null;
}

export interface OnboardingComplete {
  teacherId: string;
  username: string;
  subdomain: string;
  message: string;
}

// Response types
export interface OnboardingRequestResponse {
  success: boolean;
  data: {
    requestId: string;
    message: string;
  };
}

export interface OnboardingStatusResponse {
  success: boolean;
  data: OnboardingStatus;
}

export interface OnboardingCompleteResponse {
  success: boolean;
  data: OnboardingComplete;
}

// ============================================================================
// API Class
// ============================================================================

/**
 * Onboarding API Service
 * For becoming a teacher
 */
class OnboardingAPI {
  /**
   * Request to become a teacher
   * Submits application for admin review
   */
  async requestTeacher(
    data: OnboardingRequest
  ): Promise<OnboardingRequestResponse> {
    try {
      return await api.post<OnboardingRequestResponse>(
        onboardingEndpoints.request,
        data
      );
    } catch (error) {
      logger.error("Error requesting teacher status:", error);
      throw error;
    }
  }

  /**
   * Complete onboarding after approval
   * Sets up the teacher account and subdomain
   */
  async completeOnboarding(): Promise<OnboardingCompleteResponse> {
    try {
      return await api.post<OnboardingCompleteResponse>(
        onboardingEndpoints.complete
      );
    } catch (error) {
      logger.error("Error completing onboarding:", error);
      throw error;
    }
  }

  /**
   * Get current onboarding status
   * Returns the status of teacher application
   */
  async getStatus(): Promise<OnboardingStatusResponse> {
    try {
      return await api.get<OnboardingStatusResponse>(
        onboardingEndpoints.status
      );
    } catch (error) {
      logger.error("Error fetching onboarding status:", error);
      throw error;
    }
  }
}

export const onboardingAPI = new OnboardingAPI();
export default onboardingAPI;
