import { Metadata } from "next";
import { QuizAnalyticsPage } from "@/components/analytics/quiz-analytics-page";

export const metadata: Metadata = {
  title: "Test natijalari | O'qituvchi | Darslinker",
  description: "Talabalar test natijalarini tahlil qilish",
};

export default function QuizAnalyticsRoute() {
  return <QuizAnalyticsPage />;
}
