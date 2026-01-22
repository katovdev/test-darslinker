// Messaging System Types
// Teacher-student and student-teacher messaging

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    role: "teacher" | "student";
  };
  recipientId: string;
  content: string;
  attachments?: MessageAttachment[];
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface Chat {
  id: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: "teacher" | "student";
  };
  joinedAt: string;
  lastReadAt?: string;
}

export interface CreateMessageDto {
  chatId?: string; // If null, create new chat
  recipientId: string;
  content: string;
  attachments?: File[];
}

export interface ChatListItem {
  chat: Chat;
  otherParticipant: ChatParticipant;
  unreadCount: number;
  lastActivity: string;
}

export interface MessagePagination {
  messages: Message[];
  hasMore: boolean;
  cursor?: string; // For pagination
}

// Real-time events
export interface MessageEvent {
  type: "new_message" | "message_read" | "typing" | "stopped_typing";
  chatId: string;
  userId: string;
  data?: unknown;
}

// Helper functions
export function getOtherParticipant(
  chat: Chat,
  currentUserId: string
): ChatParticipant | undefined {
  return chat.participants.find((p) => p.userId !== currentUserId);
}

export function formatMessageTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) {
    return created.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffDays < 7) {
    return created.toLocaleDateString("en-US", { weekday: "short" });
  }
  return created.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function groupMessagesByDate(
  messages: Message[]
): Record<string, Message[]> {
  const groups: Record<string, Message[]> = {};

  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    const key = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(message);
  });

  return groups;
}

export function sortChatsByLastActivity(chats: ChatListItem[]): ChatListItem[] {
  return chats.sort((a, b) => {
    const timeA = new Date(a.lastActivity).getTime();
    const timeB = new Date(b.lastActivity).getTime();
    return timeB - timeA;
  });
}
