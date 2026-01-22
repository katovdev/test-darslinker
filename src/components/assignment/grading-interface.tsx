"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  FileText,
  Download,
  Loader2,
  Trophy,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { assignmentsApi } from "@/lib/api/assignments";
import type {
  Assignment,
  AssignmentSubmission,
  GradeSubmissionDto,
} from "@/types/assignment";

interface GradingInterfaceProps {
  assignment: Assignment;
  submission: AssignmentSubmission;
  onGradeSubmitted?: () => void;
}

export function GradingInterface({
  assignment,
  submission,
  onGradeSubmitted,
}: GradingInterfaceProps) {
  const [grade, setGrade] = useState(submission.grade ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrade = async () => {
    if (grade < 0 || grade > assignment.maxScore) {
      toast.error(`Ball 0 dan ${assignment.maxScore} gacha bo'lishi kerak`);
      return;
    }

    setIsSubmitting(true);
    try {
      const gradeData: GradeSubmissionDto = {
        grade,
        feedback: feedback.trim() || undefined,
      };

      await assignmentsApi.gradeSubmission(submission.id, gradeData);
      toast.success("Topshiriq baholandi!");
      onGradeSubmitted?.();
    } catch (error) {
      toast.error("Baholashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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

  const isGraded = submission.grade !== null && submission.grade !== undefined;

  return (
    <Card className="border-gray-700 bg-gray-800 p-6">
      {/* Student Info */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={submission.student?.avatar}
            alt={submission.student?.name}
            className="h-12 w-12"
          />
          <div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-semibold text-white">
                {submission.student?.name || "Talaba"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>Yuborilgan: {formatDate(submission.submittedAt)}</span>
            </div>
          </div>
        </div>

        {isGraded && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
            <p className="text-sm text-emerald-400">Baholangan</p>
            <p className="text-2xl font-bold text-white">
              {submission.grade}/{assignment.maxScore}
            </p>
          </div>
        )}
      </div>

      {/* Submitted File */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-white">
          Yuborilgan fayl
        </label>
        <a
          href={submission.file.fileUrl}
          download
          className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900 p-4 transition-colors hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-emerald-500" />
            <div>
              <p className="text-white">Talaba topshiriqi</p>
              <p className="text-sm text-gray-400">
                Ko&apos;rish uchun yuklab oling
              </p>
            </div>
          </div>
          <Download className="h-5 w-5 text-gray-400" />
        </a>
      </div>

      {/* Grading Form */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
            <Trophy className="h-4 w-4 text-emerald-500" />
            Ball <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(parseInt(e.target.value) || 0)}
              min={0}
              max={assignment.maxScore}
              className="w-32 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-center text-lg font-bold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-gray-400">/ {assignment.maxScore}</span>
            <div className="flex-1">
              <input
                type="range"
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                min={0}
                max={assignment.maxScore}
                className="w-full"
              />
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            0 dan {assignment.maxScore} gacha ball bering
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Izoh (ixtiyoriy)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Talaba ishiga izoh va tavsiyalar yozing..."
            rows={5}
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            Talabaga foydali fikr va tavsiyalar bering
          </p>
        </div>

        <Button
          onClick={handleGrade}
          disabled={isSubmitting}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saqlanmoqda...
            </>
          ) : (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              {isGraded ? "Bahoni yangilash" : "Baholash"}
            </>
          )}
        </Button>
      </div>

      {isGraded && submission.gradedAt && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Oxirgi baholash: {formatDate(submission.gradedAt)}
        </p>
      )}
    </Card>
  );
}
