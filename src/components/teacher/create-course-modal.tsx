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
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { courseContentService } from "@/services/course-content";
import type { CreateCourseInput } from "@/lib/api/teacher";

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (courseId: string) => void;
}

export function CreateCourseModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateCourseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCourseInput>({
    title: "",
    description: "",
    type: "free",
    price: 0,
    status: "draft",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Kurs nomini kiriting";
    } else if (formData.title.length < 3) {
      newErrors.title = "Kurs nomi kamida 3 ta belgidan iborat bo'lishi kerak";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Kurs tavsifini kiriting";
    } else if (formData.description.length < 10) {
      newErrors.description =
        "Kurs tavsifi kamida 10 ta belgidan iborat bo'lishi kerak";
    }

    if (formData.type === "paid" && (!formData.price || formData.price <= 0)) {
      newErrors.price = "Pullik kurs uchun narx kiriting";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const course = await courseContentService.createCourse({
        ...formData,
        price: formData.type === "paid" ? formData.price : 0,
      });

      if (course) {
        toast.success("Kurs muvaffaqiyatli yaratildi!");
        onOpenChange(false);
        resetForm();
        onSuccess?.(course.id);
      } else {
        toast.error("Kursni yaratishda xatolik yuz berdi");
      }
    } catch {
      toast.error("Kursni yaratishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "free",
      price: 0,
      status: "draft",
    });
    setErrors({});
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-gray-700 bg-gray-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            Yangi kurs yaratish
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Kurs ma&apos;lumotlarini kiriting. Kurs qoralama holatida
            yaratiladi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Kurs nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Masalan: Python dasturlash asoslari"
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
            <label className="text-sm font-medium text-white">
              Kurs tavsifi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Kurs haqida qisqacha ma'lumot..."
              rows={4}
              className={`w-full resize-none rounded-lg border bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:ring-1 focus:outline-none ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Kurs turi</label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="courseType"
                  checked={formData.type === "free"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, type: "free", price: 0 }))
                  }
                  className="h-4 w-4 border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-white">Bepul</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="courseType"
                  checked={formData.type === "paid"}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, type: "paid" }))
                  }
                  className="h-4 w-4 border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-white">Pullik</span>
              </label>
            </div>
          </div>

          {formData.type === "paid" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Narxi (UZS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="100000"
                min={0}
                className={`w-full rounded-lg border bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:ring-1 focus:outline-none ${
                  errors.price
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                }`}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
            className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yaratilmoqda...
              </>
            ) : (
              "Kurs yaratish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
