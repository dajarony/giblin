import React, { useState } from 'react';
import { GameState } from '../../types/game';
import { STATIONS } from '../../game/constants';
import { Download, Sparkles, X, Camera } from 'lucide-react';

interface PhotoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshotUrl: string | null;
  gameState: GameState;
  onPostcardSaved: () => void;
}

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({
  isOpen,
  onClose,
  screenshotUrl,
  gameState,
  onPostcardSaved
}) => {
  const currentStation = STATIONS[gameState.currentStationIndex];
  const [caption, setCaption] = useState<string>(`Crossing the skies near ${currentStation.name}`);
  const [filter, setFilter] = useState<'normal' | 'warm' | 'sepia' | 'vivid'>('warm');

  if (!isOpen || !screenshotUrl) return null;

  const filterStyles = {
    normal: '',
    warm: 'sepia(25%) saturate(130%) contrast(105%) brightness(102%)',
    sepia: 'sepia(65%) contrast(95%) brightness(95%)',
    vivid: 'saturate(160%) contrast(110%)'
  };

  const handleDownload = () => {
    // Create an offscreen canvas to render the complete framed postcard with stamp & caption
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Parchment card background
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Frame border
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#e2d5c0';
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner gold border
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d4a340';
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    // Draw main screenshot image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = screenshotUrl;
    img.onload = () => {
      // Apply CSS filter to canvas if supported or draw directly
      ctx.drawImage(img, 50, 50, 1100, 580);

      // Postcard text & Stamp
      ctx.fillStyle = '#382216';
      ctx.font = 'bold 28px "Comfortaa", sans-serif';
      ctx.fillText(`"${caption}"`, 60, 680);

      ctx.font = '600 18px "Quicksand", sans-serif';
      ctx.fillStyle = '#1e4738';
      ctx.fillText(`Aethelgard Aerial Tramways • ${currentStation.region}`, 60, 715);

      ctx.fillStyle = '#8c7565';
      ctx.font = '14px sans-serif';
      ctx.fillText(`Speed: ${Math.round(gameState.speed)} km/h  |  Comfort: ${Math.round(gameState.comfort)}%  |  Alt: 420m`, 60, 745);

      // Stamp badge in bottom right
      ctx.fillStyle = '#d4a340';
      ctx.beginPath();
      ctx.arc(1080, 710, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#221a15';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('AETHELGARD', 1080, 700);
      ctx.fillText('POSTAL AIR', 1080, 720);

      // Download
      const link = document.createElement('a');
      link.download = `Aethelgard_Postcard_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      onPostcardSaved();
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#fbf7ee] border-2 border-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#382216]">
        {/* Header */}
        <div className="bg-[#241d2d] text-[#fbf7ee] px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-[#d4a340]" />
            <div>
              <h2 className="font-comfortaa font-bold text-lg text-[#f2e8cf]">
                Postcard from Aethelgard
              </h2>
              <p className="text-xs text-[#b8aebf]">
                Framed snapshot from the cloud railways
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

        {/* Postcard Preview Frame */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-[#f4eedf] p-4 md:p-6 rounded-2xl border-4 border-[#e2d5c0] shadow-md relative">
            <div className="overflow-hidden rounded-xl border-2 border-white shadow-inner">
              <img
                src={screenshotUrl}
                alt="Tram Journey View"
                className="w-full h-56 md:h-72 object-cover transition-all"
                style={{ filter: filterStyles[filter] }}
              />
            </div>

            {/* Postcard Details */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <div className="space-y-1">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="font-comfortaa font-bold text-sm md:text-base text-[#382216] bg-transparent border-b border-[#382216]/30 focus:border-[#1e4738] outline-none w-full pb-0.5"
                  placeholder="Enter postcard message…"
                />
                <div className="text-xs font-semibold text-[#1e4738]">
                  Aethelgard Aerial Tramways • {currentStation.name}
                </div>
              </div>

              {/* Postal Stamp */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#d4a340] bg-[#fffbf2] flex flex-col items-center justify-center text-center shadow-sm shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#7a5818]">Air Mail</span>
                <span className="text-base">🚡</span>
                <span className="text-[8px] font-bold text-[#8c7565]">Aethelgard</span>
              </div>
            </div>
          </div>

          {/* Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7a6452]">Color Filter:</span>
            {(['warm', 'vivid', 'sepia', 'normal'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#1e4738] text-white shadow'
                    : 'bg-black/5 hover:bg-black/10 text-[#6a482f]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f0e7d5] px-6 py-4 flex justify-between items-center border-t border-[#382216]/10">
          <span className="text-xs text-[#7a6452] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a340]" />
            Ready for your travel scrapbook
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold font-comfortaa text-[#6a482f] hover:bg-black/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="bg-gradient-to-br from-[#1e4738] to-[#285d4a] text-white px-5 py-2.5 rounded-xl font-comfortaa font-bold text-xs shadow hover:scale-102 active:scale-98 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Postcard (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
