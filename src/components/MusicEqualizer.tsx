"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MusicEqualizerProps {
  barCount?: number;
  className?: string;
}

const MusicEqualizer = ({ barCount = 16, className = "" }: MusicEqualizerProps) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Skapa slumpmässiga startpositioner för varje stapel
    setBars(Array.from({ length: barCount }, () => Math.random()));
  }, [barCount]);

  return (
    <div className={`flex items-end justify-center space-x-1 h-16 ${className}`}>
      {bars.map((_, index) => {
        // Skapa variation i hastighet och amplitud för varje stapel
        const duration = 0.8 + Math.random() * 0.5; // 0.8-1.3s
        const initialHeight = 5 + Math.floor(Math.random() * 50); // 5-55%

        return (
          <motion.div
            key={index}
            className="w-1 rounded-t-sm bg-gradient-to-t from-purple-600 to-pink-400"
            initial={{ height: initialHeight }}
            animate={{
              height: [
                initialHeight,
                10 + Math.random() * 70, // 10-80%
                5 + Math.random() * 40,  // 5-45%
                20 + Math.random() * 60, // 20-80%
                initialHeight
              ]
            }}
            transition={{
              duration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        );
      })}
    </div>
  );
};

export default MusicEqualizer;