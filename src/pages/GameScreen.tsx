import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import VideoFrame from "@/components/VideoFrame";
import colorsData from "@/data/colors.json";

const GameScreen = () => {
  const navigate = useNavigate();
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  // Generate automatic sequence: random color → green → random color → green...
  // Total rounds: 4 (each round = random + green)
  const colorSequence = useMemo(() => {
    const nonGreenColors = colorsData.filter(color => color.id !== "green");
    const greenColor = colorsData.find(color => color.id === "green")!;
    const sequence = [];
    const rounds = 4;

    for (let i = 0; i < rounds; i++) {
      // Pick random non-green color
      const randomIndex = Math.floor(Math.random() * nonGreenColors.length);
      sequence.push(nonGreenColors[randomIndex]);
      // Always follow with green
      sequence.push(greenColor);
    }

    return sequence;
  }, []);

  const currentColor = colorSequence[currentColorIndex];

  useEffect(() => {
    // Reset to beginning when component mounts
    setCurrentColorIndex(0);
  }, []);

  const handleAutoProgress = () => {
    // Auto-progress to next color or closing
    if (currentColorIndex < colorSequence.length - 1) {
      setCurrentColorIndex(currentColorIndex + 1);
    } else {
      navigate("/closing");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Video Frame */}
      <div className="flex-1">
        <VideoFrame
          colorId={currentColor.id}
          action={currentColor.action}
          gradient={currentColor.gradient}
          duration={currentColor.duration}
          video={currentColor.video}
          onVideoEnd={handleAutoProgress}
        />
      </div>
    </div>
  );
};

export default GameScreen;
