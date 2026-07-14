import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton, KpiCardSkeleton, ChartSkeleton, TableRowSkeleton } from './Skeleton';

// Checks that a typical base Skeleton renders with custom class name properties.
test('renders typical Skeleton with custom classes', () => {
  // Arrange & Act
  const { container } = render(<Skeleton className="custom-class" />);
  
  // Assert
  const element = container.firstChild;
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('custom-class');
});

// Checks that KpiCardSkeleton and ChartSkeleton render their composite structural blocks.
test('renders complex KpiCardSkeleton and ChartSkeleton layouts', () => {
  // Arrange & Act
  const { container: kpiContainer } = render(<KpiCardSkeleton />);
  const { container: chartContainer } = render(<ChartSkeleton />);
  
  // Assert
  expect(kpiContainer.firstChild).toBeInTheDocument();
  expect(chartContainer.firstChild).toBeInTheDocument();
});

// Checks that TableRowSkeleton handles variable columns correctly and doesn't crash when cols is 0.
test('handles TableRowSkeleton edge cases with custom column counts', () => {
  // Arrange & Act
  const { container: rowContainer } = render(
    <table>
      <tbody>
        <TableRowSkeleton cols={3} />
        <TableRowSkeleton cols={0} />
      </tbody>
    </table>
  );
  
  // Assert
  const rows = rowContainer.querySelectorAll('tr');
  expect(rows[0].children.length).toBe(3);
  expect(rows[1].children.length).toBe(0);
});
