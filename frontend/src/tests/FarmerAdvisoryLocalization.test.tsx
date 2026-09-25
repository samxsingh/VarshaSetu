import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FarmerAdvisoryPage } from '../pages/farmer/FarmerAdvisoryPage';
import { advisoryService } from '../services/advisoryService';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('FarmerAdvisoryPage Multilingual & Voice Accessibility (Phase 5C)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders language switchers for English and Hindi', () => {
    render(<FarmerAdvisoryPage />);

    const enBtn = screen.getByRole('button', { name: /English/i });
    const hiBtn = screen.getByRole('button', { name: /हिन्दी/i });

    expect(enBtn).toBeInTheDocument();
    expect(hiBtn).toBeInTheDocument();
  });

  it('switches interface and labels to Hindi when Hindi is selected', async () => {
    render(<FarmerAdvisoryPage />);

    const hiBtn = screen.getByRole('button', { name: /हिन्दी/i });
    fireEvent.click(hiBtn);

    expect(screen.getByText(/कृषि-मौसम सलाह एवं निगरानी/i)).toBeInTheDocument();
    expect(screen.getByText(/फसल चयन:/i)).toBeInTheDocument();
    expect(screen.getByText(/वृद्धि अवस्था:/i)).toBeInTheDocument();
  });

  it('renders voice listen buttons on advisory cards', () => {
    render(<FarmerAdvisoryPage />);

    const listenButtons = screen.getAllByRole('button', { name: /Listen/i });
    expect(listenButtons.length).toBeGreaterThan(0);
  });

  it('toggles terminology modal when terminology button is clicked', () => {
    render(<FarmerAdvisoryPage />);

    const termBtn = screen.getByRole('button', { name: /Terminology/i });
    fireEvent.click(termBtn);

    expect(screen.getByText(/Controlled Agro-Meteorological Terminology/i)).toBeInTheDocument();
    expect(screen.getByText(/Immutable Glossary/i)).toBeInTheDocument();
  });
});
