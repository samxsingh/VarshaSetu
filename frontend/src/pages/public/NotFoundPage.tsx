import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sprout, ShieldCheck, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16 font-sans">
      <div className="max-w-lg w-full text-center p-8 space-y-6 bg-white border-2 border-[#102A43] rounded-2xl shadow-[5px_5px_0px_#102A43]">
        <div className="w-16 h-16 rounded-2xl bg-[#E8F4F6] text-[#0E7490] border-2 border-[#102A43] mx-auto flex items-center justify-center shadow-[2px_2px_0px_#102A43]">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            404 • Page Not Found
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#102A43] tracking-tight">
            Lost in the Weather?
          </h1>
          <p className="text-xs sm:text-sm text-[#486581] max-w-sm mx-auto leading-relaxed font-medium">
            The page or forecast view you are looking for does not exist or has been relocated within the monsoon system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to="/farmer/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            <Sprout className="w-4 h-4" />
            <span>Farmer Portal</span>
          </Link>
          <Link
            to="/officer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white text-[#102A43] border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Officer Center</span>
          </Link>
        </div>

        <div className="pt-4 border-t-2 border-[#102A43]/10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-[#0E7490] hover:underline">
            <Home className="w-3.5 h-3.5" />
            <span>Return to VarshaSetu Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
