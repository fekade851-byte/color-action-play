import { useEffect, useState, useRef } from "react";
import PlaceholderVideo from "./PlaceholderVideo";

interface VideoFrameProps {
  colorId: string;
  action: string;
  gradient: string;
  duration: number;
  video?: string;
  onVideoEnd?: () => void;
}

const VideoFrame = ({ colorId, action, gradient, duration, video, onVideoEnd }: VideoFrameProps) => {
  const [showAction, setShowAction] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setShowAction(false);
    setVideoError(false);

    // Show action text after brief delay
    const timer = setTimeout(() => {
      setShowAction(true);
    }, 500);

    // Fallback timer in case video doesn't load or end event doesn't fire
    fallbackTimerRef.current = setTimeout(() => {
      if (onVideoEnd) onVideoEnd();
    }, duration);

    return () => {
      clearTimeout(timer);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, [colorId, duration, onVideoEnd]);

  const handleVideoEnd = () => {
    // Clear fallback timer since video ended naturally
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    if (onVideoEnd) onVideoEnd();
  };

  const handleVideoError = () => {
    console.warn(`Video failed to load: ${video}`);
    setVideoError(true);
    // Fallback timer will handle progression
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
      {/* Always show animated placeholder as background */}
      <PlaceholderVideo
        colorId={colorId}
        gradient={gradient}
        duration={duration}
        onEnd={handleVideoEnd}
      />

      {/* Video element overlaid on top if available */}
      {video && !videoError && (
        <video
          ref={videoRef}
          src={video}
          autoPlay
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay"
        />
      )}

      {/* Color name indicator - always show at top */}
      <div className="absolute top-8 left-8 text-5xl md:text-7xl font-black text-white drop-shadow-2xl z-20 animate-bounce-slow">
        {colorId.toUpperCase()}
      </div>

      {/* Action text overlay - centered */}
      {showAction && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="action-text px-12 py-8 bg-black/40 rounded-[3rem] backdrop-blur-md border-4 border-white/30 shadow-2xl">
            {action}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoFrame;
