
import React from "react";

interface WaveformProps {
  data: number[];
  height?: number;
  color?: string;
  isActive?: boolean;
}

export function Waveform({ 
  data, 
  height = 40, 
  color = "#ef4444", 
  isActive = true 
}: WaveformProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="h-10 flex items-center justify-center w-full" 
        style={{ height: `${height}px` }}
      >
        <div className="bg-red-200 w-full h-[2px]"></div>
      </div>
    );
  }

  const max = Math.max(...data, 1);
  
  return (
    <div 
      className="flex items-center justify-between gap-[1px] w-full" 
      style={{ height: `${height}px` }}
    >
      {data.map((value, index) => {
        const normalizedHeight = (value / max) * height;
        return (
          <div 
            key={index}
            className="w-full rounded-t-sm"
            style={{
              height: `${Math.max(normalizedHeight, 2)}px`,
              backgroundColor: color,
              opacity: isActive ? 1 : 0.6,
              transition: "height 0.1s ease-in-out",
              animation: isActive ? "pulse 1.5s infinite ease-in-out" : "none"
            }}
          />
        );
      })}
    </div>
  );
}
