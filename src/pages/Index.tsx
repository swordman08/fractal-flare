import { useState } from "react";
import { VisualCanvas } from "@/components/VisualCanvas";
import { ControlPanel } from "@/components/ControlPanel";
import { InfoOverlay } from "@/components/InfoOverlay";
import { CreatorTag } from "@/components/CreatorTag";
import { PanelToggle } from "@/components/PanelToggle";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colorScheme, setColorScheme] = useState("cyan");
  const [patternMode, setPatternMode] = useState<"particles" | "fractals" | "waves" | "streak" | "laser" | "lightning" | "constellation" | "grid" | "ribbon" | "strobe" | "pulse" | "firework">("particles");
  const [scale, setScale] = useState(1);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const getColorPalette = (scheme: string): string[] => {
    switch (scheme) {
      case "cyan":
        return ["#00FFFF", "#00D4FF", "#0099FF", "#00AAFF", "#00E5FF"];
      case "magenta":
        return ["#FF00FF", "#FF0080", "#FF1493", "#FF69B4", "#FF00AA"];
      case "rainbow":
        return ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];
      case "purple":
        return ["#9D00FF", "#B347FF", "#8A2BE2", "#A020F0", "#DA70D6"];
      case "electric":
        return ["#00FFFF", "#00FF00", "#FFFF00", "#FF00FF", "#0080FF"];
      case "ocean":
        return ["#00CED1", "#1E90FF", "#4169E1", "#0000CD", "#00BFFF", "#48D1CC"];
      case "fire":
        return ["#FF4500", "#FF6347", "#FF0000", "#FFD700", "#FF8C00", "#FFA500"];
      case "aurora":
        return ["#00FF7F", "#00FA9A", "#7FFF00", "#00FFFF", "#FF1493", "#FF00FF"];
      case "synthwave":
        return ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"];
      case "vaporwave":
        return ["#FF71CE", "#01CDFE", "#05FFA1", "#B967FF", "#FFFB96"];
      case "cosmic":
        return ["#9D00FF", "#7B2CBF", "#C77DFF", "#E0AAFF", "#5A189A"];
      case "neon-city":
        return ["#FF006E", "#FFBE0B", "#00F5FF", "#8338EC", "#06FFA5"];
      case "toxic":
        return ["#00FF00", "#39FF14", "#CCFF00", "#00FF66", "#ADFF2F"];
      case "sunset":
        return ["#FF4E50", "#FC913A", "#F9D423", "#EDE574", "#E1F5C4"];
      case "matrix":
        return ["#00FF00", "#00DD00", "#00BB00", "#009900", "#00FF41"];
      case "plasma":
        return ["#FF00FF", "#FF0080", "#FF00FF", "#8000FF", "#00FFFF"];
      case "rave":
        return ["#FF1493", "#00FFFF", "#FFFF00", "#00FF00", "#FF00FF", "#FF0080"];
      case "festival":
        return ["#FF4500", "#FF00FF", "#FFFF00", "#00BFFF", "#FF1493", "#00FF7F"];
      case "laser-show":
        return ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
      case "random":
        // Generate random vibrant colors
        return Array.from({ length: 8 }, () => {
          const h = Math.floor(Math.random() * 360);
          const s = 80 + Math.floor(Math.random() * 20);
          const l = 50 + Math.floor(Math.random() * 20);
          return `hsl(${h}, ${s}%, ${l}%)`;
        });
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
          scale={scale}
        />
        {isPanelOpen ? (
          <ControlPanel
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            colorScheme={colorScheme}
            onColorSchemeChange={setColorScheme}
            patternMode={patternMode}
            onPatternModeChange={setPatternMode}
            scale={scale}
            onScaleChange={setScale}
            onClear={() => setClearTrigger((prev) => prev + 1)}
            isOpen={isPanelOpen}
            onTogglePanel={() => setIsPanelOpen(false)}
          />
        ) : (
          <PanelToggle onToggle={() => setIsPanelOpen(true)} />
        )}
        <InfoOverlay />
        <CreatorTag />
      </div>
    </div>
  );
};

export default Index;
