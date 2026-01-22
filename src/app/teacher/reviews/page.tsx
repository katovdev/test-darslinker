import { Metadata } from "next";
import { ReviewsManagementPage } from "@/components/course/reviews-management-page";

export const metadata: Metadata = {
  title: "Sharhlar | O'qituvchi | Darslinker",
  description: "Kurslaringiz sharhlari va reytinglarini boshqarish",
};

export default function ReviewsRoute() {
  return <ReviewsManagementPage />;
}
