import React, { useState, useEffect, lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import {
  Main,
  Timeline,
  Expertise,
  Contact,
  Navigation,
  Footer,
} from "./components";
import FadeIn from "./components/FadeIn";
import ErrorBoundary from "./components/ErrorBoundary";
import { ChatWidget } from "./components/chat";
import { getItemWithTTL, setItemWithTTL } from "./utils/theme";

const BlogList = lazy(() => import("./components/blog/BlogList"));
const BlogPost = lazy(() => import("./components/blog/BlogPost"));
const ProjectList = lazy(() => import("./components/ProjectList"));
const NotFound = lazy(() => import("./components/NotFound"));

const PageLoader = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
);

function App() {
  const [mode, setMode] = useState<string>(() => {
    const hour = new Date().getHours();
    const defaultTheme = hour >= 6 && hour < 18 ? "light" : "dark";
    return getItemWithTTL("selected-theme") || defaultTheme;
  });

  const handleModeChange = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    setItemWithTTL("selected-theme", next, 24 * 60 * 60 * 1000);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  return (
    <HashRouter>
      <div
        className={`main-container ${
          mode === "dark" ? "dark-mode" : "light-mode"
        }`}
      >
        {/* Skip to main content link for keyboard users - WCAG 2.2 AA */}
        <a
          href="#/"
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
              mainContent.focus();
              mainContent.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Skip to main content
        </a>
        <Navigation parentToChild={{ mode }} modeChange={handleModeChange} />
        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route
              path="/"
              element={
                <FadeIn transitionDuration={700}>
                  <Main />
                  <Expertise />
                  <Timeline />
                  <Contact />
                </FadeIn>
              }
            />
            <Route path="/blog" element={
              <Suspense fallback={<PageLoader />}>
                <BlogList />
              </Suspense>
            } />
            <Route path="/blog/:slug" element={
              <Suspense fallback={<PageLoader />}>
                <BlogPost />
              </Suspense>
            } />
            <Route path="/projects" element={
              <Suspense fallback={<PageLoader />}>
                <ProjectList />
              </Suspense>
            } />
            <Route path="*" element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </main>
        <Footer />
        <ErrorBoundary>
          <ChatWidget />
        </ErrorBoundary>
      </div>
    </HashRouter>
  );
}

export default App;
