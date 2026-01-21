import { api } from "./client";
import { studentEndpoints } from "./config";
import type { Pagination } from "./teacher";

export interface StudentPayment {
  id: string;
  amount: number;
  checkImageUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
  };
}

export interface CoursePaymentInfo {
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    username: string | null;
    businessName: string | null;
  };
  paymentInfo: {
    cardNumber: string | null;
    maskedCardNumber: string | null;
    bankName: string | null;
    cardHolder: string | null;
  };
  hasPendingPayment: boolean;
  pendingPaymentId: string | null;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
}

export const studentApi = {
  getCoursePaymentInfo: (courseId: string) =>
    api.get<SingleResponse<CoursePaymentInfo>>(
      studentEndpoints.coursePaymentInfo(courseId)
    ),

  createPayment: async (courseId: string, amount: number, checkImage: File) => {
    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("amount", amount.toString());
    formData.append("checkImage", checkImage);

    return api.upload<SingleResponse<StudentPayment>>(
      studentEndpoints.payments,
      formData
    );
  },

  getPayment: (paymentId: string) =>
    api.get<SingleResponse<StudentPayment>>(
      studentEndpoints.paymentById(paymentId)
    ),

  listPayments: (params?: ListPaymentsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { payments: StudentPayment[]; pagination: Pagination };
    }>(`${studentEndpoints.payments}${query ? `?${query}` : ""}`);
  },
};

export default studentApi;
