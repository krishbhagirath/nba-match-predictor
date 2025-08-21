import React, { useMemo } from "react";
import "./AnimatedBackground.css";

export default function AnimatedBackground({
  count = 40,      // how many bubbles
  minSize = 10,    // px
  maxSize = 30,    // px
  minDuration = 4, // seconds
  maxDuration = 8 // seconds
}) {
  // Precompute random attributes so they don't change every render
  const bubbles = useMemo(() => {
    const rand = (a, b) => a + Math.random() * (b - a);
    return Array.from({ length: count }, () => ({
      x: Math.random() * 100,                // 0–100% => full width
      size: rand(minSize, maxSize),          // px
      duration: rand(minDuration, maxDuration), // s
      delay: -Math.random() * 10             // negative for a natural stagger
    }));
  }, [count, minSize, maxSize, minDuration, maxDuration]);

  return (
    <div className="bg-container">
      <div className="bubbles">
        {bubbles.map((b, i) => (
          <span
            key={i}
            style={{
              "--x": `${b.x}%`,           // 0–100 (%) - fixed to use percentage
              "--s": `${b.size}px`,
              "--d": `${b.duration}s`,
              "--delay": `${b.delay}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
