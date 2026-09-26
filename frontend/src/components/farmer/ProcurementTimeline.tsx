import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Scale,
  Users,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export const ProcurementTimeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);

  const steps = [
    { num: '01', title: 'CHOOSE PLACE', desc: 'Select KVK or Mandi procurement hub' },
    { num: '02', title: 'DATE & SLOT', desc: 'Pick Kharif delivery schedule window' },
    { num: '03', title: 'PRODUCE & QUANTITY', desc: 'Declare crop type and estimated quintals' },
    { num: '04', title: 'REVIEW', desc: 'Confirm moisture threshold & vehicle details' },
    { num: '05', title: 'CONFIRM', desc: 'Generate digital token & gate pass' },
  ];

  const timelineStages = [
    { stage: 'BOOKING', status: 'COMPLETED', time: 'June 20, 09:30 AM', desc: 'Slot confirmed for Mandi Hub' },
    { stage: 'QUEUE', status: 'IN_PROGRESS', time: 'June 26, 07:15 AM', desc: 'Token issued: TOK-LKO01-20240626-042' },
    { stage: 'ARRIVAL', status: 'PENDING', time: 'Estimated 08:30 AM', desc: 'Report to Gate No. 3 with tractor' },
    { stage: 'VERIFICATION', status: 'PENDING', time: 'Pending Arrival', desc: 'Aadhaar & Farmer Registry verification' },
    { stage: 'WEIGHING', status: 'PENDING', time: 'Pending Verification', desc: 'Gross & tare electronic weighbridge' },
    { stage: 'PROCUREMENT', status: 'PENDING', time: 'Pending Weighing', desc: 'Fair Average Quality (FAQ) check' },
    { stage: 'DIGITAL RECEIPT', status: 'UNAVAILABLE', time: 'Post-Procurement', desc: 'Cryptographically signed J-Form receipt' },
    { stage: 'PAYMENT STATUS', status: 'UNAVAILABLE', time: 'Within 48 Hours', desc: 'Direct Benefit Transfer (DBT) to bank' },
  ];

  return (
    <div className="bg-white rounded-2xl border-2 border-[#0B1726] p-6 shadow-[4px_4px_0px_#0B1726] mb-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0B1726]/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#DCEFF0] border border-[#008F83]/40 text-[#006B65] text-xs font-heading font-extrabold uppercase tracking-wider mb-1 shadow-[1.5px_1.5px_0px_#0B1726]">
            MANDI PROCUREMENT & TOKEN DESK
          </div>
          <h3 className="font-heading font-black text-xl text-[#0B1726]">
            Active Booking & Queue Status
          </h3>
          <p className="text-xs text-[#435466]">
            Official state grain procurement slot and digital queue tracking for Lucknow District.
          </p>
        </div>

        <button
          onClick={() => setShowBookingModal(!showBookingModal)}
          className="px-4 py-2 rounded-xl bg-[#F7F3EA] border-2 border-[#0B1726] text-xs font-heading font-bold text-[#0B1726] hover:bg-[#0B1726] hover:text-white transition-all shadow-[2px_2px_0px_#0B1726] hover:shadow-none self-start sm:self-auto"
        >
          {showBookingModal ? 'Hide Step Flow' : 'Create New Slot Booking'}
        </button>
      </div>

      {/* Step Flow (Section 8) */}
      {showBookingModal && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#FDFBF7] border-2 border-[#0B1726] shadow-[2px_2px_0px_#0B1726] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#0B1726]">
              BOOKING CREATION FLOW
            </span>
            <span className="text-[10px] font-mono text-[#62768A]">STEP {activeStep} OF 5</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {steps.map((st, idx) => (
              <button
                key={st.num}
                onClick={() => setActiveStep(idx + 1)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  activeStep === idx + 1
                    ? 'bg-[#008F83] text-white border-[#0B1726] shadow-[2px_2px_0px_#0B1726]'
                    : activeStep > idx + 1
                    ? 'bg-[#EBF5EE] text-[#2F7D4A] border-[#2F7D4A]/30'
                    : 'bg-white text-[#435466] border-[#0B1726]/10'
                }`}
              >
                <div className="font-mono font-bold text-xs">{st.num}</div>
                <div className="font-heading font-bold text-[11px] truncate">{st.title}</div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-white rounded-lg border border-[#0B1726]/15 text-xs text-[#435466]">
            <strong>Step {activeStep}: {steps[activeStep - 1].title}</strong> — {steps[activeStep - 1].desc}
          </div>
        </div>
      )}

      {/* Token Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-[#F7F3EA] rounded-xl border-2 border-[#0B1726] p-5 shadow-[3px_3px_0px_#0B1726] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#62768A]">
              YOUR ACTIVE TOKEN
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FEF6E9] border border-[#E5A33D] text-[#9A6218] text-[10px] font-mono font-bold">
              WAITING
            </span>
          </div>

          <div className="font-mono font-black text-xl sm:text-2xl text-[#0B1726] tracking-tight">
            TOK-LKO01-20240626-042
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#0B1726]/15 text-center">
            <div className="p-2 rounded-lg bg-white border border-[#0B1726]/10">
              <span className="text-[10px] text-[#62768A] block font-medium">Position</span>
              <strong className="text-base font-mono font-bold text-[#0B1726]">#14</strong>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#0B1726]/10">
              <span className="text-[10px] text-[#62768A] block font-medium">Ahead</span>
              <strong className="text-base font-mono font-bold text-[#E5A33D]">13</strong>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#0B1726]/10">
              <span className="text-[10px] text-[#62768A] block font-medium">Est. Wait</span>
              <strong className="text-base font-mono font-bold text-[#008F83]">45 min</strong>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#435466] pt-2 border-t border-[#0B1726]/15">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#008F83]" />
              <span>Bakshi Ka Talab Mandi Samiti, Yard 2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#008F83]" />
              <span>June 26, 2024 • Morning Slot (08:00 - 12:00)</span>
            </div>
          </div>
        </div>

        {/* Vertical Procurement & Payment Timeline (Section 9) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#0B1726] mb-3">
            PROCUREMENT & PAYMENT LIFECYCLE
          </div>

          <div className="space-y-2">
            {timelineStages.map((tItem, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg border border-[#0B1726]/10 bg-white hover:bg-[#FDFBF7] transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold text-[#62768A] w-5">
                    0{idx + 1}
                  </span>
                  <div>
                    <span className="font-heading font-bold text-[#0B1726] mr-2">
                      {tItem.stage}
                    </span>
                    <span className="text-[11px] text-[#62768A] hidden sm:inline">
                      {tItem.desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      tItem.status === 'COMPLETED'
                        ? 'bg-[#EBF5EE] text-[#2F7D4A]'
                        : tItem.status === 'IN_PROGRESS'
                        ? 'bg-[#FEF6E9] text-[#E5A33D]'
                        : tItem.status === 'PENDING'
                        ? 'bg-[#EFF6FF] text-[#3B82F6]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tItem.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
