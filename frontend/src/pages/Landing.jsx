import React, { useEffect } from "react";
import Lenis from "lenis";
import LandingNavbar from "../components/Landing/LandingNavbar";
import HeroSection from "../components/Landing/HeroSection";
import TrustedBy from "../components/Landing/TrustedBy";
import Features from "../components/Landing/Features";
import ProductShowcase from "../components/Landing/ProductShowcase";
import Statistics from "../components/Landing/Statistics";
import Testimonials from "../components/Landing/Testimonials";
import Pricing from "../components/Landing/Pricing";
import FAQ from "../components/Landing/FAQ";
import LandingFooter from "../components/Landing/LandingFooter";

const Landing = () => {
  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#050816] text-white overflow-hidden relative">
      <LandingNavbar />
      <HeroSection />
      <TrustedBy />
      <Features />
      <ProductShowcase />
      <Statistics />
      <Testimonials />
      <Pricing />
      <FAQ />
      <LandingFooter />
    </div>
  );
};

export default Landing;
