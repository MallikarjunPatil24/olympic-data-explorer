import React, { useEffect, useState, useRef } from 'react';
import styles from './ScoreboardNumber.module.css';

export default function ScoreboardNumber({ 
  value, 
  animate = true, 
  className = '', 
  style = {} 
}) {
  const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
  const target = isNumeric ? parseFloat(value) : 0;
  
  const [displayValue, setDisplayValue] = useState(animate && isNumeric ? 0 : value);
  const prevValueRef = useRef(animate && isNumeric ? 0 : target);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    if (!animate) {
      setDisplayValue(target);
      prevValueRef.current = target;
      return;
    }

    const startValue = prevValueRef.current;
    const endValue = target;
    const duration = 800; // 800ms duration
    let startTime = null;
    let frameId;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuad (mechanical style ease-out)
      const easeProgress = progress * (2 - progress);
      const currentVal = startValue + easeProgress * (endValue - startValue);

      // If integer target, round to integer. Otherwise match decimals.
      if (Number.isInteger(endValue)) {
        setDisplayValue(Math.floor(currentVal));
      } else {
        setDisplayValue(parseFloat(currentVal.toFixed(1)));
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    frameId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(frameId);
  }, [value, target, animate, isNumeric]);

  return (
    <span 
      className={`${styles.number} ${className}`} 
      style={{ ...style }}
    >
      {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
    </span>
  );
}
