import { useEffect } from "react";
import GameEngine from "@/components/GameEngine";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigate } from "react-router-dom";

interface GameSettings {
  gameDuration: number;
  autoPlay: boolean;
  soundEnabled: boolean;
}

const GameScreen = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  // Default settings in case settings is null
  const defaultSettings: GameSettings = {
    gameDuration: 60, // 60 seconds
    autoPlay: true,
    soundEnabled: true
  };
  
  // Merge default settings with user settings
  const gameSettings = settings ? { ...defaultSettings, ...settings } : defaultSettings;
  
  // Handle game completion
  const handleGameComplete = (finalScore: number) => {
    console.log(`Game completed with score: ${finalScore}`);
    // Navigate to home or results screen if needed
    // navigate('/');
  };

  // Ensure we have settings before rendering GameEngine
  if (!settings) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading game settings...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      <GameEngine 
        settings={gameSettings} 
        onGameComplete={handleGameComplete} 
      />
    </div>
  );
};

export default GameScreen;
