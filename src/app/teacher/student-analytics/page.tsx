import { Metadata } from "next";
import { StudentAnalyticsPage } from "@/components/analytics/student-analytics-page";

export const metadata: Metadata = {
  title: "Talabalar tahlili | O'qituvchi | Darslinker",
  description: "Talabalar va ro'yxatdan o'tishlar tahlili",
};

export default function StudentAnalyticsRoute() {
  return <StudentAnalyticsPage />;
}
