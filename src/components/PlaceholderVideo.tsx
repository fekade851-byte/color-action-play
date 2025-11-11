import { useEffect, useRef } from "react";

interface PlaceholderVideoProps {
  colorId: string;
  gradient: string;
  onEnd?: () => void;
  duration: number;
}

const PlaceholderVideo = ({ colorId, gradient, onEnd, duration }: PlaceholderVideoProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;

    // Color map for each color ID
    const colorMap: Record<string, { primary: string; secondary: string; accent: string }> = {
      green: { primary: "#22c55e", secondary: "#16a34a", accent: "#86efac" },
      red: { primary: "#ef4444", secondary: "#dc2626", accent: "#fca5a5" },
      yellow: { primary: "#eab308", secondary: "#ca8a04", accent: "#fde047" },
      black: { primary: "#1f2937", secondary: "#111827", accent: "#6b7280" },
      white: { primary: "#f3f4f6", secondary: "#e5e7eb", accent: "#ffffff" },
      blue: { primary: "#3b82f6", secondary: "#2563eb", accent: "#93c5fd" },
      pink: { primary: "#ec4899", secondary: "#db2777", accent: "#f9a8d4" },
      purple: { primary: "#a855f7", secondary: "#9333ea", accent: "#d8b4fe" },
    };

    const colors = colorMap[colorId] || colorMap.green;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.fillStyle = colors.primary;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, colors.secondary);
      gradient.addColorStop(1, colors.primary);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated circles
      const numCircles = 8;
      for (let i = 0; i < numCircles; i++) {
        const angle = (i / numCircles) * Math.PI * 2 + progress * Math.PI * 2;
        const radius = 200 + Math.sin(progress * Math.PI * 4 + i) * 50;
        const x = canvas.width / 2 + Math.cos(angle) * (300 + Math.sin(progress * Math.PI * 2) * 100);
        const y = canvas.height / 2 + Math.sin(angle) * (300 + Math.sin(progress * Math.PI * 2) * 100);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.accent}33`;
        ctx.fill();
      }

      // Draw pulsing center circle
      const centerRadius = 150 + Math.sin(progress * Math.PI * 6) * 30;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, centerRadius, 0, Math.PI * 2);
      ctx.fillStyle = `${colors.accent}66`;
      ctx.fill();

      // Draw subtle center decoration (no text since overlay handles it)
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
      ctx.fillStyle = `${colors.accent}44`;
      ctx.fill();

      // Continue animation or end
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (onEnd) onEnd();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [colorId, duration, onEnd]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
};

export default PlaceholderVideo;
