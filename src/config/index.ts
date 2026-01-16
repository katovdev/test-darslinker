/**
 * Application configuration
 * Uses Next.js environment variables
 */

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Dars Linker",
    description: "O'zbekiston EdTech Platformasi",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api",
  },
  routes: {
    home: "/",
    login: "/login",
    register: "/register",
    dashboard: "/dashboard",
    courses: "/courses",
    profile: "/profile",
  },
} as const;

export const UserRoles = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
