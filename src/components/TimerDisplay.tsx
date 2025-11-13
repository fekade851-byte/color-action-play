import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TimerDisplay.css';

interface TimerDisplayProps {
  totalSeconds: number;
  onTimeUp: () => void;
  isPaused: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ totalSeconds, onTimeUp, isPaused }) => {
  const [displayTime, setDisplayTime] = useState<number>(totalSeconds);
  const [progress, setProgress] = useState<number>(100);
  const animationFrameId = useRef<number>();
  const timerStartTime = useRef<number>();
  const timerDuration = useRef<number>(totalSeconds * 1000); // Store as milliseconds for better precision
  const remainingTimeRef = useRef<number>(totalSeconds * 1000);
  const lastUpdateTime = useRef<number>();

  // Format time to MM:SS
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Update display time and progress
  const updateTimer = useCallback((timestamp: number) => {
    if (!timerStartTime.current) {
      timerStartTime.current = timestamp;
      lastUpdateTime.current = timestamp;
      animationFrameId.current = requestAnimationFrame(updateTimer);
      return;
    }

    const elapsed = timestamp - timerStartTime.current;
    remainingTimeRef.current = Math.max(0, timerDuration.current - elapsed);
    
    // Update display time (round up to nearest second for display)
    const displaySeconds = Math.ceil(remainingTimeRef.current / 1000);
    setDisplayTime(prev => displaySeconds !== prev ? displaySeconds : prev);
    
    // Update progress
    const newProgress = (remainingTimeRef.current / timerDuration.current) * 100;
    setProgress(Math.max(0, Math.min(100, newProgress)));
    
    // Check if time's up
    if (remainingTimeRef.current <= 0) {
      onTimeUp();
      return;
    }
    
    // Continue animation if not paused
    if (!isPaused) {
      animationFrameId.current = requestAnimationFrame(updateTimer);
    }
  }, [isPaused, onTimeUp]);

  // Handle timer start/stop based on isPaused
  useEffect(() => {
    if (isPaused) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
    } else {
      // When resuming, adjust the start time to account for the pause
      if (timerStartTime.current && lastUpdateTime.current) {
        const pausedDuration = Date.now() - lastUpdateTime.current;
        timerStartTime.current += pausedDuration;
      } else {
        timerStartTime.current = undefined;
      }
      animationFrameId.current = requestAnimationFrame(updateTimer);
    }
    
    lastUpdateTime.current = Date.now();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPaused, updateTimer]);

  // Reset timer when totalSeconds changes
  useEffect(() => {
    // Cancel any running animation
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = undefined;
    }

    // Reset timer values
    timerDuration.current = totalSeconds * 1000;
    remainingTimeRef.current = totalSeconds * 1000;
    setDisplayTime(totalSeconds);
    setProgress(100);
    timerStartTime.current = undefined;
    lastUpdateTime.current = undefined;

    // Start timer if not paused
    if (!isPaused && totalSeconds > 0) {
      animationFrameId.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [totalSeconds, isPaused, updateTimer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const isLowTime = displayTime <= 30; // Show warning when less than 30 seconds left
  const progressBarColor = progress > 50 ? '#00C851' : progress > 20 ? '#ffbb33' : '#ff4444';

  return (
    <div className="timer-container">
      <div className={`timer-display ${isLowTime ? 'low-time' : ''}`}>
        <span className="time">{formatTime(remainingTimeRef.current)}</span>
      </div>
      <div className="progress-container">
        <div 
          className="progress-bar"
          style={{
            width: `${progress}%`,
            backgroundColor: progressBarColor,
          }}
        />
      </div>
    </div>
  );
};

export default TimerDisplay;
