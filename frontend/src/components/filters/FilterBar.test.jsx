import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterBar from './FilterBar';
import { useFilters } from '../../context/FilterContext';
import useFilterOptions from '../../hooks/useFilterOptions';

// Mock the FilterContext and useFilterOptions hooks
vi.mock('../../context/FilterContext', () => ({
  useFilters: vi.fn(),
}));

vi.mock('../../hooks/useFilterOptions', () => ({
  default: vi.fn(),
}));

describe('FilterBar Component', () => {
  const mockSetFilter = vi.fn();
  const mockResetFilters = vi.fn();

  beforeEach(() => {
    mockSetFilter.mockClear();
    mockResetFilters.mockClear();

    // Default return values for filters and options hooks
    useFilters.mockReturnValue({
      filters: {
        year: null,
        season: null,
        country: null,
        sport: null,
        gender: null,
        medal: null,
      },
      setFilter: mockSetFilter,
      resetFilters: mockResetFilters,
    });

    useFilterOptions.mockReturnValue({
      options: {
        years: [2020, 2016, 2012],
        countries: [
          { noc: 'USA', name: 'United States' },
          { noc: 'CHN', name: 'China' }
        ],
        sports: ['Athletics', 'Swimming'],
      },
      loading: false,
    });
  });

  // Checks that changing the year select dropdown option calls setFilter with the correct parsed year value
  it('calls setFilter with the selected year when year option changes', () => {
    render(<FilterBar />);
    
    const yearSelect = screen.getByRole('combobox', { name: /YEAR/i }) || screen.getByLabelText(/YEAR/i);
    fireEvent.change(yearSelect, { target: { value: '2016' } });
    
    expect(mockSetFilter).toHaveBeenCalledWith('year', 2016);
  });

  // Checks that typing in country input, displaying dropdown list, and clicking a country selection triggers setFilter
  it('calls setFilter with noc code after searching and selecting a country option', () => {
    render(<FilterBar />);
    
    const countryInput = screen.getByPlaceholderText('SEARCH COUNTRY...');
    fireEvent.focus(countryInput);
    fireEvent.change(countryInput, { target: { value: 'China' } });
    
    const countryItem = screen.getByText(/China/i);
    fireEvent.click(countryItem);
    
    expect(mockSetFilter).toHaveBeenCalledWith('country', 'CHN');
  });

  // Checks that clicking a filter toggle button (e.g. GOLD) calls setFilter with the correct value and active styling is shown
  it('calls setFilter with the correct medal value when a medal toggle is clicked and highlights it', () => {
    // Re-mock with medal set to 'Gold' to verify highlight styling
    useFilters.mockReturnValue({
      filters: {
        year: null,
        season: null,
        country: null,
        sport: null,
        gender: null,
        medal: 'Gold',
      },
      setFilter: mockSetFilter,
      resetFilters: mockResetFilters,
    });

    render(<FilterBar />);
    
    const goldButton = screen.getByRole('button', { name: 'GOLD' });
    fireEvent.click(goldButton);
    
    expect(mockSetFilter).toHaveBeenCalledWith('medal', 'Gold');
    expect(goldButton.className).toContain('activeToggle');
  });

  // Checks that the reset button is enabled when a filter is active, and clicking it invokes resetFilters
  it('enables the reset button when filters are active and calls resetFilters when clicked', () => {
    useFilters.mockReturnValue({
      filters: {
        year: 2020,
        season: null,
        country: null,
        sport: null,
        gender: null,
        medal: null,
      },
      setFilter: mockSetFilter,
      resetFilters: mockResetFilters,
    });

    render(<FilterBar />);
    
    const resetButton = screen.getByRole('button', { name: 'RESET' });
    expect(resetButton).not.toBeDisabled();
    
    fireEvent.click(resetButton);
    expect(mockResetFilters).toHaveBeenCalled();
  });
});
