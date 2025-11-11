import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Settings } from "lucide-react";

const IntroScreen = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/game");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-8">
      <div className="text-center space-y-12 animate-fade-in">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-9xl font-black text-white drop-shadow-2xl animate-bounce-slow">
            COLOR MOVE!
          </h1>
          <p className="text-3xl md:text-5xl font-bold text-white/90 drop-shadow-lg">
            Watch, Learn & Move! 🎨
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white/20 backdrop-blur-md rounded-[3rem] p-8 md:p-12 space-y-6 max-w-4xl mx-auto">
          <p className="text-2xl md:text-4xl font-bold text-white">
            Get ready to follow the colors!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xl md:text-2xl font-bold text-white">
            <div>🟢 RUN</div>
            <div>🔴 STOP</div>
            <div>🟡 SIT</div>
            <div>⚫ HAIR</div>
            <div>⚪ TEETH</div>
            <div>🔵 SKY</div>
            <div>🌸 POSE</div>
            <div>🟣 DANCE</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <Button
            onClick={handleStart}
            className="game-button bg-white text-primary hover:bg-white/90 flex items-center gap-6"
          >
            <Play className="w-16 h-16 fill-current" />
            LET'S PLAY!
          </Button>

          <Button
            onClick={handleSettings}
            variant="secondary"
            className="game-button bg-secondary text-secondary-foreground hover:bg-secondary/90 flex items-center gap-6"
          >
            <Settings className="w-12 h-12" />
            SETTINGS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
