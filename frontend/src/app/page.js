import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Cta from "@/components/landing/Cta";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0f1c] text-white light:bg-slate-50 light:text-slate-900">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Cta />
      <Footer />
    </main>
  );
}