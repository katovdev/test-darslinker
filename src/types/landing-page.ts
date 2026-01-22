// Landing Page Customization Types
// Allows platform owners to customize the public landing page

export interface LandingPageContent {
  id: string;
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroBackgroundImage?: string;

  // About Section
  aboutTitle: string;
  aboutContent: string; // Markdown
  aboutImage?: string;

  // Features Section
  featuresEnabled: boolean;
  features: Feature[];

  // Featured Courses
  featuredCoursesEnabled: boolean;
  featuredCourseIds: string[];

  // Testimonials
  testimonialsEnabled: boolean;
  testimonials: Testimonial[];

  // Stats
  statsEnabled: boolean;
  stats: PlatformStats;

  // CTA Section
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;

  // Footer
  footerAbout: string;
  socialLinks: SocialLink[];

  updatedAt: string;
}

export interface Feature {
  id: string;
  icon: string; // Emoji or icon name
  title: string;
  description: string;
  order: number;
}

export interface Testimonial {
  id: string;
  studentName: string;
  studentAvatar?: string;
  studentTitle?: string; // e.g., "Frontend Developer"
  content: string;
  rating: number;
  courseTitle?: string;
  order: number;
}

export interface PlatformStats {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  averageRating: number;
}

export interface SocialLink {
  platform:
    | "telegram"
    | "instagram"
    | "facebook"
    | "youtube"
    | "twitter"
    | "linkedin";
  url: string;
}

// DTOs
export interface UpdateLandingPageDto {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  aboutTitle?: string;
  aboutContent?: string;
  featuresEnabled?: boolean;
  features?: Feature[];
  featuredCoursesEnabled?: boolean;
  featuredCourseIds?: string[];
  testimonialsEnabled?: boolean;
  testimonials?: Testimonial[];
  statsEnabled?: boolean;
  stats?: PlatformStats;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  footerAbout?: string;
  socialLinks?: SocialLink[];
}

export interface UploadLandingImageDto {
  section: "hero" | "about";
  file: File;
}
