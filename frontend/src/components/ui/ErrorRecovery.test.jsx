import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorRecovery from './ErrorRecovery';

describe('ErrorRecovery Component', () => {
  // Checks that simulating the click interaction calls the passed-in onRetry callback prop
  it('calls onRetry callback when the retry button is clicked', async () => {
    const handleRetry = vi.fn();
    render(<ErrorRecovery onRetry={handleRetry} />);
    
    const button = screen.getByRole('button', { name: /RETRY CONNECTION/i });
    fireEvent.click(button);
    
    expect(handleRetry).toHaveBeenCalledWith();

    // Wait for the asynchronous state updates in finally block to settle
    await screen.findByRole('button', { name: /RETRY IN 5s/i });
  });

  // Checks that the onRetry callback is not called immediately on mount before any interaction
  it('does not call the onRetry callback before any interaction happens', () => {
    const handleRetry = vi.fn();
    render(<ErrorRecovery onRetry={handleRetry} />);
    
    expect(handleRetry).not.toHaveBeenCalled();
  });

  // Checks that simulating the click interaction changes the visual state of the button to disabled
  it('disables the button after clicking to prevent repeated submissions', async () => {
    const handleRetry = vi.fn();
    render(<ErrorRecovery onRetry={handleRetry} />);
    
    const button = screen.getByRole('button', { name: /RETRY CONNECTION/i });
    fireEvent.click(button);
    
    expect(button).toBeDisabled();

    // Wait for the asynchronous state updates in finally block to settle
    await screen.findByRole('button', { name: /RETRY IN 5s/i });
  });
});
