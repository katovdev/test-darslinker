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
  CreditCard,
  Upload,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  X,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { studentService } from "@/services/student";
import type { CoursePaymentInfo } from "@/lib/api/student";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentInfo: CoursePaymentInfo | null;
  onSuccess?: () => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  paymentInfo,
  onSuccess,
}: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!paymentInfo) return null;

  const { course, teacher, paymentInfo: payment } = paymentInfo;

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Nusxalandi!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Nusxalashda xatolik");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Faqat JPEG, PNG yoki WebP formatdagi rasmlar qabul qilinadi"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan oshmasligi kerak");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Chek rasmini yuklang");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await studentService.createPayment(
        course.id,
        course.price,
        selectedFile
      );

      if (result) {
        toast.success(
          "To'lov muvaffaqiyatli yuborildi! Tasdiqlanishini kuting."
        );
        onOpenChange(false);
        handleRemoveFile();
        onSuccess?.();
      } else {
        toast.error("To'lovni yuborishda xatolik yuz berdi");
      }
    } catch {
      toast.error("To'lovni yuborishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-700 bg-gray-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Kurs uchun to&apos;lov
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Quyidagi karta raqamiga to&apos;lovni amalga oshiring va chek
            rasmini yuklang
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            <h4 className="font-medium text-white">{course.title}</h4>
            <p className="mt-1 text-2xl font-bold text-emerald-500">
              {formatCurrency(course.price)}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              O&apos;qituvchi:{" "}
              {teacher.businessName ||
                `${teacher.firstName} ${teacher.lastName}`}
            </p>
          </div>

          <div className="space-y-3">
            {payment.cardNumber && (
              <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                <div>
                  <p className="text-xs text-gray-500">Karta raqami</p>
                  <p className="font-mono text-lg text-white">
                    {payment.cardNumber}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(payment.cardNumber!, "cardNumber")}
                  className="text-gray-400 hover:text-white"
                >
                  {copiedField === "cardNumber" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {payment.cardHolder && (
              <div className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                <div>
                  <p className="text-xs text-gray-500">Karta egasi</p>
                  <p className="text-white">{payment.cardHolder}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(payment.cardHolder!, "cardHolder")}
                  className="text-gray-400 hover:text-white"
                >
                  {copiedField === "cardHolder" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {payment.bankName && (
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500">Bank</p>
                <p className="text-white">{payment.bankName}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-500" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium">Muhim!</p>
                <p className="mt-1">
                  To&apos;lovni amalga oshirgandan so&apos;ng, chek yoki
                  skrinshot rasmini yuklang. To&apos;lov o&apos;qituvchi
                  tomonidan tekshirilgandan so&apos;ng kursga kirish ochiladi.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Chek rasmi</p>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-700 p-6 text-center transition-colors hover:border-emerald-500/50 hover:bg-gray-800/30"
              >
                <Upload className="mx-auto h-8 w-8 text-gray-500" />
                <p className="mt-2 text-sm text-gray-400">
                  Rasmni yuklash uchun bosing
                </p>
                <p className="text-xs text-gray-500">
                  JPEG, PNG, WebP (max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg border border-gray-700 bg-gray-800/50 p-2">
                <img
                  src={previewUrl}
                  alt="Check preview"
                  className="max-h-48 w-full rounded object-contain"
                />
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-3 right-3 rounded-full bg-gray-900/80 p-1 text-white transition-colors hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                  <ImageIcon className="h-4 w-4" />
                  {selectedFile?.name}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              "To'lovni yuborish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
