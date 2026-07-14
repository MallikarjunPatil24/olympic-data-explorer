import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterPresets from './FilterPresets';
import { useFilters } from '../../context/FilterContext';

// Mock the useFilters hook from context
vi.mock('../../context/FilterContext', () => ({
  useFilters: vi.fn(),
}));

describe('FilterPresets Component', () => {
  const mockSetFilter = vi.fn();
  const mockResetFilters = vi.fn();

  beforeEach(() => {
    mockSetFilter.mockClear();
    mockResetFilters.mockClear();

    useFilters.mockReturnValue({
      setFilter: mockSetFilter,
      resetFilters: mockResetFilters,
    });
  });

  // Checks that clicking a preset button (e.g. Modern Era) calls setFilter with correct parameters after resetting filters
  it('calls resetFilters and setFilter with correct preset values when clicked', () => {
    render(<FilterPresets />);
    
    const presetBtn = screen.getByRole('button', { name: 'Modern Era' });
    fireEvent.click(presetBtn);
    
    expect(mockResetFilters).toHaveBeenCalled();
    expect(mockSetFilter).toHaveBeenCalledWith('year', 2000);
  });

  // Checks that clicking the preset buttons does not call any callbacks before they are clicked
  it('does not trigger filter callbacks on mount before preset button click', () => {
    render(<FilterPresets />);
    
    expect(mockResetFilters).not.toHaveBeenCalled();
    expect(mockSetFilter).not.toHaveBeenCalled();
  });

  // Checks that clicking a compound preset button (e.g. Beijing 2008) sets both the year and season filters
  it('triggers multiple setFilter calls for compound filter presets', () => {
    render(<FilterPresets />);
    
    const presetBtn = screen.getByRole('button', { name: 'Beijing 2008' });
    fireEvent.click(presetBtn);
    
    expect(mockResetFilters).toHaveBeenCalled();
    expect(mockSetFilter).toHaveBeenCalledWith('year', 2008);
    expect(mockSetFilter).toHaveBeenCalledWith('season', 'Summer');
  });
});
