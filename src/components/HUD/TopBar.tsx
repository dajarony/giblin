import React from 'react';
import { GameState, CameraMode } from '../../types/game';
import { STATIONS } from '../../game/constants';
import { 
  Camera, 
  Volume2, 
  VolumeX, 
  Music, 
  Sun, 
  Users, 
  Coins, 
  Wrench, 
  Sparkles, 
  Camera as PhotoIcon, 
  HelpCircle, 
  Trophy 
} from 'lucide-react';

interface TopBarProps {
  gameState: GameState;
  onToggleCamera: () => void;
  onToggleAudio: () => void;
  onToggleMusic: () => void;
  onOpenWorkshop: () => void;
  onOpenWeather: () => void;
  onOpenPassengerLog: () => void;
  onOpenPhotoMode: () => void;
  onOpenAchievements: () => void;
  onOpenHelp: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  gameState,
  onToggleCamera,
  onToggleAudio,
  onToggleMusic,
  onOpenWorkshop,
  onOpenWeather,
  onOpenPassengerLog,
  onOpenPhotoMode,
  onOpenAchievements,
  onOpenHelp
}) => {
  const currentStation = STATIONS[gameState.currentStationIndex];
  const nextStation = STATIONS[(gameState.currentStationIndex + 1) % STATIONS.length];

  const cameraNames: Record<CameraMode, string> = {
    chase: 'Chase Cam',
    cab: 'Cab Driver',
    passenger: 'Window Seat',
    scenic: 'Scenic Orbit',
    birds_eye: "Bird's Eye"
  };

  return (
    <div className="w-full flex justify-between items-start gap-4 p-4 md:p-6 pointer-events-none select-none">
      {/* ── Left Card: Station Destination & Passenger Stats ── */}
      <div className="glass-panel rounded-2xl p-3.5 md:p-4 max-w-[280px] md:max-w-xs pointer-events-auto flex flex-col gap-1.5 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4a340] shadow-[0_0_8px_#d4a340] animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#1e4738]">
            {currentStation.region}
          </span>
        </div>

        <div className="font-comfortaa font-bold text-lg md:text-xl text-[#382216] leading-tight">
          {nextStation.name}
        </div>

        <div className="text-[11px] text-[#7a6452] font-medium leading-tight line-clamp-1">
          {nextStation.tagline}
        </div>

        <div className="flex items-center gap-2.5 mt-1 pt-1.5 border-t border-[#382216]/10">
          <button 
            onClick={onOpenPassengerLog}
            className="flex items-center gap-1.5 bg-[#382216]/5 hover:bg-[#382216]/10 active:scale-95 px-2.5 py-1 rounded-lg text-xs font-bold text-[#382216] transition-all cursor-pointer"
            title="View Passenger Stories & Requests"
          >
            <Users className="w-3.5 h-3.5 text-[#1e4738]" />
            <span>{gameState.passengers} / {gameState.maxPassengers}</span>
          </button>

          <div 
            className="flex items-center gap-1.5 bg-[#d4a340]/15 px-2.5 py-1 rounded-lg text-xs font-bold text-[#7a5818]"
            title="Available Tips & Gold"
          >
            <Coins className="w-3.5 h-3.5 text-[#d4a340]" />
            <span>{gameState.gold}</span>
          </div>
        </div>
      </div>

      {/* ── Center: Station Progress Bar with all 4 stations ── */}
      <div className="hidden lg:flex flex-col items-center gap-1.5 pointer-events-auto max-w-md w-[32vw]">
        {/* Station Name Labels */}
        <div className="w-full flex justify-between text-[11px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-1">
          {STATIONS.map((st, i) => (
            <span 
              key={st.id} 
              className={`transition-all duration-300 ${
                i === gameState.currentStationIndex ? 'text-[#f5d061] scale-105' : 'opacity-85'
              }`}
            >
              {st.name.split(' ')[0]}
            </span>
          ))}
        </div>

        {/* Track Bar with Moving Tram Pin */}
        <div className="w-full h-3 bg-white/30 backdrop-blur-md rounded-full relative overflow-hidden border border-white/60 shadow-md">
          {/* Track Fill */}
          <div 
            className="h-full bg-gradient-to-r from-[#d4a340] via-[#ffb26b] to-[#48bca2] transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${(gameState.trackPos * 100).toFixed(1)}%` }}
          />

          {/* Station Milestone Dots */}
          {STATIONS.map((st) => (
            <div
              key={st.id}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-[#382216] shadow"
              style={{ left: `${st.u * 100}%` }}
              title={st.name}
            />
          ))}
        </div>

        {/* Tram Pin Indicator */}
        <div 
          className="relative w-full -mt-2.5 h-4 pointer-events-none"
        >
          <div 
            className="absolute -translate-x-1/2 top-0 flex flex-col items-center transition-all duration-100"
            style={{ left: `${gameState.trackPos * 100}%` }}
          >
            <span className="text-sm -rotate-90 filter drop-shadow">🚡</span>
          </div>
        </div>
      </div>

      {/* ── Right: Streak & Quick Action Buttons ── */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        {/* Streak Multiplier Badge */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/80 shadow-md text-xs font-bold transition-all duration-300"
          style={{
            background: gameState.comfort > 75 
              ? 'linear-gradient(135deg, #ffe29f, #ffa99f)' 
              : 'rgba(240, 230, 220, 0.9)',
            color: '#382216'
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c2593f] animate-spin" style={{ animationDuration: '6s' }} />
          <span>Streak ×{gameState.streak.toFixed(1)}</span>
          <span className="hidden sm:inline opacity-80 text-[10px]">
            ({gameState.comfort > 75 ? 'Smooth Cruise' : 'Balancing'})
          </span>
        </div>

        {/* Buttons Group */}
        <div className="flex items-center gap-1.5">
          {/* Camera Switcher */}
          <button
            onClick={onToggleCamera}
            className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white active:scale-95 transition-all text-[#382216] cursor-pointer"
            title={`Camera: ${cameraNames[gameState.cameraMode]} (Press C)`}
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleAudio}
            className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white active:scale-95 transition-all text-[#382216] cursor-pointer"
            title={gameState.audioEnabled ? "Sound Effects ON" : "Sound Effects OFF"}
          >
            {gameState.audioEnabled ? <Volume2 className="w-4 h-4 text-[#1e4738]" /> : <VolumeX className="w-4 h-4 text-[#c2593f]" />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={onToggleMusic}
            className={`glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer ${
              gameState.musicEnabled ? 'text-[#1e4738] ring-2 ring-[#48bca2]' : 'text-[#8c7565]'
            }`}
            title={gameState.musicEnabled ? "Lo-Fi Melody ON" : "Lo-Fi Melody OFF"}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Weather / Time of Day */}
          <button
            onClick={onOpenWeather}
            className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white active:scale-95 transition-all text-[#382216] cursor-pointer"
            title="Time of Day & Atmosphere"
          >
            <Sun className="w-4 h-4 text-[#d4a340]" />
          </button>

          {/* Photo Mode */}
          <button
            onClick={onOpenPhotoMode}
            className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white active:scale-95 transition-all text-[#382216] cursor-pointer"
            title="Postcard Photo Mode (Press P)"
          >
            <PhotoIcon className="w-4 h-4 text-[#3d7b88]" />
          </button>

          {/* Achievements */}
          <button
            onClick={onOpenAchievements}
            className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white active:scale-95 transition-all text-[#382216] cursor-pointer"
            title="Achievements & Milestones"
          >
            <Trophy className="w-4 h-4 text-[#d4a340]" />
          </button>

          {/* Help & Guide */}
          <button
            onClick={onOpenHelp}
            className="glass-panel w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white active:scale-95 transition-all text-[#382216] cursor-pointer"
            title="Controls & Conductor Guide"
          >
            <HelpCircle className="w-4 h-4 text-[#382216]" />
          </button>

          {/* Oliver's Workshop Main CTA */}
          <button
            onClick={onOpenWorkshop}
            className="bg-gradient-to-br from-[#d4a340] to-[#ffaa42] text-[#382216] border-2 border-white rounded-xl px-3 h-10 flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all font-comfortaa font-bold text-xs cursor-pointer ml-1"
            title="Visit Oliver's Cloudworks Workshop"
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden md:inline">Oliver's Cloudworks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
