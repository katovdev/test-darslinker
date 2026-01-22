import { Metadata } from "next";
import { TeacherAssignmentsPage } from "@/components/assignment/teacher-assignments-page";

export const metadata: Metadata = {
  title: "Topshiriqlar | O'qituvchi | Darslinker",
  description: "Talabalar topshiriqlarini boshqarish va baholash",
};

export default function AssignmentsRoute() {
  return <TeacherAssignmentsPage />;
}
