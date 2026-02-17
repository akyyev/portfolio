import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page with greeting', () => {
  render(<App />);
  const heading = screen.getByText(/Hi, I'm Bagtyyar/i);
  expect(heading).toBeInTheDocument();
});
