import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Audience from "../components/landing/Audience";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Stats from "../components/landing/Stats";
import Evals from "../components/landing/Evals";
import Pricing from "../components/landing/Pricing";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Audience />
      <Features />
      <HowItWorks />
      <Stats />
      <Evals />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
