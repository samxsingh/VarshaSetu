import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, FileText, X } from 'lucide-react';
import { useOfficerStore } from '../../stores/useOfficerStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

export const BulletinModal: React.FC = () => {
  const { isBulletinModalOpen, setBulletinModalOpen, selectedBlock } = useOfficerStore();
  const [sentSuccess, setSentSuccess] = useState(false);
  const [headline, setHeadline] = useState(
    `Urgent Agromet Advisory: Sowing Preparation & Drainage Precautions for ${selectedBlock} Block`
  );
  const [bulletinBody, setBulletinBody] = useState(
    `Advisory issued for 84 Gram Panchayats: Due to forecasted active monsoon onset between June 26-28 with potential heavy rainfall (>65mm) on June 27, farmers are advised to:\n1. Complete wet-bed nursery sowing for Paddy.\n2. Keep field bund drainage channels open to prevent seed washaway.\n3. Defer broadcasting bare seeds on sloping soils.\n\nHelpline: KVK Lucknow (0522-2970420) / Kisan Call Center 1800-180-1551.`
  );

  const handleSend = () => {
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setBulletinModalOpen(false);
    }, 1800);
  };

  return (
    <Modal
      isOpen={isBulletinModalOpen}
      onClose={() => setBulletinModalOpen(false)}
      title="Disseminate Agromet Advisory Bulletin"
      description={`Broadcast targeted agronomic guidance to all extension workers and registered farmers in ${selectedBlock} Block.`}
      maxWidth="lg"
    >
      {sentSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-[#EBF5EE] text-[#3F7D58] border-2 border-[#3F7D58] rounded-2xl mx-auto flex items-center justify-center shadow-[2px_2px_0px_#3F7D58]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-heading font-extrabold text-lg text-[#102A43]">
            Advisory Bulletin Broadcasted!
          </h4>
          <p className="text-xs text-[#486581] max-w-sm mx-auto leading-relaxed">
            Dispatched via simulated SMS gateway and Kisan Mitra portal across 84 Gram Panchayats in {selectedBlock} Block.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF3C7] border-2 border-[#D97706] text-xs text-[#B45309]">
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Demonstration Simulation:</strong> External telecommunication carriers (SMS, WhatsApp) are NOT CONFIGURED in diagnostic mode. Dispatches are logged to the local in-app event register.
            </span>
          </div>

          <div>
            <label className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#102A43] block mb-1.5">
              Bulletin Title
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-[#FFFFFF] border-2 border-[#102A43] text-[#102A43] font-medium rounded-xl p-3 text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#102A43] block">
              Advisory Content (Hindi & English Bilingual Directive)
            </label>
            <textarea
              rows={6}
              value={bulletinBody}
              onChange={(e) => setBulletinBody(e.target.value)}
              className="w-full bg-[#FFFFFF] border-2 border-[#102A43] text-[#102A43] font-mono rounded-xl p-3 text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            />
          </div>

          <div className="bg-[#F3F6F7] p-3 rounded-xl border border-[#102A43]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-[#486581] font-medium">Dissemination Channels:</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-[#E8F4F6] text-[#155E75] text-[10px] font-mono font-bold border border-[#0E7490]/30">
                SMS (Hindi)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-mono font-bold border border-[#3B82F6]/30">
                WhatsApp Bot
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white text-[#102A43] text-[10px] font-mono font-bold border border-[#102A43]/20">
                KVK Bulletin PDF
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-[#102A43]/10">
            <button
              onClick={() => setBulletinModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-heading font-bold text-[#486581] hover:text-[#102A43] hover:bg-[#102A43]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E7490] text-white border-2 border-[#102A43] shadow-[2px_2px_0px_#102A43] hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-heading font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Bulletin</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
