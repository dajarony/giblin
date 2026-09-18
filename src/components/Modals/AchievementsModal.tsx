import React from 'react';
import { Achievement } from '../../types/game';
import { Trophy, CheckCircle2, Lock, X } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#fbf7ee] border-2 border-white/80 w-full max-w-lg max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#382216]">
        {/* Header */}
        <div className="bg-[#241d2d] text-[#fbf7ee] px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#d4a340]" />
            <div>
              <h2 className="font-comfortaa font-bold text-lg md:text-xl text-[#f2e8cf]">
                Conductor Milestones
              </h2>
              <p className="text-xs text-[#b8aebf]">
                {unlockedCount} of {achievements.length} badges unlocked
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-2xl p-4 border-2 transition-all flex items-start gap-3.5 ${
                ach.unlocked
                  ? 'bg-[#eef7f2] border-[#3d8b68]/40 shadow-sm'
                  : 'bg-white border-[#382216]/10 opacity-75'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                ach.unlocked ? 'bg-[#d4a340]/25 border border-[#d4a340]' : 'bg-black/5 border border-black/10'
              }`}>
                {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-black/30" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-comfortaa font-bold text-sm text-[#382216]">
                    {ach.title}
                  </h4>
                  {ach.unlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#1e4738]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#8c7565] uppercase">
                      Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#614e41] mt-1 font-medium leading-relaxed">
                  {ach.description}
                </p>

                {ach.maxProgress && !ach.unlocked && (
                  <div className="mt-2 w-full h-2 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#d4a340] rounded-full transition-all"
                      style={{ width: `${((ach.progress || 0) / ach.maxProgress) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[#f0e7d5] px-6 py-3.5 text-right border-t border-[#382216]/10">
          <button
            onClick={onClose}
            className="bg-[#1e4738] text-white px-5 py-2 rounded-xl font-comfortaa font-bold text-xs shadow hover:scale-102 transition-all cursor-pointer"
          >
            Close Milestones
          </button>
        </div>
      </div>
    </div>
  );
};
