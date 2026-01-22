"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-locale";
import { toast } from "sonner";

interface PaymentInfo {
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
    username: string;
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

export default function CoursePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const t = useTranslations();

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkImage, setCheckImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentInfo = async () => {
      try {
        const response = await fetch(
          `/api/student/courses/${courseId}/payment-info`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();

        if (data.success) {
          setPaymentInfo(data.data);
        } else {
          toast.error("Failed to load payment information");
        }
      } catch (error) {
        console.error("Error loading payment info:", error);
        toast.error("Failed to load payment information");
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentInfo();
  }, [courseId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setCheckImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkImage) {
      toast.error("Please upload a payment receipt");
      return;
    }

    if (!paymentInfo) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("amount", paymentInfo.course.price.toString());
      formData.append("checkImage", checkImage);

      const response = await fetch("/api/student/payments", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Payment submitted successfully! Waiting for teacher approval."
        );
        router.push("/dashboard/payments");
      } else {
        toast.error(data.error?.message || "Failed to submit payment");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to submit payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-400">Failed to load payment information</p>
          <Link href="/courses">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (paymentInfo.hasPendingPayment) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/dashboard/payments"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments
          </Link>

          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
              <CheckCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">
              Payment Pending
            </h1>
            <p className="mb-6 text-gray-400">
              You already have a pending payment for this course. Please wait
              for teacher approval.
            </p>
            <Link href="/dashboard/payments">
              <Button>View Payment Status</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/courses/${paymentInfo.course.slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Course Payment</h1>
            <p className="mt-2 text-gray-400">
              Submit your payment to enroll in this course
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Course Details
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Course:</span>
                <span className="font-medium text-white">
                  {paymentInfo.course.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Teacher:</span>
                <span className="font-medium text-white">
                  {paymentInfo.teacher.businessName ||
                    `${paymentInfo.teacher.firstName} ${paymentInfo.teacher.lastName}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-400">Price:</span>
                <span className="text-2xl font-bold text-white">
                  {paymentInfo.course.price.toLocaleString()} UZS
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Payment Instructions
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                1. Transfer the amount to the following card:
              </p>
              {paymentInfo.paymentInfo.maskedCardNumber && (
                <div className="rounded-lg bg-gray-900 p-4">
                  <div className="space-y-1">
                    {paymentInfo.paymentInfo.bankName && (
                      <p className="text-sm text-gray-400">
                        Bank:{" "}
                        <span className="text-white">
                          {paymentInfo.paymentInfo.bankName}
                        </span>
                      </p>
                    )}
                    <p className="font-mono text-lg font-semibold text-white">
                      {paymentInfo.paymentInfo.maskedCardNumber}
                    </p>
                    {paymentInfo.paymentInfo.cardHolder && (
                      <p className="text-sm text-gray-400">
                        Card Holder:{" "}
                        <span className="text-white">
                          {paymentInfo.paymentInfo.cardHolder}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-400">
                2. Take a screenshot or photo of the payment receipt
              </p>
              <p className="text-sm text-gray-400">
                3. Upload the receipt below and submit
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-6">
              <label className="mb-2 block text-sm font-medium text-white">
                Payment Receipt <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="check-image"
                />
                <label
                  htmlFor="check-image"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-900 p-8 hover:border-gray-600"
                >
                  <Upload className="mb-2 h-8 w-8 text-gray-500" />
                  <p className="mb-1 text-sm text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, or WebP (max 10MB)
                  </p>
                </label>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Payment receipt preview"
                      className="max-h-64 w-full rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCheckImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!checkImage || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Payment"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
