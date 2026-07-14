import React from 'react';
import { render, screen } from '@testing-library/react';
import KpiCard from './KpiCard';

// Mock ScoreboardNumber to prevent animation timer side-effects and focus purely on KpiCard rendering
vi.mock('../ui/ScoreboardNumber', () => {
  return {
    default: ({ value }) => <span data-testid="scoreboard-number">{value}</span>
  };
});

// Checks that KpiCard renders label and scoreboard value correctly under typical props.
test('renders typical KPI card label and value', () => {
  // Arrange & Act
  render(<KpiCard label="Total Athletes" value={12500} accentColor="blue" />);
  
  // Assert
  expect(screen.getByText('Total Athletes')).toBeInTheDocument();
  expect(screen.getByTestId('scoreboard-number')).toHaveTextContent('12500');
});

// Checks that KpiCard displays correct changed contents when label and value props are updated.
test('renders updated label and value correctly when props change', () => {
  // Arrange & Act
  render(<KpiCard label="Gold Medals" value={450} accentColor="yellow" />);
  
  // Assert
  expect(screen.getByText('Gold Medals')).toBeInTheDocument();
  expect(screen.getByTestId('scoreboard-number')).toHaveTextContent('450');
});

// Checks that KpiCard renders a fallback dash gracefully without crashing when the value prop is missing or null.
test('handles missing or null value gracefully and renders fallback', () => {
  // Arrange & Act
  render(<KpiCard label="Event Details" value={null} accentColor="red" />);
  
  // Assert
  expect(screen.getByText('Event Details')).toBeInTheDocument();
  expect(screen.queryByTestId('scoreboard-number')).not.toBeInTheDocument();
  expect(screen.getByText('—')).toBeInTheDocument();
});
