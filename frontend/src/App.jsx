import { useEffect, useState } from "react";
import Loader from "./components/layout/Loader";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CustomCursor from "./components/layout/CustomCursor";
import InteractiveBackground from "./components/layout/InteractiveBackground";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Impact from "./components/sections/Impact";
import Skills from "./components/sections/Skills";
import Experience from "./components/sections/Experience";
import Projects from "./components/sections/Projects";
import Achievements from "./components/sections/Achievements";
import Testimonials from "./components/sections/Testimonials";
import Contact from "./components/sections/Contact";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

function App() {
  const [loaded, setLoaded] = useState(false);
  useSmoothScroll();

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} />
      <InteractiveBackground />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Impact />
        <Skills />
        <Experience />
        <Projects />
        <Achievements />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
