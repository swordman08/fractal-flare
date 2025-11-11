import { useEffect, useState } from "react";

export const CreatorTag = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-10 animate-fade-in">
      <div className="bg-card/80 backdrop-blur-lg border border-border rounded-lg px-4 py-2 shadow-lg">
        <p className="text-xs text-foreground/70">
          Built by <span className="text-primary font-semibold">Decker</span>
        </p>
      </div>
    </div>
  );
};
