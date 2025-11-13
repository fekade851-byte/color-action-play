import React, { useEffect, useRef, useState } from 'react';
import './VideoContainer.css';

interface VideoContainerProps {
  videoSrc: string;
  actionText: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onClick?: () => void;
}

const VideoContainer: React.FC<VideoContainerProps> = ({
  videoSrc,
  actionText,
  autoPlay = true,
  muted = true,
  loop = false,
  onEnded,
  onPlay,
  onPause,
  onClick,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tomRef = useRef<HTMLImageElement>(null);
  const jerryRef = useRef<HTMLImageElement>(null);
  const [jerryPos, setJerryPos] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Move Jerry along a gentle, slow path
  useEffect(() => {
    let angle = 0;
    const center = { x: 0, y: 0 };
    
    const moveJerry = () => {
      // Gentle movement with smaller radius
      const radiusX = 80 + Math.sin(angle * 0.3) * 20;
      const radiusY = 40 + Math.cos(angle * 0.2) * 15;
      
      // Slower, more controlled movement
      const x = center.x + radiusX * Math.cos(angle * 0.5);
      const y = center.y + radiusY * Math.sin(angle * 0.4);
      
      setJerryPos({ x, y });
      angle += 0.01; // Slower movement
    };

    const interval = setInterval(moveJerry, 50); // Slower update interval
    return () => clearInterval(interval);
  }, []);

  // Tom is now stationary - removed chasing logic

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  return (
    <div className="video-container" onClick={onClick}>
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        onEnded={onEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        className="game-video"
      />
      
      <div 
        ref={tomRef}
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '50%',
          transform: 'translateY(50%)',
          zIndex: 15,
          width: '30vw',
          maxHeight: '90vh',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <img 
          src="/images/tom.png" 
          alt="Tom" 
          className="character tom"
          style={{
            width: '100%',
            height: 'auto',
            maxWidth: '400px',
            minWidth: '200px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.3))',
            opacity: 1,
            transform: 'scaleX(-1)',
            imageRendering: 'crisp-edges',
            backgroundColor: 'transparent',
            display: 'block' // Ensure the image is a block element
          }}
        />
      </div>
      
      <img
        ref={jerryRef}
        src="/images/jerry.png"
        alt="Jerry"
        className="character jerry"
        style={{
          position: 'fixed',
          left: '20px',
          bottom: '50%',
          transform: `translateY(50%) translateX(${jerryPos.x}px)`,
          zIndex: 20,
          width: '25vw',
          height: 'auto',
          maxHeight: '90vh',
          maxWidth: '350px',
          minWidth: '150px',
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 15px rgba(0, 0, 0, 0.3))',
          pointerEvents: 'none',
          opacity: 0.95,
          willChange: 'transform',
          transition: 'transform 0.5s ease-out',
          transformOrigin: 'center',
          imageRendering: 'crisp-edges'
        }}
      />

      {actionText && (
        <div className="color-action">
          {actionText}
        </div>
      )}
      
      {!isPlaying && (
        <div className="play-overlay">
          <button className="play-button" onClick={(e) => {
            e.stopPropagation();
            videoRef.current?.play();
          }}>
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoContainer;
