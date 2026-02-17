import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Main,
  Timeline,
  Expertise,
  Project,
  Contact,
  Navigation,
  Footer,
} from "./components";
import FadeIn from "./components/FadeIn";
import BlogList from "./components/blog/BlogList";
import BlogPost from "./components/blog/BlogPost";
import ErrorBoundary from "./components/ErrorBoundary";
import ChatbotWidget from "./components/ChatbotWidget";
import "./index.scss";
import { getItemWithTTL, setItemWithTTL } from "./utils/theme";

function App() {
  const hour = new Date().getHours();
  const defaultTheme = hour >= 6 && hour < 18 ? "light" : "dark";
  const selectedTheme = getItemWithTTL("selected-theme") || defaultTheme;

  const [mode, setMode] = useState<string>(selectedTheme);

  const handleModeChange = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    setItemWithTTL("selected-theme", next, 24 * 60 * 60 * 1000);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  return (
    <BrowserRouter>
      <div
        className={`main-container ${
          mode === "dark" ? "dark-mode" : "light-mode"
        }`}
      >
        <Navigation parentToChild={{ mode }} modeChange={handleModeChange} />
        <Routes>
          <Route
            path="/portfolio"
            element={
              <FadeIn transitionDuration={700}>
                <Main />
                <Expertise />
                <Timeline />
                <Project />
                <Contact />
                <ErrorBoundary>
                  <ChatbotWidget />
                </ErrorBoundary>
              </FadeIn>
            }
          />
          <Route path="/portfolio/blog" element={<BlogList />} />
          <Route path="/portfolio/blog/:slug" element={<BlogPost />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
