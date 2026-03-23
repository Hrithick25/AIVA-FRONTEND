import React, { useState, useEffect, useMemo } from 'react';

// Matrix-style character cycle effect
export const MatrixText = ({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(true);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

  useEffect(() => {
    let interval = null;
    let iteration = 0;

    if (isAnimating) {
      interval = setInterval(() => {
        setDisplayText(
          text.split('')
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return letters[Math.floor(Math.random() * letters.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(interval);
          setIsAnimating(false);
        }

        iteration += 1 / 3;
      }, 40);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [text, isAnimating]);

  return (
    <span
      className={`matrix-text ${className}`}
      onMouseEnter={() => setIsAnimating(true)}
      style={{ fontFamily: 'monospace', display: 'inline-block', letterSpacing: '0px' }}
    >
      {displayText}
    </span>
  );
};

// Squeeze text animation
export const SqueezeText = ({ text, className = '' }) => {
  return (
    <span className={`squeeze-text-container ${className}`} style={{ display: 'inline-block' }}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="squeeze-char"
          style={{
            display: 'inline-block',
            animationDelay: `${index * 0.05}s`,
            whiteSpace: char === ' ' ? 'pre' : 'normal'
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

// 4K Stars and Cosmic Background Effect
export const StarsBackground = () => {
  const generateStars = (count, size) => {
    let shadow = '';
    // Generate scattered points inside a very large bounding box
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 3000) - 500;
      const y = Math.floor(Math.random() * 3000) - 500;
      const roll = Math.random();
      const color = roll > 0.9 ? '#00C6FF' : (roll > 0.8 ? '#7B2FF7' : '#FFFFFF');
      shadow += `${x}px ${y}px ${color}${i === count - 1 ? '' : ', '}`;
    }
    return {
      width: size, height: size, background: 'transparent', boxShadow: shadow, borderRadius: '50%'
    };
  };

  // Generate dense star fields dynamically once safely cached
  const stars1 = useMemo(() => generateStars(1200, '2px'), []);
  const stars2 = useMemo(() => generateStars(600, '3px'), []);
  const stars3 = useMemo(() => generateStars(200, '4px'), []);

  return (
    <div className="space-background">
      <div className="stars-layer stars-1" style={stars1}></div>
      <div className="stars-layer stars-2" style={stars2}></div>
      <div className="stars-layer stars-3" style={stars3}></div>
      <div className="nebula nebula-1"></div>
      <div className="nebula nebula-2"></div>
      <div className="nebula nebula-3"></div>

      {/* Animated Light Trails */}
      <svg className="light-trails-svg" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trail1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B2FF7" stopOpacity="0" />
            <stop offset="50%" stopColor="#00C6FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#7B2FF7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trail2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C6FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#7B2FF7" stopOpacity="1" />
            <stop offset="100%" stopColor="#7B2FF7" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path className="trail trail-a" d="M -200 400 C 400 100, 1000 700, 2200 200" fill="none" stroke="url(#trail1)" strokeWidth="3" filter="url(#glow)" />
        <path className="trail trail-b" d="M -100 800 C 500 1000, 1400 300, 2100 600" fill="none" stroke="url(#trail2)" strokeWidth="2" filter="url(#glow)" />
        <path className="trail trail-c" d="M 200 1200 C 800 600, 1600 800, 2000 -100" fill="none" stroke="url(#trail1)" strokeWidth="4" filter="url(#glow)" opacity="0.6" />
        <path className="trail trail-d" d="M -300 100 C 600 300, 1200 100, 2100 800" fill="none" stroke="url(#trail2)" strokeWidth="1.5" filter="url(#glow)" opacity="0.8" />
        <path className="trail trail-e" d="M 0 500 C 800 500, 1200 900, 2000 1080" fill="none" stroke="url(#trail1)" strokeWidth="2.5" filter="url(#glow)" opacity="0.7" />
      </svg>
    </div>
  );
};
