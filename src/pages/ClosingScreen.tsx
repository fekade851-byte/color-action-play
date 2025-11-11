import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home, Settings } from "lucide-react";

const ClosingScreen = () => {
  const navigate = useNavigate();

  const handleReplay = () => {
    navigate("/game");
  };

  const handleExit = () => {
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent via-primary to-secondary p-8 relative overflow-hidden">
      {/* Optional closing video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        src="/videos/closing.mp4"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      
      <div className="text-center space-y-12 animate-fade-in relative z-10">
        {/* Success Message */}
        <div className="space-y-6">
          <h1 className="text-6xl md:text-9xl font-black text-white drop-shadow-2xl animate-bounce-slow">
            AMAZING! 🎉
          </h1>
          <p className="text-3xl md:text-5xl font-bold text-white/90 drop-shadow-lg">
            You did it! Great job! ⭐
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-8 text-8xl animate-pulse-glow">
          ⭐ ⭐ ⭐
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          <Button
            onClick={handleReplay}
            className="game-button bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-4"
          >
            <RotateCcw className="w-12 h-12" />
            PLAY AGAIN
          </Button>

          <Button
            onClick={handleSettings}
            variant="outline"
            className="game-button bg-white/20 text-white border-white/40 hover:bg-white/30 flex items-center gap-4"
          >
            <Settings className="w-12 h-12" />
            SETTINGS
          </Button>

          <Button
            onClick={handleExit}
            className="game-button bg-white text-primary hover:bg-white/90 flex items-center gap-4"
          >
            <Home className="w-12 h-12" />
            HOME
          </Button>
        </div>

        {/* Encouraging message */}
        <div className="bg-white/20 backdrop-blur-md rounded-[3rem] p-8 max-w-2xl mx-auto">
          <p className="text-2xl md:text-3xl font-bold text-white">
            Keep moving and learning! 💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClosingScreen;
