import React from 'react';
import { Volume2, VolumeX, Play, Pause, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../utils/cn';

export interface AudioBriefingBarProps {
  title?: string;
  durationText?: string;
  className?: string;
}

export const AudioBriefingBar: React.FC<AudioBriefingBarProps> = ({
  title,
  durationText = '1:35 min',
  className,
}) => {
  const { t } = useTranslation();
  const { isAudioBriefingPlaying, toggleAudioBriefing } = useAppStore();

  const displayTitle = title || t('farmer.todayBriefing');

  return (
    <div
      className={cn(
        'bg-brand-azure-tint border border-brand-azure-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm',
        isAudioBriefingPlaying && 'ring-2 ring-brand-azure/50',
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={toggleAudioBriefing}
          aria-label={isAudioBriefingPlaying ? 'Pause audio briefing' : 'Play audio briefing'}
          className="w-12 h-12 rounded-full bg-brand-azure hover:bg-brand-azure-dark text-white flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-azure"
        >
          {isAudioBriefingPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-heading font-semibold text-sm text-slate-900 truncate">
              {displayTitle}
            </h4>
            {isAudioBriefingPlaying && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-brand-azure uppercase">
                <Radio className="w-3 h-3 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 truncate mt-0.5">
            {t('farmer.audioNotice')} • {durationText}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2">
        {/* Animated Audio Waveform Mock */}
        {[30, 70, 45, 90, 60, 100, 40, 80, 50, 75].map((height, i) => (
          <span
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-300',
              isAudioBriefingPlaying ? 'bg-brand-azure animate-pulse' : 'bg-brand-azure/30'
            )}
            style={{
              height: isAudioBriefingPlaying ? `${height}%` : '8px',
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>

      <button
        onClick={toggleAudioBriefing}
        className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-brand-azure-dark border border-brand-azure-border text-xs font-semibold font-heading shrink-0 flex items-center gap-1.5 shadow-xs"
      >
        {isAudioBriefingPlaying ? (
          <>
            <VolumeX className="w-3.5 h-3.5" />
            <span>{t('common.stop')}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            <span>{t('common.listen')}</span>
          </>
        )}
      </button>
    </div>
  );
};
