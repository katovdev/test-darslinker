import { api } from "./client";
import { blogEndpoints } from "./config";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
  blogsCount?: number;
}

export interface BlogAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  content?: string;
  thumbnail?: string | null;
  status: "draft" | "published" | "archived";
  isArchive?: boolean;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string | null;
  category?: BlogCategory | null;
  author: BlogAuthor;
  likesCount: number;
  isLiked?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BlogsResponse {
  success: boolean;
  data: {
    blogs: Blog[];
    pagination: Pagination;
  };
}

export interface BlogResponse {
  success: boolean;
  data: Blog;
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: BlogCategory[];
    pagination: Pagination;
  };
}

export interface CategoryResponse {
  success: boolean;
  data: BlogCategory;
}

export interface LikeResponse {
  success: boolean;
  data: {
    liked: boolean;
    likesCount: number;
  };
}

export interface BlogQueryParams {
  search?: string;
  categoryId?: string;
  status?: "draft" | "published" | "archived";
  limit?: number;
  page?: number;
}

export interface CreateBlogInput {
  title: string;
  subtitle?: string;
  content: string;
  thumbnail?: string;
  categoryId?: string;
  status?: "draft" | "published";
}

export interface UpdateBlogInput {
  title?: string;
  subtitle?: string | null;
  content?: string;
  thumbnail?: string | null;
  categoryId?: string | null;
  status?: "draft" | "published" | "archived";
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

export const blogApi = {
  getBlogs: (params?: BlogQueryParams) => {
    const query = params
      ? buildQueryString(params as Record<string, unknown>)
      : "";
    return api.get<BlogsResponse>(
      `${blogEndpoints.getAllBlogs}${query ? `?${query}` : ""}`
    );
  },

  getBlogBySlug: (slug: string) => {
    return api.get<BlogResponse>(blogEndpoints.getBlogBySlug(slug));
  },

  toggleLike: (blogId: string) => {
    return api.post<LikeResponse>(blogEndpoints.toggleLike(blogId));
  },

  getCategories: (params?: { page?: number; limit?: number }) => {
    const query = params
      ? buildQueryString(params as Record<string, unknown>)
      : "";
    return api.get<CategoriesResponse>(
      `${blogEndpoints.getCategories}${query ? `?${query}` : ""}`
    );
  },
};

export const adminBlogApi = {
  getBlogs: (params?: BlogQueryParams) => {
    const query = params
      ? buildQueryString(params as Record<string, unknown>)
      : "";
    return api.get<BlogsResponse>(
      `${blogEndpoints.adminBlogs}${query ? `?${query}` : ""}`
    );
  },

  getBlog: (id: string) => {
    return api.get<BlogResponse>(blogEndpoints.adminBlogById(id));
  },

  createBlog: (input: CreateBlogInput) => {
    return api.post<BlogResponse>(blogEndpoints.adminBlogs, input);
  },

  updateBlog: (id: string, input: UpdateBlogInput) => {
    return api.patch<BlogResponse>(blogEndpoints.adminBlogById(id), input);
  },

  deleteBlog: (id: string) => {
    return api.delete<{ success: boolean; data: { deleted: boolean } }>(
      blogEndpoints.adminBlogById(id)
    );
  },

  getCategories: (params?: {
    page?: number;
    limit?: number;
    activeOnly?: boolean;
  }) => {
    const query = params
      ? buildQueryString(params as Record<string, unknown>)
      : "";
    return api.get<CategoriesResponse>(
      `${blogEndpoints.adminCategories}${query ? `?${query}` : ""}`
    );
  },

  getCategory: (id: string) => {
    return api.get<CategoryResponse>(blogEndpoints.adminCategoryById(id));
  },

  createCategory: (input: CreateCategoryInput) => {
    return api.post<CategoryResponse>(blogEndpoints.adminCategories, input);
  },

  updateCategory: (id: string, input: UpdateCategoryInput) => {
    return api.patch<CategoryResponse>(
      blogEndpoints.adminCategoryById(id),
      input
    );
  },

  deleteCategory: (id: string) => {
    return api.delete<{ success: boolean; data: { deleted: boolean } }>(
      blogEndpoints.adminCategoryById(id)
    );
  },
};

export default blogApi;
