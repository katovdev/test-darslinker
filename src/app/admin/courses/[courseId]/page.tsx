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
  User,
} from "lucide-react";
import { toast } from "sonner";
import { courseContentService } from "@/services/course-content";
import { adminService } from "@/services/admin";
import { ModuleEditor } from "@/components/teacher/module-editor";
import { LessonEditor } from "@/components/teacher/lesson-editor";
import type { AdminCourseDetail } from "@/lib/api/admin";
import type { Module, Lesson } from "@/lib/api/course-content";

interface ExpandedModules {
  [moduleId: string]: boolean;
}

interface EditedCourse {
  title?: string;
  description?: string;
  type?: "free" | "paid";
  price?: number;
  status?: "draft" | "active" | "approved" | "archived";
}

export default function AdminCourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
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

  const [editedCourse, setEditedCourse] = useState<EditedCourse>({});
  const [hasChanges, setHasChanges] = useState(false);

  const loadCourse = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminService.getCourse(courseId);
      if (data) {
        setCourse(data);
        setEditedCourse({
          title: data.title,
          description: data.description,
          type: data.type,
          price: data.price,
          status: data.status,
        });
        // Expand first module by default
        if (data.modules.length > 0) {
          setExpandedModules({ [data.modules[0].id]: true });
        }
      } else {
        setError("Course not found");
      }
    } catch {
      setError("Failed to load course");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId, loadCourse]);

  const handleCourseUpdate = (field: keyof EditedCourse, value: unknown) => {
    setEditedCourse((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveCourse = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const result = await adminService.fullUpdateCourse(courseId, {
        title: editedCourse.title || course?.title || "",
        slug: course?.slug || "",
        description: editedCourse.description || course?.description || "",
        thumbnail: course?.thumbnail || null,
        type: editedCourse.type || course?.type || "free",
        price: editedCourse.price || 0,
        status: editedCourse.status || "draft",
      });

      if (result) {
        setCourse((prev) =>
          prev ? {
            ...prev,
            title: editedCourse.title || prev.title,
            description: editedCourse.description || prev.description,
            type: editedCourse.type || prev.type,
            price: editedCourse.price ?? prev.price,
            status: editedCourse.status || prev.status,
          } : null
        );
        setHasChanges(false);
        toast.success("Course saved successfully");
      }
    } catch {
      toast.error("Failed to save course");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (
      !confirm("Are you sure you want to delete this course? This action cannot be undone.")
    ) {
      return;
    }

    try {
      const success = await adminService.deleteCourse(courseId);
      if (success) {
        toast.success("Course deleted");
        router.push("/admin/courses");
      }
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleModuleCreated = async (mod: Module) => {
    setIsCreatingModule(false);
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: [...prev.modules, { ...mod, lessonsCount: 0 }],
          }
        : null
    );
    setExpandedModules((prev) => ({ ...prev, [mod.id]: true }));
    toast.success("Module created");
  };

  const handleModuleUpdated = (updatedModule: Module) => {
    setEditingModule(null);
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === updatedModule.id
                ? { ...m, ...updatedModule }
                : m
            ),
          }
        : null
    );
    toast.success("Module updated");
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
    toast.success("Module deleted");
  };

  const handleLessonCreated = async (lesson: Lesson, moduleId: string) => {
    setIsCreatingLesson(null);
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.map((m) =>
              m.id === moduleId
                ? { ...m, lessonsCount: m.lessonsCount + 1 }
                : m
            ),
          }
        : null
    );
    toast.success("Lesson created");
  };

  const handleLessonUpdated = () => {
    setEditingLesson(null);
    toast.success("Lesson updated");
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
    toast.success("Lesson deleted");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-gray-400">{error || "Course not found"}</p>
        <button
          onClick={() => router.push("/admin/courses")}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Courses
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
            onClick={() => router.push("/admin/courses")}
            className="flex items-center gap-1 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Course Builder</h1>
            <p className="mt-1 text-gray-400">{course.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteCourse}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={handleSaveCourse}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Settings */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Settings className="h-5 w-5 text-blue-500" />
              Course Settings
            </h2>

            <div className="space-y-4">
              {/* Teacher info */}
              <div className="rounded-lg bg-gray-800 p-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="h-4 w-4" />
                  <span className="text-xs">Course Owner</span>
                </div>
                <p className="mt-1 text-sm font-medium text-white">
                  {course.teacher?.firstName} {course.teacher?.lastName}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Course Title
                </label>
                <input
                  type="text"
                  value={editedCourse.title || ""}
                  onChange={(e) => handleCourseUpdate("title", e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  value={editedCourse.description || ""}
                  onChange={(e) =>
                    handleCourseUpdate("description", e.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Type</label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={editedCourse.type === "free"}
                      onChange={() => {
                        handleCourseUpdate("type", "free");
                        handleCourseUpdate("price", 0);
                      }}
                      className="h-4 w-4 border-gray-600 bg-gray-800 text-blue-500"
                    />
                    <span className="text-white">Free</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      checked={editedCourse.type === "paid"}
                      onChange={() => handleCourseUpdate("type", "paid")}
                      className="h-4 w-4 border-gray-600 bg-gray-800 text-blue-500"
                    />
                    <span className="text-white">Paid</span>
                  </label>
                </div>
              </div>

              {editedCourse.type === "paid" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Price (UZS)
                  </label>
                  <input
                    type="number"
                    value={editedCourse.price || ""}
                    onChange={(e) =>
                      handleCourseUpdate("price", parseInt(e.target.value) || 0)
                    }
                    min={0}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Status</label>
                <select
                  value={editedCourse.status || "draft"}
                  onChange={(e) =>
                    handleCourseUpdate(
                      "status",
                      e.target.value as "draft" | "active"
                    )
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Stats */}
          <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-400">Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-800 p-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Layers className="h-4 w-4" />
                  <span className="text-xs">Modules</span>
                </div>
                <p className="mt-1 text-xl font-bold text-white">
                  {course.modules.length}
                </p>
              </div>
              <div className="rounded-lg bg-gray-800 p-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <PlayCircle className="h-4 w-4" />
                  <span className="text-xs">Lessons</span>
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
              <Layers className="h-5 w-5 text-blue-500" />
              Course Content
            </h2>
            <button
              onClick={() => setIsCreatingModule(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>
          </div>

          {course.modules.length === 0 && !isCreatingModule ? (
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-12 text-center">
              <Layers className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-4 text-gray-400">
                No modules yet
              </p>
              <button
                onClick={() => setIsCreatingModule(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Create First Module
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {course.modules
                .sort((a, b) => a.order - b.order)
                .map((mod) => (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-gray-800 bg-gray-800/30 overflow-hidden"
                  >
                    <div
                      className="flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-800/50"
                      onClick={() => toggleModuleExpand(mod.id)}
                    >
                      <GripVertical className="h-5 w-5 text-gray-600" />
                      {expandedModules[mod.id] ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{mod.title}</h3>
                        <p className="text-sm text-gray-400">
                          {mod.lessonsCount} lessons
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingModule(mod as unknown as Module);
                        }}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>

                    {expandedModules[mod.id] && (
                      <ModuleLessons
                        moduleId={mod.id}
                        onEditLesson={(lesson) =>
                          setEditingLesson({ lesson, moduleId: mod.id })
                        }
                        onCreateLesson={() => setIsCreatingLesson(mod.id)}
                        onLessonDeleted={(lessonId) =>
                          handleLessonDeleted(lessonId, mod.id)
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
          <p className="text-sm text-gray-400">No lessons yet</p>
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
                <PlayCircle className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{lesson.title}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDuration(lesson.durationMins)}
                </div>
                {lesson.videoUrl ? (
                  <Eye className="h-4 w-4 text-blue-500" />
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
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 py-2 text-sm text-gray-400 hover:border-blue-500 hover:text-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Lesson
        </button>
      </div>
    </div>
  );
}
