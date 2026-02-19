import React, { useState, useEffect, lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
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
import ErrorBoundary from "./components/ErrorBoundary";
import { ChatWidget } from "./components/chat";
import { getItemWithTTL, setItemWithTTL } from "./utils/theme";

const BlogList = lazy(() => import("./components/blog/BlogList"));
const BlogPost = lazy(() => import("./components/blog/BlogPost"));
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
        <Navigation parentToChild={{ mode }} modeChange={handleModeChange} />
        <Routes>
          <Route
            path="/"
            element={
              <FadeIn transitionDuration={700}>
                <Main />
                <Expertise />
                <Timeline />
                <Project />
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
          <Route path="*" element={
            <Suspense fallback={<PageLoader />}>
              <NotFound />
            </Suspense>
          } />
        </Routes>
        <Footer />
        <ErrorBoundary>
          <ChatWidget />
        </ErrorBoundary>
      </div>
    </HashRouter>
  );
}

export default App;
