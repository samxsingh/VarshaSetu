import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TargetRiskCard } from '../components/forecast/TargetRiskCard';
import { CloudRain } from 'lucide-react';

describe('TargetRiskCard Component', () => {
  it('renders title, numeric probability, and status label', () => {
    render(
      <TargetRiskCard
        title="Monsoon Onset"
        icon={<CloudRain data-testid="icon" />}
        probabilityPercent={84}
        statusLabel="Probable"
        variant="teal"
        timeframeText="Window: June 26-28"
      />
    );

    expect(screen.getByText('Monsoon Onset')).toBeInTheDocument();
    expect(screen.getByText('84%')).toBeInTheDocument();
    expect(screen.getByText('Probable')).toBeInTheDocument();
    expect(screen.getByText('Window: June 26-28')).toBeInTheDocument();
  });

  it('displays the simulated data badge when isSimulated is true', () => {
    render(
      <TargetRiskCard
        title="Dry Spell Break"
        icon={<CloudRain />}
        probabilityPercent={58}
        statusLabel="Watch Active"
        variant="amber"
        isSimulated={true}
      />
    );

    expect(screen.getByText('SIMULATED DATA')).toBeInTheDocument();
  });
});
