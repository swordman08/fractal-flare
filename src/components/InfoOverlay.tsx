import { useEffect, useState } from "react";

interface InfoOverlayProps {
  isHopalongMode?: boolean;
}

export const InfoOverlay = ({ isHopalongMode = false }: InfoOverlayProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
      <div className="bg-card/80 backdrop-blur-lg border border-border rounded-lg px-6 py-3 shadow-lg">
        {isHopalongMode ? (
          <p className="text-sm text-foreground/80 text-center">
            3D Galaxy Mode • ↑↓ Speed • ←→ Rotate • Move mouse to look around • Press F11 for fullscreen
          </p>
        ) : (
          <p className="text-sm text-foreground/80 text-center">
            Move your mouse • Click • Type to create patterns • Press F11 for fullscreen
          </p>
        )}
      </div>
    </div>
  );
};
