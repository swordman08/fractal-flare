import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Palette, Sparkles, Waves, Grid3x3, Maximize, X, AlertTriangle } from "lucide-react";

interface ControlPanelProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  colorScheme: string;
  onColorSchemeChange: (scheme: string) => void;
  patternMode: "particles" | "fractals" | "waves" | "streak" | "laser" | "lightning" | "constellation" | "grid" | "ribbon" | "strobe" | "pulse" | "firework";
  onPatternModeChange: (mode: "particles" | "fractals" | "waves" | "streak" | "laser" | "lightning" | "constellation" | "grid" | "ribbon" | "strobe" | "pulse" | "firework") => void;
  particleShape: "circle" | "square" | "triangle" | "star" | "diamond" | "hexagon";
  onParticleShapeChange: (shape: "circle" | "square" | "triangle" | "star" | "diamond" | "hexagon") => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onClear: () => void;
  isOpen: boolean;
  onTogglePanel: () => void;
}

const colorSchemes = [
  { name: "Cyan Dream", value: "cyan" },
  { name: "Magenta Pulse", value: "magenta" },
  { name: "Rainbow", value: "rainbow" },
  { name: "Purple Haze", value: "purple" },
  { name: "Electric", value: "electric" },
  { name: "Ocean", value: "ocean" },
  { name: "Fire", value: "fire" },
  { name: "Aurora", value: "aurora" },
  { name: "Synthwave", value: "synthwave" },
  { name: "Vaporwave", value: "vaporwave" },
  { name: "Cosmic", value: "cosmic" },
  { name: "Neon City", value: "neon-city" },
  { name: "Toxic", value: "toxic" },
  { name: "Sunset", value: "sunset" },
  { name: "Matrix", value: "matrix" },
  { name: "Plasma", value: "plasma" },
  { name: "Rave", value: "rave" },
  { name: "Festival", value: "festival" },
  { name: "Laser Show", value: "laser-show" },
  { name: "Random", value: "random" },
];

const patternModes = [
  { name: "Particles", value: "particles" as const, icon: Sparkles },
  { name: "Fractals", value: "fractals" as const, icon: Grid3x3 },
  { name: "Waves", value: "waves" as const, icon: Waves },
  { name: "Streak", value: "streak" as const, icon: Sparkles },
  { name: "Laser", value: "laser" as const, icon: Sparkles },
  { name: "Lightning", value: "lightning" as const, icon: Sparkles },
  { name: "Constellation", value: "constellation" as const, icon: Sparkles },
  { name: "Grid", value: "grid" as const, icon: Grid3x3 },
  { name: "Ribbon", value: "ribbon" as const, icon: Waves },
  { name: "Strobe", value: "strobe" as const, icon: Sparkles },
  { name: "Pulse", value: "pulse" as const, icon: Waves },
  { name: "Firework", value: "firework" as const, icon: Sparkles },
];

export const ControlPanel = ({
  isDarkMode,
  onToggleDarkMode,
  colorScheme,
  onColorSchemeChange,
  patternMode,
  onPatternModeChange,
  particleShape,
  onParticleShapeChange,
  scale,
  onScaleChange,
  onClear,
  isOpen,
  onTogglePanel,
}: ControlPanelProps) => {
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed top-4 right-4 p-4 bg-card/80 backdrop-blur-lg border-border shadow-lg z-10 animate-fade-in">
      <div className="flex flex-col gap-4">
        {/* Close and Fullscreen Buttons */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            className="gap-2"
            title="Toggle Fullscreen (or press F11)"
          >
            <Maximize className="h-4 w-4" />
            Fullscreen
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePanel}
            className="h-8 w-8 p-0"
            title="Close Panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {/* Background Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Background:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDarkMode}
            className="gap-2"
          >
            {isDarkMode ? (
              <>
                <Moon className="h-4 w-4" />
                Dark
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                Light
              </>
            )}
          </Button>
        </div>

        {/* Color Scheme */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">Colors:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {colorSchemes.map((scheme) => (
              <Button
                key={scheme.value}
                variant={colorScheme === scheme.value ? "default" : "outline"}
                size="sm"
                onClick={() => onColorSchemeChange(scheme.value)}
                className="text-xs"
              >
                {scheme.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Pattern Mode */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Pattern:</span>
          <div className="grid grid-cols-3 gap-2">
            {patternModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.value}
                  variant={patternMode === mode.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPatternModeChange(mode.value)}
                  className="gap-1 p-2 text-xs"
                  title={mode.name}
                >
                  {mode.name}
                </Button>
              );
            })}
          </div>
          {(patternMode === "fractals" || patternMode === "constellation") && (
            <div className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-2 rounded-md">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>This pattern may be intensive on slower devices</span>
            </div>
          )}
        </div>

        {/* Particle Shape */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Shape:</Label>
          <Select value={particleShape} onValueChange={onParticleShapeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="triangle">Triangle</SelectItem>
              <SelectItem value="star">Star</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
              <SelectItem value="hexagon">Hexagon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scale Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Scale:</span>
            <span className="text-xs text-muted-foreground">{scale.toFixed(1)}x</span>
          </div>
          <Slider
            value={[scale]}
            onValueChange={(value) => onScaleChange(value[0])}
            min={0.5}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Clear Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onClear}
          className="w-full"
        >
          Clear Canvas
        </Button>
      </div>
    </Card>
  );
};
