import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartCard from './ChartCard';

// Checks that ChartCard renders its title, subtitle, and child content under typical props.
test('renders typical chart card title, subtitle, and children', () => {
  // Arrange & Act
  render(
    <ChartCard title="Medal Count" subtitle="By NOC" accentColor="blue">
      <div data-testid="chart-content">Bar Chart</div>
    </ChartCard>
  );
  
  // Assert
  expect(screen.getByText('Medal Count')).toBeInTheDocument();
  expect(screen.getByText('By NOC')).toBeInTheDocument();
  expect(screen.getByTestId('chart-content')).toHaveTextContent('Bar Chart');
});

// Checks that ChartCard displays the error text and error header when an error is passed.
test('renders error state and error message when error prop is present', () => {
  // Arrange & Act
  render(
    <ChartCard title="Medal Count" error="Network Timeout" loading={false}>
      <div>Bar Chart</div>
    </ChartCard>
  );
  
  // Assert
  expect(screen.getByText('CHART RETRIEVAL ERROR')).toBeInTheDocument();
  expect(screen.getByText('Network Timeout')).toBeInTheDocument();
  expect(screen.queryByText('Bar Chart')).not.toBeInTheDocument();
});

// Checks that ChartCard doesn't crash and renders default layout structure when title and children are missing.
test('renders safely without crash when optional props and children are missing', () => {
  // Arrange & Act & Assert
  const { container } = render(<ChartCard title={null} subtitle={null} />);
  expect(container.firstChild).toBeInTheDocument();
});
