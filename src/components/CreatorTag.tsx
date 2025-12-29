import { useEffect, useState } from "react";
import { Github } from "lucide-react";

export const CreatorTag = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-10 animate-fade-in">
      <div className="bg-card/80 backdrop-blur-lg border border-border rounded-lg px-4 py-2 shadow-lg">
        <p className="text-xs text-foreground/70">
          Built by{" "}
          <a
            href="https://swordman08.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Github className="w-3 h-3" />
            Decker
          </a>
        </p>
      </div>
    </div>
  );
};
