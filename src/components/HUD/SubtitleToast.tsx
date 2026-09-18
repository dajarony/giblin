import React from 'react';

interface SubtitleToastProps {
  message: string | null;
  speaker?: string;
  avatar?: string;
}

export const SubtitleToast: React.FC<SubtitleToastProps> = ({ message, speaker, avatar }) => {
  if (!message) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-lg w-[90%] transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="bg-[#241a15]/90 backdrop-blur-md border border-[#e8d5b5]/30 text-[#fbf7ee] px-6 py-3.5 rounded-3xl shadow-2xl flex items-center gap-3.5 justify-center text-center">
        {avatar && <span className="text-2xl shrink-0">{avatar}</span>}
        <div className="flex flex-col text-left">
          {speaker && (
            <span className="text-xs uppercase tracking-wider font-bold text-[#e6b840]">
              {speaker}
            </span>
          )}
          <span className="text-sm font-semibold tracking-wide text-[#f5ecd8] leading-snug">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};
