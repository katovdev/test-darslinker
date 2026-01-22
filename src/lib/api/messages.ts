import { api } from "./client";
import type {
  Message,
  Chat,
  ChatListItem,
  MessagePagination,
  CreateMessageDto,
} from "@/types/message";

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

interface ListResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ListChatsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListMessagesParams {
  chatId: string;
  cursor?: string; // For pagination
  limit?: number;
}

export const messagesApi = {
  // Chat endpoints
  listChats: (params?: ListChatsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return api.get<ListResponse<ChatListItem>>(
      `/messages/chats${query ? `?${query}` : ""}`
    );
  },

  getChat: (chatId: string) =>
    api.get<SingleResponse<Chat>>(`/messages/chats/${chatId}`),

  createChat: (recipientId: string) =>
    api.post<SingleResponse<Chat>>("/messages/chats", { recipientId }),

  deleteChat: (chatId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/messages/chats/${chatId}`
    ),

  // Message endpoints
  listMessages: (params: ListMessagesParams) => {
    const searchParams = new URLSearchParams();
    if (params.cursor) searchParams.set("cursor", params.cursor);
    if (params.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return api.get<SingleResponse<MessagePagination>>(
      `/messages/${params.chatId}/messages${query ? `?${query}` : ""}`
    );
  },

  sendMessage: async (data: CreateMessageDto) => {
    const formData = new FormData();
    formData.append("content", data.content);
    if (data.chatId) formData.append("chatId", data.chatId);
    if (data.recipientId) formData.append("recipientId", data.recipientId);

    data.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });

    return api.post<SingleResponse<Message>>("/messages", formData);
  },

  markAsRead: (messageId: string) =>
    api.patch<SingleResponse<Message>>(`/messages/${messageId}/read`),

  markChatAsRead: (chatId: string) =>
    api.patch<{ success: boolean; count: number }>(
      `/messages/chats/${chatId}/read-all`
    ),

  deleteMessage: (messageId: string) =>
    api.delete<{ success: boolean; message: string }>(`/messages/${messageId}`),

  // Real-time polling
  poll: (chatId: string, lastChecked?: string) => {
    const searchParams = new URLSearchParams();
    if (lastChecked) searchParams.set("since", lastChecked);

    const query = searchParams.toString();
    return api.get<SingleResponse<Message[]>>(
      `/messages/${chatId}/poll${query ? `?${query}` : ""}`
    );
  },

  // Unread count
  getUnreadCount: () =>
    api.get<SingleResponse<{ count: number }>>("/messages/unread-count"),
};

export default messagesApi;
