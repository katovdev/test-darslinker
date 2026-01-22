import { api } from "./client";
import type {
  LandingPageContent,
  UpdateLandingPageDto,
} from "@/types/landing-page";

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export const landingPageApi = {
  // Get current landing page content (public)
  getContent: () =>
    api.get<SingleResponse<LandingPageContent>>("/landing-page"),

  // Admin endpoints
  updateContent: (data: UpdateLandingPageDto) =>
    api.put<SingleResponse<LandingPageContent>>("/admin/landing-page", data),

  uploadHeroImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<SingleResponse<{ imageUrl: string }>>(
      "/admin/landing-page/hero-image",
      formData
    );
  },

  uploadAboutImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<SingleResponse<{ imageUrl: string }>>(
      "/admin/landing-page/about-image",
      formData
    );
  },

  // Preview changes before publishing
  previewContent: (data: UpdateLandingPageDto) =>
    api.post<SingleResponse<LandingPageContent>>(
      "/admin/landing-page/preview",
      data
    ),
};

export default landingPageApi;
