// Platform Theme Customization Types
// Allows platform owners to customize colors, fonts, and branding

export interface PlatformTheme {
  id: string;
  // Colors
  primaryColor: string; // Hex color (e.g., #10b981)
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;

  // Typography
  fontFamily: FontOption;
  headingFont?: FontOption;

  // Branding
  logoUrl?: string;
  faviconUrl?: string;
  brandName: string;

  // Advanced
  borderRadius: "none" | "sm" | "md" | "lg" | "xl";
  darkMode: boolean;

  updatedAt: string;
}

export type FontOption =
  | "inter"
  | "roboto"
  | "poppins"
  | "montserrat"
  | "lato"
  | "open-sans"
  | "raleway"
  | "ubuntu";

export interface FontPreset {
  value: FontOption;
  label: string;
  preview: string; // Font family for preview
}

export interface ColorPreset {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// DTOs
export interface UpdateThemeDto {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: FontOption;
  headingFont?: FontOption;
  brandName?: string;
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
  darkMode?: boolean;
}

export interface UploadBrandingDto {
  type: "logo" | "favicon";
  file: File;
}

// Predefined presets
export const COLOR_PRESETS: ColorPreset[] = [
  {
    name: "Emerald (Default)",
    primaryColor: "#10b981",
    secondaryColor: "#059669",
    accentColor: "#34d399",
  },
  {
    name: "Blue Ocean",
    primaryColor: "#3b82f6",
    secondaryColor: "#2563eb",
    accentColor: "#60a5fa",
  },
  {
    name: "Purple Dream",
    primaryColor: "#8b5cf6",
    secondaryColor: "#7c3aed",
    accentColor: "#a78bfa",
  },
  {
    name: "Orange Sunset",
    primaryColor: "#f97316",
    secondaryColor: "#ea580c",
    accentColor: "#fb923c",
  },
  {
    name: "Pink Rose",
    primaryColor: "#ec4899",
    secondaryColor: "#db2777",
    accentColor: "#f472b6",
  },
  {
    name: "Teal Fresh",
    primaryColor: "#14b8a6",
    secondaryColor: "#0d9488",
    accentColor: "#2dd4bf",
  },
];

export const FONT_PRESETS: FontPreset[] = [
  { value: "inter", label: "Inter", preview: "Inter, sans-serif" },
  { value: "roboto", label: "Roboto", preview: "Roboto, sans-serif" },
  { value: "poppins", label: "Poppins", preview: "Poppins, sans-serif" },
  {
    value: "montserrat",
    label: "Montserrat",
    preview: "Montserrat, sans-serif",
  },
  { value: "lato", label: "Lato", preview: "Lato, sans-serif" },
  {
    value: "open-sans",
    label: "Open Sans",
    preview: "'Open Sans', sans-serif",
  },
  { value: "raleway", label: "Raleway", preview: "Raleway, sans-serif" },
  { value: "ubuntu", label: "Ubuntu", preview: "Ubuntu, sans-serif" },
];
