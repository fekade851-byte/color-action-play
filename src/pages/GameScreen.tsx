import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import VideoFrame from "@/components/VideoFrame";
import colorsData from "@/data/colors.json";
import { useSettings } from "@/contexts/SettingsContext";

const GameScreen = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

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
    // Reset to beginning when component mounts
    setCurrentColorIndex(0);
  }, []);

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

  return (
    <div className="min-h-screen h-screen flex flex-col relative overflow-hidden">
      {/* Video Frame - Full screen */}
      <div className="w-full h-full flex-1">
        <VideoFrame
          colorId={currentColor.id}
          action={currentColor.action}
          gradient={currentColor.gradient}
          duration={settings.videoDuration}
          video={currentColor.video}
          speech={currentColor.speech}
          onVideoEnd={handleAutoProgress}
        />
      </div>
    </div>
  );
};

export default GameScreen;
