import React from 'react';
import { GameState } from '../../types/game';
import { Bell, Wind, Compass, Gauge, Coffee } from 'lucide-react';

interface BottomDashboardProps {
  gameState: GameState;
  onPowerStart: () => void;
  onPowerEnd: () => void;
  onBrakeStart: () => void;
  onBrakeEnd: () => void;
  onRingBell: () => void;
  onBlowWhistle: () => void;
  isPowerActive: boolean;
  isBrakeActive: boolean;
}

export const BottomDashboard: React.FC<BottomDashboardProps> = ({
  gameState,
  onPowerStart,
  onPowerEnd,
  onBrakeStart,
  onBrakeEnd,
  onRingBell,
  onBlowWhistle,
  isPowerActive,
  isBrakeActive
}) => {
  const comfortPct = Math.round(gameState.comfort);
  const roundedSpeed = Math.round(gameState.speed);
  const altitude = Math.round(380 + (gameState.trackPos * 120) % 240);

  // Determine comfort condition & color
  let comfortGradient = 'from-[#48bca2] to-[#68d89a]';
  let comfortStatusText = 'Smooth cruise — passengers relaxing';
  if (comfortPct <= 35) {
    comfortGradient = 'from-[#d94b36] to-[#f37b65]';
    comfortStatusText = '⚠️ Cabin shaking! Ease the pedals';
  } else if (comfortPct <= 70) {
    comfortGradient = 'from-[#e5a93c] to-[#f3cf65]';
    comfortStatusText = 'Moderate sway — balance speed';
  }

  // Determine track condition
  let conditionText = '🌿 Steady Calm';
  let conditionColor = 'text-[#1e4738]';
  if (Math.abs(gameState.crosswindForce) > 0.7) {
    conditionText = '💨 High Crosswinds';
    conditionColor = 'text-[#c2593f]';
  } else if (gameState.speed > 50) {
    conditionText = '⚡ High Speed Orbit';
    conditionColor = 'text-[#d4a340]';
  } else if (gameState.inStation) {
    conditionText = '🚪 Station Platform Dock';
    conditionColor = 'text-[#3d7b88]';
  }

  return (
    <div className="w-full flex justify-between items-end gap-3 md:gap-4 p-4 md:p-6 pointer-events-none select-none">
      {/* ── Left Card: Passenger Comfort & Active Story Mission ── */}
      <div className="glass-panel rounded-2xl p-3.5 md:p-4 max-w-[240px] md:max-w-[270px] pointer-events-auto flex flex-col gap-1.5 transition-all">
        <div className="flex justify-between items-center text-xs font-bold text-[#382216]">
          <span className="flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-[#6a4124]" />
            Passenger Comfort
          </span>
          <span className={`text-xs font-bold ${comfortPct > 70 ? 'text-[#1e4738]' : comfortPct > 35 ? 'text-[#c2593f]' : 'text-red-600'}`}>
            {comfortPct}%
          </span>
        </div>

        {/* Meter bar */}
        <div className="w-full h-3 bg-[#e2d9c8] rounded-full overflow-hidden border border-black/5 shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${comfortGradient} transition-all duration-300 rounded-full`}
            style={{ width: `${comfortPct}%` }}
          />
        </div>

        <div className="text-[11px] font-semibold text-[#7a685b] truncate">
          {comfortStatusText}
        </div>

        {/* Active Passenger Mission Reminder (if any) */}
        {gameState.activePassengerStory && (
          <div className="mt-1 pt-1.5 border-t border-[#382216]/10 flex items-start gap-1.5 bg-[#f2e8cf]/60 p-1.5 rounded-lg">
            <span className="text-sm">{gameState.activePassengerStory.avatar}</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#1e4738] uppercase tracking-wide">
                Active Request: {gameState.activePassengerStory.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-[#543b28] line-clamp-1 leading-tight font-medium">
                {gameState.activePassengerStory.activeRequest?.text}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Center Cluster: Speedometer & Dynamic Pedals ── */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        {/* Speedometer Box */}
        <div className="glass-panel rounded-3xl px-6 py-2.5 flex flex-col items-center justify-center shadow-lg border-2 border-white">
          <div className="font-comfortaa font-bold text-3xl md:text-4xl text-[#382216] leading-none tracking-tight flex items-baseline gap-1">
            <span>{roundedSpeed}</span>
            <span className="text-xs uppercase font-bold text-[#8c7565] tracking-wider">km/h</span>
          </div>

          {/* Mini Analog Speed Line */}
          <div className="w-28 h-1.5 bg-black/10 rounded-full overflow-hidden mt-1.5">
            <div 
              className="h-full bg-[#1e4738] transition-all duration-100 rounded-full"
              style={{ width: `${Math.min(100, (gameState.speed / 65) * 100)}%` }}
            />
          </div>
        </div>

        {/* Pedal Controls + Bell & Whistle */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Whistle / Bell button */}
          <button
            onClick={onRingBell}
            onContextMenu={(e) => { e.preventDefault(); onBlowWhistle(); }}
            className="glass-panel w-12 h-14 md:h-16 rounded-2xl flex flex-col items-center justify-center gap-0.5 hover:bg-white active:scale-95 transition-all text-[#382216] cursor-pointer"
            title="Ring Tram Bell [Space] / Right Click for Whistle"
          >
            <Bell className="w-4 h-4 text-[#d4a340]" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Bell</span>
          </button>

          {/* POWER Pedal (W) */}
          <button
            onPointerDown={onPowerStart}
            onPointerUp={onPowerEnd}
            onPointerLeave={onPowerEnd}
            className={`w-20 md:w-24 h-14 md:h-16 rounded-2xl border-2 border-white flex flex-col items-center justify-center text-white font-comfortaa font-bold shadow-lg transition-all select-none cursor-pointer ${
              isPowerActive
                ? 'bg-gradient-to-br from-[#1c4532] to-[#122e22] translate-y-1 shadow-inner'
                : 'bg-gradient-to-br from-[#3d8b68] to-[#2a6349] hover:from-[#479f77] hover:to-[#2f7053]'
            }`}
          >
            <span className="text-xs md:text-sm flex items-center gap-1">
              ▲ POWER
            </span>
            <span className="text-[9px] opacity-75 font-['Quicksand'] font-semibold">
              Hold [W]
            </span>
          </button>

          {/* BRAKE Pedal (S) */}
          <button
            onPointerDown={onBrakeStart}
            onPointerUp={onBrakeEnd}
            onPointerLeave={onBrakeEnd}
            className={`w-20 md:w-24 h-14 md:h-16 rounded-2xl border-2 border-white flex flex-col items-center justify-center text-white font-comfortaa font-bold shadow-lg transition-all select-none cursor-pointer ${
              isBrakeActive
                ? 'bg-gradient-to-br from-[#7a2212] to-[#541409] translate-y-1 shadow-inner'
                : 'bg-gradient-to-br from-[#cf5a44] to-[#a83824] hover:from-[#df6953] hover:to-[#b8422d]'
            }`}
          >
            <span className="text-xs md:text-sm flex items-center gap-1">
              ■ BRAKE
            </span>
            <span className="text-[9px] opacity-75 font-['Quicksand'] font-semibold">
              Hold [S]
            </span>
          </button>
        </div>
      </div>

      {/* ── Right Card: Track Diagnostics & Weather Conditions ── */}
      <div className="glass-panel rounded-2xl p-3.5 md:p-4 max-w-[220px] pointer-events-auto flex flex-col items-end gap-1 text-right transition-all">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#8c7565] flex items-center gap-1">
          <Compass className="w-3 h-3 text-[#8c7565]" />
          Atmospheric Status
        </div>

        <div className={`font-bold text-sm md:text-base ${conditionColor} leading-tight`}>
          {conditionText}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7a6452] mt-0.5">
          <Gauge className="w-3 h-3 text-[#d4a340]" />
          <span>Alt: {altitude}m (Cloud Sea)</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-[#8c7565]">
          <Wind className="w-3 h-3 text-[#3d7b88]" />
          <span>Wind: {Math.round(Math.abs(gameState.crosswindForce) * 28)} kn</span>
        </div>
      </div>
    </div>
  );
};
