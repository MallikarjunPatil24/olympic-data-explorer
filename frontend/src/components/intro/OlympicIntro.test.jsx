import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OlympicIntro from './OlympicIntro';

describe('OlympicIntro Component', () => {
  // Checks that after the animation duration (3.8s) passes, the onEnter callback is called
  it('calls onEnter callback after the timeout finishes', () => {
    vi.useFakeTimers();
    const handleEnter = vi.fn();
    render(<OlympicIntro onEnter={handleEnter} />);
    
    vi.advanceTimersByTime(3800);
    
    expect(handleEnter).toHaveBeenCalledWith();
    vi.useRealTimers();
  });

  // Checks that the onEnter callback is not called before the timeout finishes
  it('does not call the onEnter callback before the timeout finishes', () => {
    vi.useFakeTimers();
    const handleEnter = vi.fn();
    render(<OlympicIntro onEnter={handleEnter} />);
    
    vi.advanceTimersByTime(3700);
    
    expect(handleEnter).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  // Checks that the component renders the Olympic ring SVG graphics correctly on mount
  it('renders the SVG rings container on mount', () => {
    const handleEnter = vi.fn();
    const { container } = render(<OlympicIntro onEnter={handleEnter} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
