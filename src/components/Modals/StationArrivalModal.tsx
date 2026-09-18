import React, { useEffect } from 'react';
import { GameState, StationData } from '../../types/game';
import { Coins, Sparkles, Coffee, Users, ArrowRight, Wrench } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StationArrivalModalProps {
  isOpen: boolean;
  onDepart: () => void;
  onOpenWorkshop: () => void;
  station: StationData;
  gameState: GameState;
  earnedTips: number;
}

export const StationArrivalModal: React.FC<StationArrivalModalProps> = ({
  isOpen,
  onDepart,
  onOpenWorkshop,
  station,
  gameState,
  earnedTips
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#d4a340', '#c2593f', '#1e4738', '#ffdf88']
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isWorkshopDock = station.id === 'cloudworks';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/55 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-[#fbf7ee] border-2 border-white/90 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-[#382216]">
        {/* Header Ribbon */}
        <div 
          className="px-6 py-5 text-white flex justify-between items-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${station.color}, #1c2b28)` }}
        >
          <div>
            <div className="text-[11px] uppercase tracking-widest font-bold opacity-80">
              Station Arrival • {station.region}
            </div>
            <h2 className="font-comfortaa font-bold text-2xl mt-0.5">
              {station.name}
            </h2>
          </div>

          <div className="text-4xl">🚡</div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#6a482f] font-medium leading-relaxed bg-[#f2e8cf]/70 p-3 rounded-2xl border border-black/5">
            {station.desc}
          </p>

          {/* Earnings Breakdown Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#382216]/10 shadow-sm space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-[#7a6452]">
              <span>Base Transit Fare</span>
              <span>+45 🪙</span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-[#1e4738]">
              <span className="flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5" />
                Comfort Bonus ({Math.round(gameState.comfort)}%)
              </span>
              <span>+{Math.floor(gameState.comfort * 0.75)} 🪙</span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-[#c2593f]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Streak Multiplier (×{gameState.streak.toFixed(1)})
              </span>
              <span>Boost Applied ✨</span>
            </div>

            <div className="pt-2 border-t border-[#382216]/10 flex justify-between items-center font-comfortaa font-bold text-base text-[#1e4738]">
              <span className="flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-[#d4a340]" />
                Total Tips Collected
              </span>
              <span className="text-lg text-[#d4a340]">+{earnedTips} 🪙</span>
            </div>
          </div>

          {/* Trip Quality Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#f2e8cf]/70 rounded-xl px-3 py-2 border border-black/5">
              <div className="text-[9px] uppercase tracking-wider font-bold text-[#8c7565]">
                Trip minimum comfort
              </div>
              <div className="font-comfortaa font-bold text-sm text-[#1e4738]">
                {Math.round(gameState.tripMinimumComfort)}%
              </div>
            </div>
            <div className="bg-[#f2e8cf]/70 rounded-xl px-3 py-2 border border-black/5 text-right">
              <div className="text-[9px] uppercase tracking-wider font-bold text-[#8c7565]">
                Peak speed
              </div>
              <div className="font-comfortaa font-bold text-sm text-[#382216]">
                {Math.round(gameState.tripPeakSpeed)} km/h
              </div>
            </div>
          </div>

          {/* Passenger Turnover Stats */}
          <div className="flex justify-between items-center px-2 text-xs font-semibold text-[#7a6452]">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#1e4738]" />
              <span>Passengers Onboard: <b>{gameState.passengers} / {gameState.maxPassengers}</b></span>
            </div>
            <span className="text-[#1e4738] font-bold">Doors Open 🚪</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-[#f0e7d5] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#382216]/10">
          {isWorkshopDock ? (
            <button
              onClick={onOpenWorkshop}
              className="w-full sm:w-auto bg-[#1e4738] hover:bg-[#285d4a] text-white px-5 py-2.5 rounded-xl font-comfortaa font-bold text-xs shadow flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Wrench className="w-4 h-4 text-[#d4a340]" />
              <span>Enter Oliver's Workshop</span>
            </button>
          ) : (
            <div className="text-xs text-[#7a6452] font-semibold">
              All passengers safely alighted
            </div>
          )}

          <button
            onClick={onDepart}
            className="w-full sm:w-auto bg-gradient-to-br from-[#d4a340] to-[#ffaa42] hover:scale-105 active:scale-95 text-[#382216] border border-white px-6 py-2.5 rounded-xl font-comfortaa font-bold text-xs shadow flex items-center justify-center gap-2 cursor-pointer transition-all ml-auto"
          >
            <span>Depart Station</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
