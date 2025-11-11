import { useEffect, useState, useRef } from "react";

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
    <div className="w-full h-full relative overflow-hidden">
      {/* Video element */}
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
        // Fallback gradient background if no video or video fails
        <div className={`absolute inset-0 ${gradient}`}>
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full animate-pulse-glow delay-700" />
          </div>
        </div>
      )}

      {/* Action text overlay */}
      {showAction && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="action-text px-8 py-6 bg-black/30 rounded-[3rem] backdrop-blur-sm">
            {action}
          </div>
        </div>
      )}

      {/* Color name indicator */}
      <div className="absolute top-8 left-8 text-4xl md:text-6xl font-black text-white drop-shadow-2xl z-10">
        {colorId.toUpperCase()}
      </div>
    </div>
  );
};

export default VideoFrame;
