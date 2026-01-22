// File Lesson Types
// Supports PDF, DOCX, images, and archive files as lesson content

export type FileType = "pdf" | "docx" | "image" | "archive" | "other";

export interface FileLesson {
  id: string;
  lessonId: string;
  title: string;
  description: string; // Markdown content
  file: FileLessonFile;
  createdAt: string;
  updatedAt: string;
}

export interface FileLessonFile {
  fileName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  fileType: string; // mime type
  fileCategoryType: FileType; // Categorized type for UI
  uploadedAt: string;
}

export interface CreateFileLessonDto {
  lessonId: string;
  title: string;
  description: string;
  file: File;
}

export interface UpdateFileLessonDto {
  title?: string;
  description?: string;
  file?: File; // Optional file replacement
}

// File validation
export interface FileValidationRule {
  maxSize: number; // in bytes
  allowedTypes: string[]; // mime types
}

export const FILE_VALIDATION_RULES: Record<FileType, FileValidationRule> = {
  pdf: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ["application/pdf"],
  },
  docx: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ],
  },
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },
  archive: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      "application/zip",
      "application/x-zip-compressed",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
    ],
  },
  other: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [], // Allow all
  },
};

// Helper functions
export function getFileType(mimeType: string): FileType {
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  )
    return "docx";
  if (mimeType.startsWith("image/")) return "image";
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType === "application/x-7z-compressed"
  )
    return "archive";
  return "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function validateFile(
  file: File,
  type: FileType
): { valid: boolean; error?: string } {
  const rules = FILE_VALIDATION_RULES[type];

  if (file.size > rules.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(rules.maxSize)}`,
    };
  }

  if (
    rules.allowedTypes.length > 0 &&
    !rules.allowedTypes.includes(file.type)
  ) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}

export function getFileIcon(fileType: FileType): string {
  switch (fileType) {
    case "pdf":
      return "📄";
    case "docx":
      return "📝";
    case "image":
      return "🖼️";
    case "archive":
      return "📦";
    default:
      return "📎";
  }
}

export function canPreviewFile(fileType: FileType): boolean {
  return fileType === "pdf" || fileType === "image";
}
