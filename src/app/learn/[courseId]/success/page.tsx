import { Metadata } from "next";
import { CourseSuccessPage } from "@/components/course/course-success-page";

export const metadata: Metadata = {
  title: "Tabriklaymiz! | Darslinker",
  description: "Kursni muvaffaqiyatli yakunladingiz",
};

interface SuccessPageProps {
  params: {
    courseId: string;
  };
}

export default function SuccessRoute({ params }: SuccessPageProps) {
  return <CourseSuccessPage courseId={params.courseId} />;
}
