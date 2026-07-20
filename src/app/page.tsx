import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ExtensionShowcase } from "@/components/landing/extension-showcase";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ExtensionShowcase />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
