import { api } from "./client";
import type { PlatformTheme, UpdateThemeDto } from "@/types/theme";

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export const themeApi = {
  // Get current theme (public)
  getTheme: () => api.get<SingleResponse<PlatformTheme>>("/theme"),

  // Admin endpoints
  updateTheme: (data: UpdateThemeDto) =>
    api.put<SingleResponse<PlatformTheme>>("/admin/theme", data),

  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<SingleResponse<{ logoUrl: string }>>(
      "/admin/theme/logo",
      formData
    );
  },

  uploadFavicon: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<SingleResponse<{ faviconUrl: string }>>(
      "/admin/theme/favicon",
      formData
    );
  },

  // Reset to default theme
  resetTheme: () =>
    api.post<SingleResponse<PlatformTheme>>("/admin/theme/reset", {}),

  // Preview theme changes
  previewTheme: (data: UpdateThemeDto) =>
    api.post<SingleResponse<PlatformTheme>>("/admin/theme/preview", data),
};

export default themeApi;
