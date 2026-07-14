import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import YearScrubber from './YearScrubber';
import { useFilters } from '../../context/FilterContext';
import useFilterOptions from '../../hooks/useFilterOptions';

// Mock the context and filter option hooks
vi.mock('../../context/FilterContext', () => ({
  useFilters: vi.fn(),
}));

vi.mock('../../hooks/useFilterOptions', () => ({
  default: vi.fn(),
}));

describe('YearScrubber Component', () => {
  const mockSetFilter = vi.fn();

  beforeEach(() => {
    mockSetFilter.mockClear();

    useFilters.mockReturnValue({
      filters: { year: null },
      setFilter: mockSetFilter,
    });

    useFilterOptions.mockReturnValue({
      options: {
        years: [1896, 1900, 1904, 2022],
      },
    });
  });

  // Checks that dragging or changing the range slider triggers setFilter with the correct parsed year value
  it('calls setFilter with the selected year when slider value changes', () => {
    render(<YearScrubber />);
    
    const slider = screen.getByRole('slider') || screen.getByLabelText(/TIMELINE/i);
    fireEvent.change(slider, { target: { value: '1904' } });
    
    expect(mockSetFilter).toHaveBeenCalledWith('year', 1904);
  });

  // Checks that the setFilter callback is not called immediately on render before interactions
  it('does not call the setFilter callback before slider moves or reset is clicked', () => {
    render(<YearScrubber />);
    
    expect(mockSetFilter).not.toHaveBeenCalled();
  });

  // Checks that double-clicking the slider triggers timeline reset (setFilter with null)
  it('calls setFilter with null on range slider double click', () => {
    render(<YearScrubber />);
    
    const slider = screen.getByRole('slider') || screen.getByLabelText(/TIMELINE/i);
    fireEvent.doubleClick(slider);
    
    expect(mockSetFilter).toHaveBeenCalledWith('year', null);
  });

  // Checks that when a year is selected, clicking the "SHOW ALL YEARS" button calls setFilter with null
  it('shows and handles the clear button correctly when a filter is active', () => {
    useFilters.mockReturnValue({
      filters: { year: 1904 },
      setFilter: mockSetFilter,
    });

    render(<YearScrubber />);
    
    const clearBtn = screen.getByRole('button', { name: /SHOW ALL YEARS/i });
    expect(clearBtn).toBeInTheDocument();
    
    fireEvent.click(clearBtn);
    expect(mockSetFilter).toHaveBeenCalledWith('year', null);
  });
});
