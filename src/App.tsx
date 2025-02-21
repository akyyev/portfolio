import React, {useState, useEffect} from "react";
import {
  Main,
  Timeline,
  Expertise,
  Project,
  Contact,
  Navigation,
  Footer,
} from "./components";
import FadeIn from './components/FadeIn';
import './index.scss';
import { getItemWithTTL, setItemWithTTL } from "./utils/theme";

function App() {
    // Determine the default theme based on time
    const hour = new Date().getHours();
    const defaultTheme = hour >= 6 && hour < 18 ? 'light' : 'dark';

    // Get the selected theme from local storage or use the default theme
    const selectedTheme = getItemWithTTL("selected-theme") || defaultTheme;

    const [mode, setMode] = useState<string>(selectedTheme);

    const handleModeChange = () => {
        if (mode === 'dark') {
            setMode('light');
            setItemWithTTL('selected-theme', 'light', 24 * 60 * 60 * 1000);
        } else {
            setMode('dark');
            setItemWithTTL('selected-theme', 'dark', 24 * 60 * 60 * 1000);
        }
    }

    useEffect(() => {
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
      }, []);

    return (
    <div className={`main-container ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`}>
        <Navigation parentToChild={{mode}} modeChange={handleModeChange}/>
        <FadeIn transitionDuration={700}>
            <Main/>
            <Expertise/>
            <Timeline/>
            <Project/>
            <Contact/>
        </FadeIn>
        <Footer />
    </div>
    );
}

export default App;