"use client";

import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Archive,
  File,
  ExternalLink,
} from "lucide-react";
import type { FileLesson } from "@/types/file-lesson";

interface FilePlayerProps {
  fileLesson: FileLesson;
}

const FILE_TYPE_ICONS = {
  pdf: FileText,
  docx: FileText,
  image: ImageIcon,
  video: File,
  archive: Archive,
};

const FILE_TYPE_COLORS = {
  pdf: "text-red-500 bg-red-500/10 border-red-500/30",
  docx: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  image: "text-green-500 bg-green-500/10 border-green-500/30",
  video: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  archive: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
};

export function FilePlayer({ fileLesson }: FilePlayerProps) {
  const handleDownload = () => {
    window.open(fileLesson.file.fileUrl, "_blank");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    const Icon =
      FILE_TYPE_ICONS[type as keyof typeof FILE_TYPE_ICONS] || FileText;
    return <Icon className="h-12 w-12" />;
  };

  const canPreview =
    fileLesson.file.fileCategoryType === "pdf" ||
    fileLesson.file.fileCategoryType === "image";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-lg border ${
              FILE_TYPE_COLORS[
                fileLesson.file
                  .fileCategoryType as keyof typeof FILE_TYPE_COLORS
              ] || "border-gray-500/30 bg-gray-500/10 text-gray-500"
            }`}
          >
            {getFileIcon(fileLesson.file.fileCategoryType)}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              {fileLesson.title}
            </h2>

            {fileLesson.description && (
              <p className="mt-2 text-gray-400">{fileLesson.description}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="rounded bg-gray-700 px-2 py-1 text-xs uppercase">
                  {fileLesson.file.fileCategoryType}
                </span>
              </div>
              <div>
                <span className="font-semibold">
                  {fileLesson.file.fileName}
                </span>
              </div>
              <div>
                <span>{formatFileSize(fileLesson.file.fileSize)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleDownload}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Yuklab olish
          </Button>

          {canPreview && (
            <Button
              variant="outline"
              onClick={() => window.open(fileLesson.file.fileUrl, "_blank")}
              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Yangi oynada ochish
            </Button>
          )}
        </div>
      </div>

      {/* Preview */}
      {canPreview && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Ko&apos;rib chiqish
          </h3>

          {fileLesson.file.fileCategoryType === "pdf" && (
            <div className="overflow-hidden rounded-lg border border-gray-700">
              <iframe
                src={fileLesson.file.fileUrl}
                className="h-[600px] w-full bg-white"
                title={fileLesson.title}
              />
            </div>
          )}

          {fileLesson.file.fileCategoryType === "image" && (
            <div className="overflow-hidden rounded-lg border border-gray-700">
              <img
                src={fileLesson.file.fileUrl}
                alt={fileLesson.title}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      {!canPreview && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <div className="text-center">
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                FILE_TYPE_COLORS[
                  fileLesson.file
                    .fileCategoryType as keyof typeof FILE_TYPE_COLORS
                ] || "border-gray-500/30 bg-gray-500/10 text-gray-500"
              }`}
            >
              {getFileIcon(fileLesson.file.fileCategoryType)}
            </div>
            <h3 className="text-lg font-semibold text-white">
              Bu fayl turini brauzerda ko&apos;rib bo&apos;lmaydi
            </h3>
            <p className="mt-2 text-gray-400">
              Faylni yuklab olib, kompyuteringizda oching
            </p>
            <Button
              onClick={handleDownload}
              className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Yuklab olish
            </Button>
          </div>
        </div>
      )}

      {/* File Info */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Fayl ma&apos;lumotlari
        </h3>
        <dl className="grid gap-3">
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <dt className="text-gray-400">Fayl nomi:</dt>
            <dd className="font-medium text-white">
              {fileLesson.file.fileName}
            </dd>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <dt className="text-gray-400">Turi:</dt>
            <dd className="font-medium text-white uppercase">
              {fileLesson.file.fileCategoryType}
            </dd>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <dt className="text-gray-400">Hajmi:</dt>
            <dd className="font-medium text-white">
              {formatFileSize(fileLesson.file.fileSize)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
