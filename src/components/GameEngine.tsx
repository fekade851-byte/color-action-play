import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Home } from 'lucide-react';
import VideoContainer from './VideoContainer';
import TimerDisplay from './TimerDisplay';

// Add global styles for animations
const globalStyles = `
  @keyframes float {
    0% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes wiggle {
    0% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
    100% { transform: rotate(-5deg); }
  }
  
  .tom-animation {
    animation: bounce 3s ease-in-out infinite;
  }
  
  .jerry-animation {
    animation: wiggle 2s ease-in-out infinite;
  }
  
  .cheese-spin {
    animation: spin 4s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Tom & Jerry Chasing Animation */
  .chase-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 150px;
    overflow: hidden;
    z-index: 1;
    pointer-events: none;
    transform: translateY(100%);
    margin-top: -20px;
  }

  .tom {
    position: absolute;
    bottom: 0;
    width: 180px;
    height: auto;
    animation: tom-run 15s linear infinite;
    transition: opacity 0.5s ease-in-out;
  }

  .jerry {
    position: absolute;
    bottom: 0;
    width: 80px;
    height: auto;
    animation: jerry-run 12s linear infinite;
    transition: opacity 0.5s ease-in-out;
  }

  @keyframes jerry-run {
    0% {
      left: -100px;
      transform: scaleX(1);
    }
    45% {
      left: calc(100% + 100px);
      transform: scaleX(1);
    }
    46% {
      transform: scaleX(-1);
    }
    95% {
      left: -100px;
      transform: scaleX(-1);
    }
    96% {
      transform: scaleX(1);
    }
    100% {
      left: -100px;
      transform: scaleX(1);
    }
  }

  @keyframes tom-run {
    0% {
      left: -200px;
      transform: scaleX(1);
    }
    45% {
      left: calc(100% + 200px);
      transform: scaleX(1);
    }
    46% {
      transform: scaleX(-1);
    }
    95% {
      left: -200px;
      transform: scaleX(-1);
    }
    96% {
      transform: scaleX(1);
    }
    100% {
      left: -200px;
      transform: scaleX(1);
    }
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}
import colorsData from '../data/colors.json';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.3,
      type: 'tween' as const
    } 
  },
  exit: { opacity: 0, y: -20 }
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring' as const, 
      stiffness: 300, 
      damping: 25 
    } 
  },
  exit: { scale: 0.9, opacity: 0 }
};

interface Color {
  id: string;
  name: string;
  action: string;
  gradient: string;
  duration: number;
  video: string;
}

interface GameEngineProps {
  settings: {
    gameDuration: number;
    autoPlay: boolean;
    soundEnabled: boolean;
  };
  onGameComplete: (score: number) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ settings, onGameComplete }) => {
  // Get colors and green color
  const colors = colorsData;
  const greenColor = useMemo(() => colors.find(color => color.id === 'green'), [colors]);
  
  // Track which colors we've shown
  const usedColors = useRef<Set<string>>(new Set());
  
  // Game state
  const [currentColor, setCurrentColor] = useState<Color | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'round' | 'closing'>('intro');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(!settings.soundEnabled);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [showFeedback, setShowFeedback] = useState<{text: string, type: 'success' | 'miss'} | null>(null);
  const [showActionImmediately, setShowActionImmediately] = useState(false);
  // Initialize timer with game duration from settings (in minutes, converted to seconds)
  const [timeLeft, setTimeLeft] = useState(settings.gameDuration * 60);
  
  // Color management
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  
  // Media refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentClosingVideo = useRef(0);
  const currentIntroVideo = useRef(0);
  const navigate = useNavigate();
  
  // Calculate game duration in seconds
  const gameDurationSeconds = Math.max(10, settings.gameDuration); // Ensure at least 10 seconds
  
  // Handle time up event
  const handleTimeUp = useCallback(() => {
    console.log('Time up!');
    setGameState(prev => {
      if (prev === 'round') {
        return 'closing';
      }
      return prev;
    });
    onGameComplete(score);
  }, [onGameComplete, score]);
  
  // Calculate total rounds based on number of colors
  const totalNonGreenColors = colorsData.filter(c => c.id !== 'green').length;
  // Each color appears once (except green which appears between each color)
  const gameRounds = totalNonGreenColors * 2; // Green + one other color for each non-green color
  
  // Define intro and closing videos (can be expanded to an array if you have multiple)
  const introVideos = ['/videos/intro.mp4'];
  const closingVideos = ['/videos/closing.mp4'];
  
  // Initialize available colors
  useEffect(() => {
    const nonGreenColors = colors.filter(color => color.id !== 'green');
    setAvailableColors(nonGreenColors);
    
    // Cleanup on unmount
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, [colors]);

  // Get current video source based on game state
  const getVideoSource = useCallback(() => {
    if (gameState === 'intro') {
      return introVideos[currentIntroVideo.current % introVideos.length];
    }
    if (gameState === 'closing') {
      return closingVideos[currentClosingVideo.current % closingVideos.length];
    }
    if (!currentColor) return '';
    
    // For color videos
    const videoPath = currentColor.video.startsWith('/videos/') 
      ? currentColor.video 
      : `/videos/${currentColor.video}`;
      
    console.log('Loading video:', videoPath);
    return videoPath;
  }, [gameState, currentColor]);

  const videoSource = getVideoSource();

  // Handle video playback with autoplay restrictions
  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return false;

    // If video is already playing, don't interrupt
    if (!video.paused) {
      return true;
    }

    try {
      // Set video properties for better mobile support
      video.muted = isMuted; // Use current mute state
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      
      // Small delay to ensure video is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        console.log('Video play succeeded for state:', gameState);
        setIsPlaying(true);
        return true;
      } catch (err) {
        console.error('Video play failed, trying with muted:', err);
        // Try again with muted if first attempt fails
        try {
          video.muted = true;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
          setIsPlaying(true);
          return true;
        } catch (mutedErr) {
          console.error('Muted video play also failed:', mutedErr);
          setIsPlaying(false);
          return false;
        }
      }
    } catch (err) {
      console.error('Video setup error:', err);
      setIsPlaying(false);
      return false;
    }
  }, [gameState, isMuted]);

  // Handle game state changes and timer
  useEffect(() => {
    console.log('Game state changed to:', gameState);
    
    // Handle initial play when user interacts
    const handleFirstInteraction = async () => {
      if (gameState === 'intro' && !isPlaying) {
        const played = await playVideo();
        if (!played) {
          // If autoplay was prevented, wait for user interaction
          const playOnInteraction = async () => {
            const played = await playVideo();
            if (played) {
              document.removeEventListener('click', playOnInteraction);
              document.removeEventListener('touchstart', playOnInteraction);
            }
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        }
      }
    };
    
    handleFirstInteraction();
    
    // Handle timer based on game state
    if (gameState === 'round' && isPlaying) {
      // Calculate end time based on current time and remaining time
      const endTime = Date.now() + (timeLeft * 1000);
      
      // Start the game timer with requestAnimationFrame for better accuracy
      let animationFrameId: number;
      let timeoutId: NodeJS.Timeout;
      
      const updateTimer = () => {
        const now = Date.now();
        const remainingMs = Math.max(0, endTime - now);
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        
        setTimeLeft(prev => {
          // Only update if the second has changed
          if (remainingSeconds !== prev) {
            return remainingSeconds;
          }
          return prev;
        });
        
        if (remainingMs > 0) {
          // Schedule next update
          timeoutId = setTimeout(() => {
            animationFrameId = requestAnimationFrame(updateTimer);
          }, 1000 - (Date.now() % 1000));
        } else {
          // Time's up
          handleTimeUp();
        }
      };
      
      // Start the timer
      updateTimer();
      
      // Start the first round
      if (!currentColor) {
        startNextRound();
      }
      
      // Cleanup function
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }
  }, [gameState, settings.soundEnabled, colors, greenColor]);
  
  // Get the next color in sequence
  const getNextColor = useCallback((current: Color | null): Color | null => {
    if (!greenColor) return colors[0] || null;
    
    // If no current color or current is green, get a random color
    if (!current || current.id === 'green') {
      const nonGreenColors = colors.filter(c => c.id !== 'green');
      if (nonGreenColors.length === 0) return greenColor;
      
      // If we've used all colors, reset the used set
      if (usedColors.current.size >= nonGreenColors.length) {
        usedColors.current = new Set();
      }
      
      // Get available colors that haven't been used yet
      const available = nonGreenColors.filter(c => !usedColors.current.has(c.id));
      
      // If no available colors, return green to reset the cycle
      if (available.length === 0) return greenColor;
      
      // Return a random available color
      const nextColor = available[Math.floor(Math.random() * available.length)];
      return nextColor;
    }
    
    // If current is a color, go back to green
    return greenColor;
  }, [colors, greenColor]);
  
  // Start a new round with a color
  const startNextRound = useCallback(() => {
    const nextColor = getNextColor(currentColor);
    if (nextColor) {
      console.log('Starting round with color:', nextColor.id);
      setCurrentColor(nextColor);
      
      // Set the duration for this round
      const duration = nextColor.duration || 10;
      setTimeLeft(duration);
      
      // Play the color's video
      const video = videoRef.current;
      if (video) {
        video.src = nextColor.video;
        video.loop = false;
        video.muted = !settings.soundEnabled;
        video.onended = () => {
          console.log('Video ended, moving to next round');
          if (gameState === 'round') {
            startNextRound();
          }
        };
        video.play().catch(console.error);
      }
    }
  }, [currentColor, gameState, getNextColor, settings.soundEnabled]);

  // Automatically score when actions are completed
  useEffect(() => {
    if (gameState !== 'round' || !currentColor) return;
    
    // Don't score for green screens or if we've already scored for this action
    if (currentColor.id === 'green') return;
    
    // Calculate points (base points + time bonus)
    const basePoints = 100;
    const timeBonus = Math.floor((timeLeft / settings.gameDuration) * 50); // Up to 50 bonus points
    const pointsEarned = basePoints + timeBonus;
    
    // Update score
    setScore(prev => prev + pointsEarned);
    
    // Show feedback
    setShowFeedback({ 
      text: `+${pointsEarned}${timeBonus > 0 ? ` (${timeBonus} time bonus!)` : ''}`, 
      type: 'success' 
    });
    
    // Reset feedback after delay
    const timer = setTimeout(() => setShowFeedback(null), 2000);
    
    console.log(`Action completed! Score: ${score + pointsEarned}`);
    
    return () => clearTimeout(timer);
  }, [currentColor, gameState, score, timeLeft, settings.gameDuration]);
  
  // Handle video ended event
  const handleVideoEnd = useCallback(() => {
    if (!greenColor) return;
    
    console.log('Video ended, current state:', gameState, 'Round:', round, 'Time left:', timeLeft);
    
    if (gameState === 'intro') {
      console.log('Intro finished, starting first round with green');
      setGameState('round');
      // Move to next intro video for next time
      currentIntroVideo.current = (currentIntroVideo.current + 1) % introVideos.length;
      // Start with green
      setCurrentColor(null);
      setTimeout(() => setCurrentColor(greenColor), 100);
      return;
    }
    
    if (gameState === 'round') {
      // Show feedback for action completion
      if (round > 1 && currentColor?.id !== 'green') {
        setShowFeedback({ text: 'Great Job!', type: 'success' });
        setTimeout(() => setShowFeedback(null), 1500);
      }
      
      setRound(prev => {
        const nextRound = prev + 1;
        
        // Only end game when time runs out
        if (timeLeft <= 0) {
          console.log('Time is up! Game over.');
          setGameState('closing');
          return prev;
        }
        
        // Get the next color in sequence
        const nextColor = getNextColor(currentColor);
        if (nextColor) {
          console.log('Next color:', nextColor.id);
          setCurrentColor(null);
          setTimeout(() => setCurrentColor(nextColor), 100);
        }
        
        // Select the next color
        if (nextRound % 2 === 1) {
          console.log('Showing green color');
          // Force re-render by setting to null first
          setCurrentColor(null);
          setTimeout(() => setCurrentColor(greenColor), 100);
        } else {
          const remainingColors = colors.filter(color => color.id !== 'green' && !usedColors.current.has(color.id));
          if (remainingColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingColors.length);
            const randomColor = remainingColors[randomIndex];
            console.log('Selected random color:', randomColor.id);
            usedColors.current.add(randomColor.id);
            // Force re-render by setting to null first
            setCurrentColor(null);
            setTimeout(() => setCurrentColor(randomColor), 100);
            
            setShowActionImmediately(true);
            setTimeout(() => setShowActionImmediately(false), 500);
          } else {
            // Repeat colors if necessary
            const firstColor = colors.find(color => color.id !== 'green');
            if (firstColor) {
              console.log('No more unique colors available, repeating colors');
              usedColors.current = new Set();
              usedColors.current.add(firstColor.id);
              // Force re-render by setting to null first
              setCurrentColor(null);
              setTimeout(() => setCurrentColor(firstColor), 100);
              
              setShowActionImmediately(true);
              setTimeout(() => setShowActionImmediately(false), 500);
            }
          }
        }
        
        return nextRound;
      });
    } else if (gameState === 'closing') {
      console.log('Closing video finished, ending game');
      // Move to next closing video for next time
      currentClosingVideo.current = (currentClosingVideo.current + 1) % closingVideos.length;
      console.log('Game over, final score:', score);
      onGameComplete(score);
      navigate('/');
    }
  }, [gameState, onGameComplete, navigate, colors, greenColor, score, settings.gameDuration, timeLeft, round]);

  // Handle user interaction to start the game
  const handleStartGame = useCallback(() => {
    if (gameState === 'intro') {
      setGameState('round');
    } else if (!isPlaying && videoRef.current) {
      videoRef.current.play().catch(e => {
        console.error('Play failed:', e);
        setIsPlaying(false);
      });
    }
  }, [gameState, isPlaying]);

  // Toggle play/pause when clicking on the video
  const handleVideoClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(e => {
        console.error('Failed to play video:', e);
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle video element mount/update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set initial video properties
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const handleCanPlay = async () => {
      console.log('Video can play, current state:', gameState);
      if (isPlaying) {
        try {
          const played = await playVideo();
          if (!played) {
            console.log('Autoplay was prevented, waiting for user interaction...');
          }
        } catch (err) {
          console.error('Error in canplay handler:', err);
          setIsPlaying(false);
        }
      }
    };

    const handleError = () => {
      console.error('Video error occurred');
    };

    const handleEnded = handleVideoEnd;

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    // Try to play immediately if we're in the intro state
    if (gameState === 'intro') {
      playVideo().catch(err => {
        console.log('Initial autoplay failed, will wait for interaction');
      });
    }

    // Initial play attempt for non-intro states
    if (settings.autoPlay && gameState !== 'intro') {
      video.muted = isMuted;
      video.play().catch(e => {
        console.error('Initial play failed:', e);
        setIsPlaying(false);
      });
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoSource, isMuted, handleVideoEnd, settings]);

  // Initialize available colors (all non-green colors)
  useEffect(() => {
    setAvailableColors(colorsData.filter(color => color.id !== 'green'));
  }, []);
  
  // Initialize game state
  useEffect(() => {
    if (!greenColor) {
      console.error('Green color not found in colors data');
      return;
    }
    
    console.log('Game state changed to:', gameState);
    console.log('Round:', round, 'Used colors:', Array.from(usedColors.current));
    
    // Reset used colors when starting a new game
    if (gameState === 'intro') {
      usedColors.current = new Set();
      setCurrentColor(null);
      setTimeLeft(settings.gameDuration);
      setRound(1);
      
      // Set up intro video playback
      const playIntro = async () => {
        const video = videoRef.current;
        if (!video) return;

        try {
          video.muted = !settings.soundEnabled;
          video.currentTime = 0;
          await video.play();
          console.log('Intro video started playing');
          setIsPlaying(true);
        } catch (error) {
          console.error('Failed to play intro video:', error);
          setIsPlaying(false);
        }
      };
      
      // Start playing intro immediately
      playIntro();
      
      return () => {
        // Cleanup
        const video = videoRef.current;
        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load();
        }
      };
    } else if (gameState === 'round') {
      console.log('Round:', round, 'Time left:', timeLeft);
      
      // If it's the first round or an odd round, show green
      if (round === 1 || round % 2 === 1) {
        console.log('Showing green color');
        setCurrentColor(greenColor);
      } else {
        // Show a random color that hasn't been shown yet
        const remainingColors = colors.filter(color => color.id !== 'green' && !usedColors.current.has(color.id));
        
        console.log('Available colors:', remainingColors.map(c => c.id));
        
        if (remainingColors.length > 0) {
          const randomIndex = Math.floor(Math.random() * remainingColors.length);
          const randomColor = remainingColors[randomIndex];
          console.log('Selected random color:', randomColor.id);
          usedColors.current.add(randomColor.id);
          setCurrentColor(randomColor);
        }
      }
    } else if (gameState === 'closing') {
      setCurrentColor(null);
      // Clear any running timers when game ends
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    }
  }, [isPlaying, gameState, round, colors, greenColor]);

  // Format time in MM:SS format (e.g., 02:30 for 2 minutes and 30 seconds)
  // Keeping this for any other components that might use it
  const formatTime = useCallback((remainingSeconds: number): string => {
    const safeSeconds = Math.max(0, Math.floor(remainingSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage for time bar
  const timeProgress = Math.max(0, Math.min(100, (timeLeft / settings.gameDuration) * 100));

  // Animated background elements
  const BackgroundCharacters = () => (
    <>
      {/* Tom - Animated cat */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-20 h-20 md:w-32 md:h-32 tom-animation"
        animate={{
          x: [0, 10, 0, -10, 0],
          y: [0, -10, 0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative w-full h-full">
          {/* Ears */}
          <div className="absolute -top-2 left-2 w-8 h-8 bg-gray-300 rounded-full transform rotate-12"></div>
          <div className="absolute -top-2 right-2 w-8 h-8 bg-gray-300 rounded-full transform -rotate-12"></div>
          {/* Face */}
          <div className="w-full h-full bg-gray-300 rounded-full">
            {/* Eyes */}
            <div className="absolute top-6 left-4 w-4 h-6 bg-white rounded-full transform rotate-6">
              <div className="absolute top-1 left-1 w-2 h-4 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-6 right-4 w-4 h-6 bg-white rounded-full transform -rotate-6">
              <div className="absolute top-1 right-1 w-2 h-4 bg-black rounded-full"></div>
            </div>
            {/* Nose */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-pink-400 rounded-full"></div>
            {/* Whiskers */}
            <div className="absolute top-12 left-2 w-8 h-0.5 bg-gray-400 transform rotate-6"></div>
            <div className="absolute top-12 right-2 w-8 h-0.5 bg-gray-400 transform -rotate-6"></div>
          </div>
        </div>
      </motion.div>

      {/* Jerry - Animated mouse */}
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-16 h-16 md:w-24 md:h-24 jerry-animation"
        animate={{
          x: [0, -15, 0, 15, 0],
          y: [0, 10, 0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="relative w-full h-full">
          {/* Ears */}
          <div className="absolute -top-1 left-1 w-6 h-6 bg-brown-400 rounded-full transform rotate-12"></div>
          <div className="absolute -top-1 right-1 w-6 h-6 bg-brown-400 rounded-full transform -rotate-12"></div>
          {/* Face */}
          <div className="w-full h-full bg-amber-200 rounded-full">
            {/* Eyes */}
            <div className="absolute top-4 left-3 w-3 h-4 bg-white rounded-full">
              <div className="absolute top-0.5 left-0.5 w-2 h-3 bg-black rounded-full"></div>
            </div>
            <div className="absolute top-4 right-3 w-3 h-4 bg-white rounded-full">
              <div className="absolute top-0.5 right-0.5 w-2 h-3 bg-black rounded-full"></div>
            </div>
            {/* Nose */}
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-2 h-1.5 bg-pink-400 rounded-full"></div>
          </div>
        </div>
      </motion.div>

      {/* Cheese */}
      <motion.div 
        className="absolute top-1/3 right-1/3 w-12 h-8 bg-yellow-300 transform rotate-12"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [15, -15, 15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-yellow-200"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-yellow-200"></div>
      </motion.div>
    </>
  );

  // Calculate action text based on current color
  const actionText = useMemo(() => {
    if (!currentColor) return '';
    return currentColor.id === 'green' ? 'FREE PLAY!' : currentColor.action;
  }, [currentColor]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
      {gameState !== 'intro' && gameState !== 'closing' && (
        <div className="absolute inset-0 overflow-hidden z-0">
          <BackgroundCharacters />
        </div>
      )}
      
      <div className="relative z-10 w-full h-full">
        <VideoContainer
          videoSrc={videoSource}
          actionText={actionText}
          autoPlay={true}
          muted={isMuted}
          loop={false}
          onEnded={handleVideoEnd}
          onPlay={() => {
            setIsPlaying(true);
            setShowFeedback(null);
          }}
          onPause={() => setIsPlaying(false)}
          onClick={handleStartGame}
        />
      </div>
      
      {/* Floating bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      {/* Video Frame Container */}
      <div className="relative w-full max-w-5xl">
        {/* Decorative Elements */}
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-3xl opacity-20 blur-3xl -z-10"></div>
        
        {/* Main Video Frame */}
        <div className="relative bg-gray-900 rounded-2xl p-1.5 shadow-2xl">
          {/* Inner Glow */}
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 p-1">
            {/* Video Container with 16:9 aspect ratio */}
            <div className="relative w-full h-0 pb-[56.25%] bg-black rounded-lg overflow-hidden">
              {/* Video Element */}
              <video
                ref={videoRef}
                key={videoSource}
                src={videoSource}
                autoPlay={settings.autoPlay}
                playsInline
                muted={isMuted}
                preload="auto"
                className="absolute top-0 left-0 w-full h-full object-cover"
                onClick={handleVideoClick}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <button 
                    onClick={handleVideoClick}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:scale-110 transition-transform"
                  >
                    <Play className="w-10 h-10 ml-1" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Frame Decoration - Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400"></div>
          </div>
          
          {/* Frame Corners */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-purple-400 rounded-tl-lg"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-teal-400 rounded-bl-lg"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br-lg"></div>
        </div>
        
        {/* Timer Display - Removed duplicate, keeping only one instance */}
        
        {/* Round Counter */}
        <div className="mt-2 text-center">
          <p className="text-xs text-white/80">Round: <span className="text-yellow-300 font-bold">{Math.ceil(round/2)}</span></p>
        </div>
      </div>

      {/* Timer Display */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <TimerDisplay 
          totalSeconds={timeLeft} 
          onTimeUp={handleTimeUp} 
          isPaused={!isPlaying || gameState !== 'round'}
        />
      </div>

      {/* Modern Status Bar */}
      <motion.div 
        className="absolute top-20 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 text-white z-10"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="flex justify-center items-center max-w-4xl mx-auto space-x-4">
          <div className="text-2xl font-bold">
            {score} <span className="text-yellow-400">pts</span>
          </div>
          {combo > 0 && (
            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
              {combo}x Combo!
            </div>
          )}
          {multiplier > 1 && (
            <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {multiplier}x Multiplier!
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (videoRef.current) {
                videoRef.current.muted = newMuted;
              }
            }}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </motion.div>

      {/* Action Text Overlay */}
      <AnimatePresence>
        {currentColor && (
          <motion.div 
            className="absolute bottom-20 left-0 right-0 text-center z-10"
            initial="hidden"
            animate={showActionImmediately ? { scale: 1.1 } : "visible"}
            variants={scaleIn}
            exit="exit"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white text-4xl md:text-6xl font-bold px-8 py-4 rounded-xl shadow-2xl border-2 border-white/20">
              {currentColor.action}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold z-50 ${
              showFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
          >
            {showFeedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <motion.div
          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleStartGame}
        >
          <motion.button
            className="bg-white text-black text-2xl px-8 py-4 rounded-full mb-6 flex items-center space-x-2 shadow-lg hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={e => e.stopPropagation()}
          >
            <Play size={24} className="inline" />
            <span>{gameState === 'intro' ? 'Start Game' : 'Continue'}</span>
          </motion.button>
          
          <button
            className="text-white/80 hover:text-white flex items-center space-x-2 text-lg"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/');
            }}
          >
            <Home size={18} />
            <span>Exit to Home</span>
          </button>
        </motion.div>
      )}

      {/* Game Info Overlay */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg">
        Round: {round}/{gameRounds} | Score: {score}
      </div>

      {/* Pause/Play Button */}
      {isPlaying && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (videoRef.current) {
              if (videoRef.current.paused) {
                videoRef.current.play().catch(console.error);
              } else {
                videoRef.current.pause();
              }
            }
          }}
          className="absolute top-4 left-4 bg-white bg-opacity-30 p-3 rounded-full"
        >
          {videoRef.current?.paused ? '▶️' : '⏸️'}
        </button>
      )}
      
      {/* Tom & Jerry Chasing Animation */}
      <div className="chase-container">
        <img 
          src="/images/jerry.png" 
          alt="Jerry" 
          className="jerry" 
          style={{ opacity: gameState === 'round' ? 0.8 : 0 }} 
        />
        <img 
          src="/images/tom.png" 
          alt="Tom" 
          className="tom" 
          style={{ opacity: gameState === 'round' ? 0.7 : 0 }} 
        />
      </div>

      {/* Game Over Screen */}
      {gameState === 'closing' && !videoSource && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-10">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8">Game Over!</h1>
          <p className="text-4xl text-white mb-8">Your score: {score}</p>
          <button
            onClick={() => {
              setGameState('intro');
              setRound(1);
              setScore(0);
              setIsPlaying(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white text-4xl px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-transform"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
