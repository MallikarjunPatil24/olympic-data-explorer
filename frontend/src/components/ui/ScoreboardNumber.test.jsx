import React from 'react';
import { render, screen } from '@testing-library/react';
import ScoreboardNumber from './ScoreboardNumber';

// Checks that ScoreboardNumber renders a formatted integer value correctly when animate is false.
test('renders typical formatted integer value with animate false', () => {
  // Arrange & Act
  render(<ScoreboardNumber value={12500} animate={false} />);
  
  // Assert
  expect(screen.getByText('12,500')).toBeInTheDocument();
});

// Checks that ScoreboardNumber displays string and non-numeric value prop modifications correctly.
test('renders string value or float value changes correctly', () => {
  // Arrange & Act
  const { rerender } = render(<ScoreboardNumber value={99.5} animate={false} />);
  
  // Assert
  expect(screen.getByText('99.5')).toBeInTheDocument();
  
  // Re-render with string value
  rerender(<ScoreboardNumber value="N/A" animate={false} />);
  expect(screen.getByText('N/A')).toBeInTheDocument();
});

// Checks that ScoreboardNumber doesn't crash and renders safely when value is null or undefined.
test('handles missing or null value gracefully and renders safely', () => {
  // Arrange & Act
  const { container } = render(<ScoreboardNumber value={null} animate={false} />);
  
  // Assert
  expect(container.firstChild).toBeInTheDocument();
});
