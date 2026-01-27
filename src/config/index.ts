export const config = {
  app: {
    name: "Darslinker",
    description: "O'zbekiston EdTech Platformasi",
    version: "1.0.0",
  },
  api: {
    baseUrl: "https://api.darslinker.uz/api",
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
  MODERATOR: "moderator",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
