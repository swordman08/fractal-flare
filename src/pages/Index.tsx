import { useState } from "react";
import { VisualCanvas } from "@/components/VisualCanvas";
import { ControlPanel } from "@/components/ControlPanel";
import { InfoOverlay } from "@/components/InfoOverlay";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colorScheme, setColorScheme] = useState("cyan");
  const [patternMode, setPatternMode] = useState<"particles" | "fractals" | "waves">("particles");
  const [clearTrigger, setClearTrigger] = useState(0);

  const getColorPalette = (scheme: string): string[] => {
    switch (scheme) {
      case "cyan":
        return ["#00FFFF", "#00D4FF", "#0099FF", "#00AAFF"];
      case "magenta":
        return ["#FF00FF", "#FF0080", "#FF1493", "#FF69B4"];
      case "rainbow":
        return ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
      case "purple":
        return ["#9D00FF", "#B347FF", "#8A2BE2", "#A020F0"];
      default:
        return ["#00FFFF", "#00D4FF", "#0099FF", "#00AAFF"];
    }
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background overflow-hidden">
        <VisualCanvas
          key={clearTrigger}
          isDarkMode={isDarkMode}
          colorPalette={getColorPalette(colorScheme)}
          patternMode={patternMode}
        />
        <ControlPanel
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          colorScheme={colorScheme}
          onColorSchemeChange={setColorScheme}
          patternMode={patternMode}
          onPatternModeChange={setPatternMode}
          onClear={() => setClearTrigger((prev) => prev + 1)}
        />
        <InfoOverlay />
      </div>
    </div>
  );
};

export default Index;
