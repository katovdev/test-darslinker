"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  Trash2,
  Plus,
  Layers,
  PlayCircle,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  AlertCircle,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { courseContentService } from "@/services/course-content";
import { ModuleEditor } from "@/components/teacher/module-editor";
import { LessonEditor } from "@/components/teacher/lesson-editor";
import type { TeacherCourseDetail, UpdateCourseInput } from "@/lib/api/teacher";
import type { Module, Lesson } from "@/lib/api/course-content";

interface ExpandedModules {
  [moduleId: string]: boolean;
}

export default function CourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<TeacherCourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedModules, setExpandedModules] = useState<ExpandedModules>({});
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    lesson: Lesson | null;
    moduleId: string;
  } | null>(null);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState<string | null>(null);

  const [editedCourse, setEditedCourse] = useState<UpdateCourseInput>({});
  const [hasChanges, setHasChanges] = useState(false);

  const loadCourse = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await courseContentService.getCourse(courseId);
      if (data) {
        setCourse(data);
        setEditedCourse({
          title: data.title,
          description: data.description,
          type: data.type,
          price: data.price,
          status:
            data.status === "draft" || data.status === "active"
              ? data.status
              : "draft",
        });
        // Expand first module by default
        if (data.modules.length > 0) {
          setExpandedModules({ [data.modules[0].id]: true });
        }
      } else {
        setError("Kurs topilmadi");
      }
    } catch {
      setError("Kursni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId, loadCourse]);

  const handleCourseUpdate = (
    field: keyof UpdateCourseInput,
    value: unknown
  ) => {
    setEditedCourse((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveCourse = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const updated = await courseContentService.updateCourse(
        courseId,
        editedCourse
      );
      if (updated) {
        setCourse((prev) => (prev ? { ...prev, ...updated } : null));
        setHasChanges(false);
        toast.success("Kurs muvaffaqiyatli saqlandi");
      }
    } catch {
      toast.error("Kursni saqlashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (
      !confirm("Kursni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.")
    ) {
      return;
    }

    try {
      const success = await courseContentService.deleteCourse(courseId);
      if (success) {
        toast.success("Kurs o'chirildi");
        router.push("/teacher/courses");
      }
    } catch {
      toast.error("Kursni o'chirishda xatolik yuz berdi");
    }
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleModuleCreated = async (module: Module) => {
    setIsCreatingModule(false);
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: [...prev.modules, { ...module, lessonsCount: 0 }],
          }
        : null
    );
    setExpandedModules((prev) => ({ ...prev, [module.id]: true }));
    toast.success("Modul yaratildi");
  };

  const handleModuleUpdated = (updatedModule: Module) => {
    setEditingModule(null);
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === updatedModule.id ? { ...m, ...updatedModule } : m
            ),
          }
        : null
    );
    toast.success("Modul yangilandi");
  };

  const handleModuleDeleted = (moduleId: string) => {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.filter((m) => m.id !== moduleId),
          }
        : null
    );
    toast.success("Modul o'chirildi");
  };

  const handleLessonCreated = async (lesson: Lesson, moduleId: string) => {
    setIsCreatingLesson(null);
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === moduleId ? { ...m, lessonsCount: m.lessonsCount + 1 } : m
            ),
          }
        : null
    );
    toast.success("Dars yaratildi");
  };

  const handleLessonUpdated = () => {
    setEditingLesson(null);
    toast.success("Dars yangilandi");
  };

  const handleLessonDeleted = (lessonId: string, moduleId: string) => {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === moduleId
                ? { ...m, lessonsCount: Math.max(0, m.lessonsCount - 1) }
                : m
            ),
          }
        : null
    );
    toast.success("Dars o'chirildi");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-gray-400">{error || "Kurs topilmadi"}</p>
        <button
          onClick={() => router.push("/teacher/courses")}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Kurslarga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/teacher/courses")}
            className="flex items-center gap-1 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Kurs tahrirlash</h1>
            <p className="mt-1 text-gray-400">{course.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteCourse}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            O&apos;chirish
          </button>
          <button
            onClick={handleSaveCourse}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Saqlash
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Settings */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Settings className="h-5 w-5 text-emerald-500" />
              Kurs sozlamalari
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Kurs nomi
                </label>
                <input
                  type="text"
                  value={editedCourse.title || ""}
                  onChange={(e) => handleCourseUpdate("title", e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Tavsif
                </label>
                <textarea
                  value={editedCourse.description || ""}
                  onChange={(e) =>
                    handleCourseUpdate("description", e.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Turi
                </label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={editedCourse.type === "free"}
                      onChange={() => {
                        handleCourseUpdate("type", "free");
                        handleCourseUpdate("price", 0);
                      }}
                      className="h-4 w-4 border-gray-600 bg-gray-800 text-emerald-500"
                    />
                    <span className="text-white">Bepul</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={editedCourse.type === "paid"}
                      onChange={() => handleCourseUpdate("type", "paid")}
                      className="h-4 w-4 border-gray-600 bg-gray-800 text-emerald-500"
                    />
                    <span className="text-white">Pullik</span>
                  </label>
                </div>
              </div>

              {editedCourse.type === "paid" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Narxi (UZS)
                  </label>
                  <input
                    type="number"
                    value={editedCourse.price || ""}
                    onChange={(e) =>
                      handleCourseUpdate("price", parseInt(e.target.value) || 0)
                    }
                    min={0}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Holat
                </label>
                <select
                  value={editedCourse.status || "draft"}
                  onChange={(e) =>
                    handleCourseUpdate(
                      "status",
                      e.target.value as "draft" | "active"
                    )
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="draft">Qoralama</option>
                  <option value="active">Faol</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Stats */}
          <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-400">
              Statistika
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-800 p-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Layers className="h-4 w-4" />
                  <span className="text-xs">Modullar</span>
                </div>
                <p className="mt-1 text-xl font-bold text-white">
                  {course.modules.length}
                </p>
              </div>
              <div className="rounded-lg bg-gray-800 p-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <PlayCircle className="h-4 w-4" />
                  <span className="text-xs">Darslar</span>
                </div>
                <p className="mt-1 text-xl font-bold text-white">
                  {course.modules.reduce((acc, m) => acc + m.lessonsCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules & Lessons */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <Layers className="h-5 w-5 text-emerald-500" />
              Kurs tarkibi
            </h2>
            <button
              onClick={() => setIsCreatingModule(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Modul qo&apos;shish
            </button>
          </div>

          {course.modules.length === 0 && !isCreatingModule ? (
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-12 text-center">
              <Layers className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-4 text-gray-400">Hozircha modullar yo&apos;q</p>
              <button
                onClick={() => setIsCreatingModule(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" />
                Birinchi modulni yarating
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {course.modules
                .sort((a, b) => a.order - b.order)
                .map((module) => (
                  <div
                    key={module.id}
                    className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800/30"
                  >
                    <div
                      className="flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-800/50"
                      onClick={() => toggleModuleExpand(module.id)}
                    >
                      <GripVertical className="h-5 w-5 text-gray-600" />
                      {expandedModules[module.id] ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-white">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {module.lessonsCount} dars
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingModule(module as unknown as Module);
                        }}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>

                    {expandedModules[module.id] && (
                      <ModuleLessons
                        moduleId={module.id}
                        onEditLesson={(lesson) =>
                          setEditingLesson({ lesson, moduleId: module.id })
                        }
                        onCreateLesson={() => setIsCreatingLesson(module.id)}
                        onLessonDeleted={(lessonId) =>
                          handleLessonDeleted(lessonId, module.id)
                        }
                      />
                    )}
                  </div>
                ))}

              {isCreatingModule && (
                <ModuleEditor
                  courseId={courseId}
                  onSave={handleModuleCreated}
                  onCancel={() => setIsCreatingModule(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Module Editor Modal */}
      {editingModule && (
        <ModuleEditor
          courseId={courseId}
          module={editingModule}
          onSave={handleModuleUpdated}
          onCancel={() => setEditingModule(null)}
          onDelete={() => {
            handleModuleDeleted(editingModule.id);
            setEditingModule(null);
          }}
        />
      )}

      {/* Lesson Editor Modal */}
      {(editingLesson || isCreatingLesson) && (
        <LessonEditor
          moduleId={editingLesson?.moduleId || isCreatingLesson!}
          lesson={editingLesson?.lesson || null}
          onSave={(lesson) => {
            if (editingLesson) {
              handleLessonUpdated();
            } else {
              handleLessonCreated(lesson, isCreatingLesson!);
            }
          }}
          onCancel={() => {
            setEditingLesson(null);
            setIsCreatingLesson(null);
          }}
          onDelete={
            editingLesson?.lesson
              ? () => {
                  handleLessonDeleted(
                    editingLesson.lesson!.id,
                    editingLesson.moduleId
                  );
                  setEditingLesson(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

// Sub-component for module lessons
function ModuleLessons({
  moduleId,
  onEditLesson,
  onCreateLesson,
  onLessonDeleted,
}: {
  moduleId: string;
  onEditLesson: (lesson: Lesson) => void;
  onCreateLesson: () => void;
  onLessonDeleted: (lessonId: string) => void;
}) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      setIsLoading(true);
      try {
        const data = await courseContentService.listLessons(moduleId, {
          limit: 100,
        });
        if (data) {
          setLessons(data.lessons);
        }
      } catch {
        console.error("Failed to load lessons");
      } finally {
        setIsLoading(false);
      }
    };

    loadLessons();
  }, [moduleId]);

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-800">
      {lessons.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400">Darslar yo&apos;q</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {lessons
            .sort((a, b) => a.order - b.order)
            .map((lesson) => (
              <div
                key={lesson.id}
                className="flex cursor-pointer items-center gap-3 px-4 py-3 pl-14 hover:bg-gray-800/50"
                onClick={() => onEditLesson(lesson)}
              >
                <GripVertical className="h-4 w-4 text-gray-600" />
                <PlayCircle className="h-4 w-4 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {lesson.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDuration(lesson.durationMins)}
                </div>
                {lesson.videoUrl ? (
                  <Eye className="h-4 w-4 text-emerald-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-600" />
                )}
              </div>
            ))}
        </div>
      )}
      <div className="border-t border-gray-800 p-3">
        <button
          onClick={onCreateLesson}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 py-2 text-sm text-gray-400 hover:border-emerald-500 hover:text-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Dars qo&apos;shish
        </button>
      </div>
    </div>
  );
}
