import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InsightsBanner from './InsightsBanner';
import axiosClient from '../../api/axiosClient';

// Mock the API client module where the HTTP calls are executed
vi.mock('../../api/axiosClient', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

describe('InsightsBanner Component', () => {
  // Checks that the mocked API data is successfully rendered on screen after the async call completes
  it('mocks the API call and renders the fetched fact on screen', async () => {
    // Arrange: Mock the resolved API data response
    const mockData = {
      data: {
        insights: [
          { text: 'Mocked Insight Text 1' },
          { text: 'Mocked Insight Text 2' }
        ],
        fact: 'Did you know that mock tests verify backend integrations?'
      }
    };
    axiosClient.get.mockResolvedValue(mockData);

    // Act: Render the component
    render(<InsightsBanner />);

    // Assert: Wait for the mocked data to appear on the screen.
    // Why waitFor is necessary: The API call is triggered asynchronously on mount (inside useEffect).
    // The component initially renders null while loading is true. Once the mock promise resolves,
    // the state is updated and the component re-renders with the fact text.
    await waitFor(() => {
      expect(screen.getByText('Did you know that mock tests verify backend integrations?')).toBeInTheDocument();
    });
  });
});
