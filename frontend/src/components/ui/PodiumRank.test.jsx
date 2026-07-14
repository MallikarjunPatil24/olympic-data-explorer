import React from 'react';
import { render, screen } from '@testing-library/react';
import PodiumRank from './PodiumRank';

// Checks that PodiumRank renders all three podium columns (Gold, Silver, Bronze) when three items are passed.
test('renders all three items on the podium', () => {
  // Arrange
  const mockItems = [
    { label: 'United States', value: 46, subtext: 'USA' }, // 1st
    { label: 'China', value: 38, subtext: 'CHN' },        // 2nd
    { label: 'Great Britain', value: 27, subtext: 'GBR' }  // 3rd
  ];
  
  // Act
  render(<PodiumRank items={mockItems} />);
  
  // Assert
  // Verify 1st place gold
  expect(screen.getByText('United States')).toBeInTheDocument();
  expect(screen.getByText('46')).toBeInTheDocument();
  expect(screen.getByText('USA')).toBeInTheDocument();
  
  // Verify 2nd place silver
  expect(screen.getByText('China')).toBeInTheDocument();
  expect(screen.getByText('38')).toBeInTheDocument();
  expect(screen.getByText('CHN')).toBeInTheDocument();
  
  // Verify 3rd place bronze
  expect(screen.getByText('Great Britain')).toBeInTheDocument();
  expect(screen.getByText('27')).toBeInTheDocument();
  expect(screen.getByText('GBR')).toBeInTheDocument();
});

// Checks that PodiumRank renders only the silver column and leaves others empty when just one item is in the array.
test('renders partial items on the podium', () => {
  // Arrange
  const mockItems = [
    { label: 'United States', value: 10 } // Only 1st place gold
  ];
  
  // Act
  render(<PodiumRank items={mockItems} />);
  
  // Assert
  expect(screen.getByText('United States')).toBeInTheDocument();
  expect(screen.getByText('10')).toBeInTheDocument();
  expect(screen.queryByText('China')).not.toBeInTheDocument();
});

// Checks that PodiumRank doesn't crash and renders empty columns when an empty list is passed.
test('renders empty columns without crashing when no items are provided', () => {
  // Arrange & Act & Assert
  const { container } = render(<PodiumRank items={[]} />);
  
  // Verify structure is rendered, but no item text is present
  expect(container.firstChild).toBeInTheDocument();
  expect(screen.queryByText('1st')).not.toBeInTheDocument();
});
