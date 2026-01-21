import { api } from "./client";
import { settingsEndpoints } from "./config";

export interface SocialLinks {
  telegram?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  facebook?: string | null;
}

export interface SiteSettings {
  id: string;
  siteTitle: string;
  siteDescription: string | null;
  siteKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string;
  twitterSite: string | null;
  twitterCreator: string | null;
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  faviconUrl: string | null;
  logoUrl: string | null;
  footerText: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  address: string | null;
  socialLinks: SocialLinks | null;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export interface UpdateSiteSettingsInput {
  siteTitle?: string;
  siteDescription?: string | null;
  siteKeywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCard?: "summary" | "summary_large_image";
  twitterSite?: string | null;
  twitterCreator?: string | null;
  googleAnalyticsId?: string | null;
  facebookPixelId?: string | null;
  faviconUrl?: string | null;
  logoUrl?: string | null;
  footerText?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  address?: string | null;
  socialLinks?: SocialLinks | null;
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
}

export interface TeacherPageSettings {
  id: string;
  teacherId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  bannerUrl: string | null;
  tagline: string | null;
  aboutText: string | null;
  telegramUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  showCoursesCount: boolean;
  showStudentsCount: boolean;
  showRating: boolean;
  featuredCourseIds: string[];
  publicEmail: string | null;
  publicPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherWithSettings {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  businessName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  hasPageSettings: boolean;
  pageSettings: TeacherPageSettings | null;
  coursesCount: number;
  studentsCount: number;
}

export interface TeacherSettingsDetail {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    username: string | null;
    businessName: string | null;
    logoUrl: string | null;
    primaryColor: string | null;
    specialization: string | null;
  };
  pageSettings: TeacherPageSettings;
}

export interface UpdateTeacherPageSettingsInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  bannerUrl?: string | null;
  tagline?: string | null;
  aboutText?: string | null;
  telegramUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  showCoursesCount?: boolean;
  showStudentsCount?: boolean;
  showRating?: boolean;
  featuredCourseIds?: string[];
  publicEmail?: string | null;
  publicPhone?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface ListTeachersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const settingsApi = {
  getSiteSettings: () =>
    api.get<SingleResponse<SiteSettings>>(settingsEndpoints.site),

  updateSiteSettings: (input: UpdateSiteSettingsInput) =>
    api.patch<SingleResponse<SiteSettings>>(settingsEndpoints.site, input),

  listTeachers: (params?: ListTeachersParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { teachers: TeacherWithSettings[]; pagination: Pagination };
    }>(`${settingsEndpoints.teachers}${query ? `?${query}` : ""}`);
  },

  getTeacherSettings: (teacherId: string) =>
    api.get<SingleResponse<TeacherSettingsDetail>>(
      settingsEndpoints.teacherById(teacherId)
    ),

  updateTeacherSettings: (
    teacherId: string,
    input: UpdateTeacherPageSettingsInput
  ) =>
    api.patch<SingleResponse<TeacherPageSettings>>(
      settingsEndpoints.teacherById(teacherId),
      input
    ),

  deleteTeacherSettings: (teacherId: string) =>
    api.delete<SingleResponse<{ deleted: boolean }>>(
      settingsEndpoints.teacherById(teacherId)
    ),
};

export default settingsApi;
