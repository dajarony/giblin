import React from 'react';
import { GameState } from '../../types/game';
import { PASSENGER_STORIES } from '../../game/constants';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

interface PassengerLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onSelectRequest: (storyId: string) => void;
}

export const PassengerLogModal: React.FC<PassengerLogModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onSelectRequest
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#fbf7ee] border-2 border-white/80 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#382216]">
        {/* Header */}
        <div className="bg-[#241d2d] text-[#fbf7ee] px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="font-comfortaa font-bold text-lg md:text-xl text-[#f2e8cf]">
                Passengers of Aethelgard
              </h2>
              <p className="text-xs text-[#b8aebf]">
                Traveler stories, route requests & special rewards
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

        {/* Stories List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {PASSENGER_STORIES.map((story) => {
            const isActive = gameState.activePassengerStory?.id === story.id;
            const isCompleted = gameState.activePassengerStory?.id === story.id && gameState.activePassengerStory.activeRequest?.completed;

            return (
              <div
                key={story.id}
                className={`rounded-2xl p-4.5 border-2 transition-all ${
                  isActive
                    ? 'bg-[#f4f8f2] border-[#1e4738] shadow-md ring-2 ring-[#1e4738]/20'
                    : 'bg-white border-[#382216]/10 hover:border-[#d4a340]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#f2e8cf] border border-[#382216]/15 flex items-center justify-center text-2xl shadow-sm shrink-0">
                      {story.avatar}
                    </div>
                    <div>
                      <h3 className="font-comfortaa font-bold text-base text-[#382216]">
                        {story.name}
                      </h3>
                      <div className="text-xs font-semibold text-[#7a6452]">
                        {story.title}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-[#1e4738] bg-[#1e4738]/10 px-2.5 py-1 rounded-lg shrink-0">
                    {story.stationOrigin} → {story.stationDest}
                  </span>
                </div>

                <p className="text-xs italic text-[#543b28] mt-3 bg-[#fbf7ee] p-2.5 rounded-xl border border-black/5">
                  "{story.quote}"
                </p>

                {story.activeRequest && (
                  <div className="mt-3 pt-3 border-t border-[#382216]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="text-xs font-semibold text-[#1e4738] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4a340] shrink-0" />
                      <span>{story.activeRequest.text}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-[#7a5818] bg-[#d4a340]/20 px-2 py-0.5 rounded-md">
                        +{story.activeRequest.reward} 🪙
                      </span>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#2d6849]">
                          <CheckCircle2 className="w-4 h-4" />
                          Done!
                        </span>
                      ) : isActive ? (
                        <span className="text-xs font-bold text-[#1e4738] bg-[#1e4738]/15 px-3 py-1 rounded-lg">
                          Active Request
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectRequest(story.id)}
                          className="bg-[#1e4738] hover:bg-[#285d4a] text-white px-3 py-1 rounded-lg font-comfortaa font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          Accept Request
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#f0e7d5] px-6 py-3.5 text-right border-t border-[#382216]/10">
          <button
            onClick={onClose}
            className="bg-[#1e4738] text-white px-5 py-2 rounded-xl font-comfortaa font-bold text-xs shadow hover:scale-102 transition-all cursor-pointer"
          >
            Close Passenger Log
          </button>
        </div>
      </div>
    </div>
  );
};
