
import React from "react";

interface WaveformProps {
  data: number[];
  height?: number;
  color?: string;
  isActive?: boolean;
  playbackProgress?: number; // Added new prop to show playback progress
}

export function Waveform({ 
  data, 
  height = 40, 
  color = "#ef4444", 
  isActive = true,
  playbackProgress = 1 // Default to showing all bars
}: WaveformProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="h-10 flex items-center justify-center w-full" 
        style={{ height: `${height}px` }}
      >
        <div className="bg-muted w-full h-[2px]"></div>
      </div>
    );
  }

  const max = Math.max(...data, 1);
  // Calculate which bars should be highlighted based on playback progress
  const progressIndex = Math.floor(data.length * playbackProgress);
  
  return (
    <div 
      className="flex items-center justify-between gap-[1px] w-full" 
      style={{ height: `${height}px` }}
    >
      {data.map((value, index) => {
        const normalizedHeight = (value / max) * height;
        const isPlayed = index <= progressIndex;
        return (
          <div 
            key={index}
            className="w-full rounded-t-sm transition-all"
            style={{
              height: `${Math.max(normalizedHeight, 2)}px`,
              backgroundColor: isPlayed ? color : "hsl(var(--muted))",
              opacity: isActive && isPlayed ? 1 : 0.6,
              transition: "height 0.1s ease-in-out, background-color 0.3s ease",
              animation: isActive && isPlayed ? "pulse 1.5s infinite ease-in-out" : "none"
            }}
          />
        );
      })}
    </div>
  );
}
