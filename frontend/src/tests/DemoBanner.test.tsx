import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DemoBanner } from '../components/common/DemoBanner';

describe('DemoBanner Component', () => {
  it('renders the prominent DEMO / SIMULATED DATA badge', () => {
    render(<DemoBanner />);
    expect(screen.getByText(/DEMO \/ SIMULATED DATA/i)).toBeInTheDocument();
  });

  it('toggles transparency rationale when Why button is clicked', () => {
    render(<DemoBanner />);
    const whyButton = screen.getByRole('button', { name: /Why\?/i });
    expect(whyButton).toBeInTheDocument();

    fireEvent.click(whyButton);
    expect(screen.getByText(/Scientific Transparency Rule:/i)).toBeInTheDocument();
  });
});
