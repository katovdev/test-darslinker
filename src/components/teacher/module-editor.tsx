"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layers, Loader2, Trash2 } from "lucide-react";
import { courseContentService } from "@/services/course-content";
import type { Module, CreateModuleInput, UpdateModuleInput } from "@/lib/api/course-content";

interface ModuleEditorProps {
  courseId: string;
  module?: Module | null;
  onSave: (module: Module) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function ModuleEditor({
  courseId,
  module,
  onSave,
  onCancel,
  onDelete,
}: ModuleEditorProps) {
  const isEditing = !!module;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CreateModuleInput>({
    title: module?.title || "",
    description: module?.description || "",
    order: module?.order,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Modul nomini kiriting";
    } else if (formData.title.length < 2) {
      newErrors.title = "Modul nomi kamida 2 ta belgidan iborat bo'lishi kerak";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let result: Module | null;

      if (isEditing && module) {
        const updateInput: UpdateModuleInput = {
          title: formData.title,
          description: formData.description || null,
        };
        result = await courseContentService.updateModule(module.id, updateInput);
      } else {
        result = await courseContentService.createModule(courseId, formData);
      }

      if (result) {
        onSave(result);
      }
    } catch {
      // Error handling is done in the service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!module || !onDelete) return;
    if (!confirm("Bu modulni o'chirishni xohlaysizmi? Modul ichidagi barcha darslar ham o'chiriladi.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await courseContentService.deleteModule(module.id);
      if (success) {
        onDelete();
      }
    } catch {
      // Error handling is done in the service
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="border-gray-700 bg-gray-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Layers className="h-5 w-5 text-emerald-500" />
            {isEditing ? "Modulni tahrirlash" : "Yangi modul"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? "Modul ma'lumotlarini tahrirlang"
              : "Yangi modul yarating"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Modul nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Masalan: Kirish"
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Tavsif</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Modul haqida qisqacha..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
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
