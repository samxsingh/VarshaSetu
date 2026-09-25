import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sprout, ShieldCheck, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16">
      <Card className="max-w-lg w-full text-center p-8 space-y-6 shadow-floating border-surface-border">
        <div className="w-16 h-16 rounded-2xl bg-brand-teal-tint text-brand-teal mx-auto flex items-center justify-center shadow-xs">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <Badge variant="neutral" size="sm">404 • Page Not Found</Badge>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900">
            Lost in the Weather?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            The page or forecast view you are looking for does not exist or has been relocated within the monsoon system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link to="/farmer/dashboard" className="w-full">
            <Button variant="primary" fullWidth size="md" leftIcon={<Sprout className="w-4 h-4" />}>
              Farmer Portal
            </Button>
          </Link>
          <Link to="/officer" className="w-full">
            <Button variant="secondary" fullWidth size="md" leftIcon={<ShieldCheck className="w-4 h-4" />}>
              Officer Center
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-surface-border">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-brand-teal hover:underline">
            <Home className="w-3.5 h-3.5" />
            <span>Return to VarshaSetu Home</span>
          </Link>
        </div>
      </Card>
    </div>
  );
};
