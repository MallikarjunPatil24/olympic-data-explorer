import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './DataTable';

describe('DataTable Component', () => {
  const columns = [
    {
      header: 'NAME',
      accessorKey: 'name',
    },
    {
      header: 'AGE',
      accessorKey: 'age',
    },
  ];

  // Dummy dataset (25 items to force 2 pages with a default page size of 15)
  const data = Array.from({ length: 25 }, (_, i) => ({
    name: `Athlete ${String(i + 1).padStart(2, '0')}`,
    age: 20 + (i % 5),
  }));

  // Checks that clicking a sortable column header toggles the table sorting state and indicators
  it('toggles sorting indicators when clicking column headers', () => {
    render(<DataTable columns={columns} data={data} loading={false} pageSize={15} />);
    
    const headerCell = screen.getByText('NAME');
    expect(headerCell.parentElement).toHaveTextContent('↕');
    
    // First click sorts ascending
    fireEvent.click(headerCell);
    expect(headerCell.parentElement).toHaveTextContent('▴');
    
    // Second click sorts descending
    fireEvent.click(headerCell);
    expect(headerCell.parentElement).toHaveTextContent('▾');
  });

  // Checks that the pagination displays are correct and buttons navigate pages when clicked
  it('navigates pages and updates page rows when clicking Next and Previous buttons', () => {
    render(<DataTable columns={columns} data={data} loading={false} pageSize={15} />);
    
    expect(screen.getByText('PAGE 1 OF 2')).toBeInTheDocument();
    expect(screen.getByText('Athlete 01')).toBeInTheDocument();
    expect(screen.queryByText('Athlete 16')).not.toBeInTheDocument();
    
    const nextBtn = screen.getByRole('button', { name: /NEXT/i });
    fireEvent.click(nextBtn);
    
    expect(screen.getByText('PAGE 2 OF 2')).toBeInTheDocument();
    expect(screen.getByText('Athlete 16')).toBeInTheDocument();
    expect(screen.queryByText('Athlete 01')).not.toBeInTheDocument();
    
    const prevBtn = screen.getByRole('button', { name: /PREVIOUS/i });
    fireEvent.click(prevBtn);
    
    expect(screen.getByText('PAGE 1 OF 2')).toBeInTheDocument();
    expect(screen.getByText('Athlete 01')).toBeInTheDocument();
  });

  // Checks that pagination buttons are disabled at boundaries (Previous on first page, Next on last page)
  it('disables Previous on first page and Next on last page correctly', () => {
    render(<DataTable columns={columns} data={data} loading={false} pageSize={15} />);
    
    const prevBtn = screen.getByRole('button', { name: /PREVIOUS/i });
    const nextBtn = screen.getByRole('button', { name: /NEXT/i });
    
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
    
    fireEvent.click(nextBtn);
    
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });
});
