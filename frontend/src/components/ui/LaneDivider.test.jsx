import React from 'react';
import { render } from '@testing-library/react';
import LaneDivider from './LaneDivider';

// Checks that a typical horizontal LaneDivider renders with its line and tick bar.
test('renders typical horizontal divider with tick', () => {
  // Arrange & Act
  const { container } = render(<LaneDivider direction="horizontal" tick={true} />);
  
  // Assert
  const wrapper = container.firstChild;
  expect(wrapper).toBeInTheDocument();
  // Ensure both the line (index 0) and tick (index 1) divs are rendered
  expect(wrapper.children.length).toBe(2);
  expect(wrapper.children[0].tagName).toBe('DIV');
  expect(wrapper.children[1].tagName).toBe('DIV');
});

// Checks that a vertical LaneDivider renders with the vertical style and custom tick background color.
test('renders vertical divider with custom tick color', () => {
  // Arrange & Act
  const { container } = render(
    <LaneDivider direction="vertical" tick={true} tickColor="red" />
  );
  
  // Assert
  const wrapper = container.firstChild;
  expect(wrapper.children.length).toBe(2);
  const tick = wrapper.children[1];
  expect(tick).toBeInTheDocument();
  expect(tick.style.backgroundColor).toBe('red');
});

// Checks that LaneDivider does not render a tick and runs without error when tick is false.
test('renders divider without tick gracefully', () => {
  // Arrange & Act
  const { container } = render(<LaneDivider tick={false} />);
  
  // Assert
  const wrapper = container.firstChild;
  expect(wrapper).toBeInTheDocument();
  // Ensure only the line div (index 0) is rendered
  expect(wrapper.children.length).toBe(1);
  expect(wrapper.children[0].tagName).toBe('DIV');
});
