import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HorizonSelector } from '../components/forecast/HorizonSelector';

describe('HorizonSelector Component', () => {
  it('renders all four standard forecast horizons', () => {
    const handleChange = vi.fn();
    render(<HorizonSelector value={7} onChange={handleChange} />);

    expect(screen.getByRole('tab', { name: /7 Days/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /14 Days/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /21 Days/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /30 Days/i })).toBeInTheDocument();
  });

  it('indicates the active horizon correctly via aria-selected', () => {
    const handleChange = vi.fn();
    render(<HorizonSelector value={14} onChange={handleChange} />);

    const tab14 = screen.getByRole('tab', { name: /14 Days/i });
    expect(tab14).toHaveAttribute('aria-selected', 'true');

    const tab7 = screen.getByRole('tab', { name: /7 Days/i });
    expect(tab7).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with selected days when a horizon tab is clicked', () => {
    const handleChange = vi.fn();
    render(<HorizonSelector value={7} onChange={handleChange} />);

    const tab21 = screen.getByRole('tab', { name: /21 Days/i });
    fireEvent.click(tab21);

    expect(handleChange).toHaveBeenCalledWith(21);
  });
});
