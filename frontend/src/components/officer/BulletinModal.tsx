import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
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
          <div className="w-14 h-14 bg-brand-emerald-tint text-brand-emerald rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-heading font-bold text-lg text-slate-900">
            Advisory Bulletin Broadcasted!
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Dispatched via SMS gateway and Kisan Mitra portal across 84 Gram Panchayats in {selectedBlock} Block.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Demonstration Simulation:</strong> Real SMS gateways and WhatsApp dissemination will be active in later phases.
            </span>
          </div>

          <div>
            <Input
              label="Bulletin Title"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Advisory Content (Hindi & English)
            </label>
            <textarea
              rows={6}
              value={bulletinBody}
              onChange={(e) => setBulletinBody(e.target.value)}
              className="w-full bg-white border border-surface-border text-slate-900 rounded-lg p-3 text-xs leading-relaxed focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none"
            />
          </div>

          <div className="bg-surface-muted p-3 rounded-xl border border-surface-border flex items-center justify-between text-xs">
            <span className="text-slate-600">Dissemination Channels:</span>
            <div className="flex gap-2">
              <Badge variant="teal" size="sm">SMS (Hindi)</Badge>
              <Badge variant="azure" size="sm">Kisan Mitra WhatsApp</Badge>
              <Badge variant="neutral" size="sm">KVK Bulletin PDF</Badge>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
            <Button variant="ghost" size="sm" onClick={() => setBulletinModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="w-4 h-4" />}
              onClick={handleSend}
            >
              Broadcast Bulletin
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
