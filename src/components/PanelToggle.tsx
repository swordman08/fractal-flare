import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface PanelToggleProps {
  onToggle: () => void;
}

export const PanelToggle = ({ onToggle }: PanelToggleProps) => {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onToggle}
      className="fixed top-4 right-4 z-10 gap-2 bg-primary/90 backdrop-blur-lg shadow-lg animate-fade-in"
      title="Open Control Panel"
    >
      <Settings className="h-4 w-4" />
      Controls
    </Button>
  );
};
