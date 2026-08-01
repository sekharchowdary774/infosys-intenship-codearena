import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Stats from "../components/landing/Stats";
import Languages from "../components/landing/Languages";
import HowItWorks from "../components/landing/HowItWorks";
import LeaderboardPreview from "../components/landing/LeaderboardPreview";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Languages />
      <HowItWorks />
      <LeaderboardPreview />
      <CTA />
      <Footer />
    </>
  );
}

export default Landing;