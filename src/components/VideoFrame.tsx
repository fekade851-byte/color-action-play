import { useEffect, useState, useRef } from "react";
import PlaceholderVideo from "./PlaceholderVideo";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSettings } from "@/contexts/SettingsContext";

interface VideoFrameProps {
  colorId: string;
  action: string;
  gradient: string;
  duration: number;
  video?: string;
  speech?: string;
  onVideoEnd?: () => void;
}

const VideoFrame = ({ colorId, action, gradient, duration, video, speech, onVideoEnd }: VideoFrameProps) => {
  const [showAction, setShowAction] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout>();
  const { speak, stop } = useTextToSpeech();
  const { settings } = useSettings();

  useEffect(() => {
    setShowAction(false);
    setVideoError(false);
    stop(); // Stop any previous speech

    // Show action text after brief delay
    const timer = setTimeout(() => {
      setShowAction(true);
      
      // Speak the action if audio is enabled and speech text is provided
      if (settings.audioEnabled && speech) {
        speak(speech, {
          rate: 0.95,
          pitch: 1.2,
          volume: 1,
        });
      }
    }, 500);

    // Fallback timer in case video doesn't load or end event doesn't fire
    fallbackTimerRef.current = setTimeout(() => {
      stop(); // Stop speech when transitioning
      if (onVideoEnd) onVideoEnd();
    }, duration);

    return () => {
      clearTimeout(timer);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
      stop(); // Clean up speech on unmount
    };
  }, [colorId, duration, speech, settings.audioEnabled, onVideoEnd, speak, stop]);

  const handleVideoEnd = () => {
    // Clear fallback timer since video ended naturally
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
    stop(); // Stop speech when video ends
    if (onVideoEnd) onVideoEnd();
  };

  const handleVideoError = () => {
    console.warn(`Video failed to load: ${video}`);
    setVideoError(true);
    // Fallback timer will handle progression
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
      {/* Video element or animated placeholder */}
      {video && !videoError ? (
        <video
          ref={videoRef}
          src={video}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        // Animated canvas placeholder
        <PlaceholderVideo
          colorId={colorId}
          gradient={gradient}
          duration={duration}
          onEnd={handleVideoEnd}
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
