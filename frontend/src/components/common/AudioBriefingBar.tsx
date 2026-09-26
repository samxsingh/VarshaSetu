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
        'bg-[#DBEAFE]/40 border-2 border-[#102A43] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-[3px_3px_0px_#102A43]',
        isAudioBriefingPlaying && 'ring-2 ring-[#2563EB]',
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={toggleAudioBriefing}
          aria-label={isAudioBriefingPlaying ? 'Pause audio briefing' : 'Play audio briefing'}
          className="w-12 h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-2 border-[#102A43] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#102A43] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          {isAudioBriefingPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-heading font-extrabold text-sm text-[#102A43] truncate">
              {displayTitle}
            </h4>
            {isAudioBriefingPlaying && (
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#2563EB] uppercase">
                <Radio className="w-3 h-3 animate-pulse" />
                Audio Preview
              </span>
            )}
          </div>
          <p className="text-xs text-[#486581] truncate mt-0.5 font-sans">
            {t('common.simulatedAudioNotice')}
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
              isAudioBriefingPlaying ? 'bg-[#2563EB] animate-pulse' : 'bg-[#2563EB]/30'
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
        className="px-4 py-2 min-h-[44px] rounded-xl bg-white hover:bg-[#EAF0F2] text-[#102A43] border-2 border-[#102A43] text-xs font-bold font-heading shrink-0 flex items-center gap-1.5 shadow-[2px_2px_0px_#102A43] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]"
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
