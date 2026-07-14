import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

// Mock the context hook since EmptyState calls useFilters() on mount
vi.mock('../../context/FilterContext', () => ({
  useFilters: vi.fn(() => ({
    resetFilters: vi.fn(),
  })),
}));

describe('EmptyState Component', () => {
  // Checks that clicking the reset button calls the passed-in onReset callback prop with the click event
  it('calls onReset callback when the reset button is clicked', () => {
    const handleReset = vi.fn();
    render(<EmptyState onReset={handleReset} />);
    
    const button = screen.getByRole('button', { name: /RESET ALL FILTERS/i });
    fireEvent.click(button);
    
    expect(handleReset).toHaveBeenCalledWith(expect.any(Object));
  });

  // Checks that the onReset callback is not called immediately on mount before any interaction
  it('does not call the onReset callback before any interaction happens', () => {
    const handleReset = vi.fn();
    render(<EmptyState onReset={handleReset} />);
    
    expect(handleReset).not.toHaveBeenCalled();
  });

  // Checks that the compact class is applied to the container div when the compact prop is true
  it('applies the compact style class when the compact prop is set to true', () => {
    const { container } = render(<EmptyState compact={true} />);
    
    const wrapper = container.firstChild;
    expect(wrapper.className).toContain('compact');
  });
});
