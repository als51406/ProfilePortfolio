import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GlassBubble from './assets/Liquidglass';
import HomeProjects from './pages/HomeProjects';
import Lenis from 'lenis';




function App() {
  useEffect(() => {
    const lenis = new Lenis({
      // duration: 1.0, // seconds based smoothing (optional)
      // lerp: 0.1, // factor-based smoothing (0..1), use either duration or lerp
      smoothWheel: true
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<HomeProjects />} />
      </Routes>
      <GlassBubble />
    </>
  );
}

export default App;