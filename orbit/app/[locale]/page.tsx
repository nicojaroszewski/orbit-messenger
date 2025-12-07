import { setRequestLocale } from "next-intl/server";
import { HeroSection, FeaturesSection, Footer } from "@/components/landing";

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-cosmic-midnight">
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
