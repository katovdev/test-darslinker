"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
  Clock,
  Trophy,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { assignmentsApi } from "@/lib/api/assignments";
import type { Assignment, CreateAssignmentDto } from "@/types/assignment";
import { MarkdownEditor } from "@/components/editor/markdown-editor";

interface AssignmentEditorProps {
  lessonId: string;
  assignment?: Assignment | null;
  onSave: (assignment: Assignment) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function AssignmentEditor({
  lessonId,
  assignment,
  onSave,
  onCancel,
  onDelete,
}: AssignmentEditorProps) {
  const isEditing = !!assignment;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: assignment?.title || "",
    instructions: assignment?.instructions || "",
    maxScore: assignment?.maxScore || 100,
    dueDate: assignment?.dueDate || undefined,
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Topshiriq nomini kiriting";
    } else if (formData.title.length < 3) {
      newErrors.title =
        "Topshiriq nomi kamida 3 ta belgidan iborat bo'lishi kerak";
    }

    if (!formData.instructions.trim()) {
      newErrors.instructions = "Ko'rsatmalarni kiriting";
    } else if (formData.instructions.length < 10) {
      newErrors.instructions =
        "Ko'rsatmalar kamida 10 ta belgidan iborat bo'lishi kerak";
    }

    if (formData.maxScore < 1 || formData.maxScore > 100) {
      newErrors.maxScore = "Maksimal ball 1 dan 100 gacha bo'lishi kerak";
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (dueDate < new Date()) {
        newErrors.dueDate = "Muddat kelajakda bo'lishi kerak";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let result: Assignment;

      if (isEditing && assignment) {
        const { data } = await assignmentsApi.updateAssignment(assignment.id, {
          title: formData.title,
          instructions: formData.instructions,
          maxScore: formData.maxScore,
          dueDate: formData.dueDate,
        });
        result = data;
      } else {
        const { data } = await assignmentsApi.createAssignment({
          lessonId,
          title: formData.title,
          instructions: formData.instructions,
          maxScore: formData.maxScore,
          dueDate: formData.dueDate,
          attachments,
        });
        result = data;
      }

      toast.success(isEditing ? "Topshiriq yangilandi" : "Topshiriq yaratildi");
      onSave(result);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!assignment || !onDelete) return;
    if (
      !confirm(
        "Bu topshiriqni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await assignmentsApi.deleteAssignment(assignment.id);
      toast.success("Topshiriq o'chirildi");
      onDelete();
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file size (max 10MB per file)
    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error(
        "Ba'zi fayllar 10MB dan katta. Iltimos, kichikroq fayllar tanlang."
      );
      return;
    }

    setAttachments((prev) => [...prev, ...files]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-700 bg-gray-900 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-emerald-500" />
            {isEditing ? "Topshiriqni tahrirlash" : "Yangi topshiriq"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? "Topshiriq ma'lumotlarini tahrirlang"
              : "Talabalar uchun yangi topshiriq yarating"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Topshiriq nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Masalan: 1-modul bo'yicha amaliy topshiriq"
              className={`w-full rounded-lg border bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:ring-1 focus:outline-none ${
                errors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Ko&apos;rsatmalar <span className="text-red-500">*</span>
            </label>
            <MarkdownEditor
              value={formData.instructions}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, instructions: value }))
              }
              placeholder="Topshiriq bo'yicha batafsil ko'rsatmalar, talablar va mezonlarni kiriting..."
              minHeight={200}
            />
            {errors.instructions && (
              <p className="text-sm text-red-500">{errors.instructions}</p>
            )}
          </div>

          {/* Max Score and Due Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white">
                <Trophy className="h-4 w-4" />
                Maksimal ball <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.maxScore}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxScore: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="100"
                min={1}
                max={100}
                className={`w-full rounded-lg border bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:ring-1 focus:outline-none ${
                  errors.maxScore
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                }`}
              />
              {errors.maxScore && (
                <p className="text-sm text-red-500">{errors.maxScore}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white">
                <Calendar className="h-4 w-4" />
                Topshirish muddati
              </label>
              <input
                type="datetime-local"
                value={
                  formData.dueDate
                    ? new Date(formData.dueDate).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value || undefined,
                  }))
                }
                className={`w-full rounded-lg border bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:ring-1 focus:outline-none ${
                  errors.dueDate
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                }`}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Qo&apos;shimcha materiallar
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-700 p-4 text-center transition-colors hover:border-emerald-500/50 hover:bg-gray-800/30"
            >
              <Upload className="mx-auto h-6 w-6 text-gray-500" />
              <p className="mt-2 text-sm text-gray-400">
                Fayllarni yuklash uchun bosing
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOCX, ZIP va boshqalar (max 10MB har biri)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-white">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {isEditing && onDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                O&apos;chirish
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isDeleting}
              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isDeleting}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : isEditing ? (
                "Saqlash"
              ) : (
                "Yaratish"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
