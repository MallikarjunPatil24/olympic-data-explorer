import React from 'react';
import { render, screen } from '@testing-library/react';
import InfoTooltip from './InfoTooltip';

// Checks that InfoTooltip renders the term label and the question mark inside the default trigger button.
test('renders typical InfoTooltip button with term and question mark', () => {
  // Arrange & Act
  render(<InfoTooltip term="NOC" definition="National Olympic Committee" />);
  
  // Assert
  const trigger = screen.getByRole('button', { name: /Definition of NOC/i });
  expect(trigger).toBeInTheDocument();
  expect(trigger).toHaveTextContent('NOC');
  expect(trigger).toHaveTextContent('?');
});

// Checks that InfoTooltip overrides the default trigger button and renders custom children instead.
test('renders custom child element as trigger when provided', () => {
  // Arrange & Act
  render(
    <InfoTooltip term="NOC" definition="National Olympic Committee">
      <span data-testid="custom-trigger">Click me for NOC</span>
    </InfoTooltip>
  );
  
  // Assert
  expect(screen.getByTestId('custom-trigger')).toHaveTextContent('Click me for NOC');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

// Checks that InfoTooltip handles missing term and definition props gracefully without crashing.
test('handles missing term and definition props gracefully without crash', () => {
  // Arrange & Act & Assert
  const { container } = render(<InfoTooltip term={undefined} definition={undefined} />);
  expect(container.firstChild).toBeInTheDocument();
});
