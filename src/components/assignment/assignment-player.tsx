"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  X,
  Check,
  Clock,
  Trophy,
  Calendar,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { assignmentsApi } from "@/lib/api/assignments";
import type { Assignment, AssignmentSubmission } from "@/types/assignment";
import { MarkdownRenderer } from "@/components/editor/markdown-renderer";

interface AssignmentPlayerProps {
  assignment: Assignment;
  submission?: AssignmentSubmission | null;
  onSubmissionComplete?: () => void;
}

export function AssignmentPlayer({
  assignment,
  submission,
  onSubmissionComplete,
}: AssignmentPlayerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("Fayl hajmi 50MB dan oshmasligi kerak");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Iltimos, fayl tanlang");
      return;
    }

    setUploading(true);
    try {
      await assignmentsApi.submitAssignment(assignment.id, file);
      toast.success("Topshiriq muvaffaqiyatli yuborildi!");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSubmissionComplete?.();
    } catch (error) {
      toast.error("Yuborishda xatolik yuz berdi");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue =
    assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const canSubmit = !submission || (submission && !submission.grade);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-500" />
              <h2 className="text-2xl font-bold text-white">
                {assignment.title}
              </h2>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Trophy className="h-4 w-4" />
                <span>Maksimal ball: {assignment.maxScore}</span>
              </div>

              {assignment.dueDate && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isOverdue ? "text-red-400" : "text-gray-400"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Muddat: {formatDate(assignment.dueDate)}</span>
                  {isOverdue && (
                    <span className="font-semibold text-red-500">
                      (Muddati o&apos;tgan)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {submission && (
            <div
              className={`rounded-lg px-4 py-2 ${
                submission.grade
                  ? "border border-emerald-500/30 bg-emerald-500/10"
                  : "border border-blue-500/30 bg-blue-500/10"
              }`}
            >
              {submission.grade ? (
                <div className="text-center">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="h-5 w-5" />
                    <span className="font-semibold">Baholangan</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {submission.grade}/{assignment.maxScore}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-blue-400">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Kutilmoqda</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Ko&apos;rsatmalar
        </h3>
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer content={assignment.instructions} />
        </div>
      </div>

      {/* Attachments from teacher */}
      {assignment.attachments && assignment.attachments.length > 0 && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Qo&apos;shimcha materiallar
          </h3>
          <div className="space-y-2">
            {assignment.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment.fileUrl}
                download
                className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3 transition-colors hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-white">{attachment.fileName}</span>
                </div>
                <Download className="h-4 w-4 text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Submission Section */}
      {submission ? (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Sizning topshiriqingiz
          </h3>

          <div className="space-y-4">
            {/* Submitted file */}
            <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-white">Yuborilgan fayl</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(submission.submittedAt)}
                  </p>
                </div>
              </div>
              <a
                href={submission.file.fileUrl}
                download
                className="text-emerald-500 hover:text-emerald-400"
              >
                <Download className="h-5 w-5" />
              </a>
            </div>

            {/* Grade and feedback */}
            {submission.grade !== null && submission.grade !== undefined && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Ball:</span>
                  <span className="text-2xl font-bold text-white">
                    {submission.grade}/{assignment.maxScore}
                  </span>
                </div>

                {submission.feedback && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      O&apos;qituvchi izohi:
                    </label>
                    <div className="mt-2 rounded-lg border border-gray-700 bg-gray-800 p-4">
                      <p className="text-white">{submission.feedback}</p>
                    </div>
                  </div>
                )}

                {submission.gradedAt && (
                  <p className="text-sm text-gray-400">
                    Baholangan: {formatDate(submission.gradedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : canSubmit ? (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Topshiriqni yuborish
          </h3>

          <div className="space-y-4">
            {/* File upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-700 p-8 text-center transition-colors hover:border-emerald-500/50 hover:bg-gray-800/30"
            >
              <Upload className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-3 text-white">
                {file ? file.name : "Faylni yuklash uchun bosing"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {file
                  ? `${formatFileSize(file.size)} - Yuborish uchun tugmani bosing`
                  : "PDF, DOCX, ZIP va boshqalar (max 50MB)"}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            {file && (
              <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-white">{file.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Topshiriqni yuborish
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
