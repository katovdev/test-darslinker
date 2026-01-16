import {
  HomeHeader,
  Hero,
  Features,
  ArticlesSection,
  ContactForm,
  HomeFooter,
} from "@/components/home";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />
      <main>
        <Hero />
        <Features />
        <ArticlesSection />
        <ContactForm />
      </main>
      <HomeFooter />
    </div>
  );
}
