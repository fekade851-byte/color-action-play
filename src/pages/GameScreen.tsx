import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import VideoFrame from "@/components/VideoFrame";
import colorsData from "@/data/colors.json";
import { useSettings } from "@/contexts/SettingsContext";

const GameScreen = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(settings.gameDuration);
  const gameDurationTimerRef = useRef<NodeJS.Timeout>();

  // Generate automatic sequence: random color → green → random color → green...
  // Use numberOfRounds from settings
  const colorSequence = useMemo(() => {
    const nonGreenColors = colorsData.filter(color => color.id !== "green");
    const greenColor = colorsData.find(color => color.id === "green")!;
    const sequence = [];
    const rounds = settings.numberOfRounds;

    for (let i = 0; i < rounds; i++) {
      // Pick random non-green color
      const randomIndex = Math.floor(Math.random() * nonGreenColors.length);
      sequence.push(nonGreenColors[randomIndex]);
      // Always follow with green
      sequence.push(greenColor);
    }

    return sequence;
  }, [settings.numberOfRounds]);

  const currentColor = colorSequence[currentColorIndex];

  useEffect(() => {
    setCurrentColorIndex(0);
    setTimeRemaining(settings.gameDuration);

    gameDurationTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(gameDurationTimerRef.current);
          navigate("/closing");
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (gameDurationTimerRef.current) {
        clearInterval(gameDurationTimerRef.current);
      }
    };
  }, [settings.gameDuration, navigate]);

  const handleAutoProgress = () => {
    // Only auto-progress if autoPlay is enabled
    if (settings.autoPlay) {
      if (currentColorIndex < colorSequence.length - 1) {
        setCurrentColorIndex(currentColorIndex + 1);
      } else {
        navigate("/closing");
      }
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen h-screen flex flex-col relative overflow-hidden">
      {/* Timer Display */}
      <div className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full">
        <span className="text-2xl md:text-4xl font-black text-white">
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Video Frame - Full screen */}
      <div className="w-full h-full flex-1">
        <VideoFrame
          colorId={currentColor.id}
          action={currentColor.action}
          gradient={currentColor.gradient}
          duration={settings.videoDuration}
          video={currentColor.video}
          onVideoEnd={handleAutoProgress}
        />
      </div>
    </div>
  );
};

export default GameScreen;
