import React from 'react';
import { HelpCircle, X, Sparkles, Wind, Compass } from 'lucide-react';

interface HelpControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpControlsModal: React.FC<HelpControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#fbf7ee] border-2 border-white/80 w-full max-w-xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#382216]">
        {/* Header */}
        <div className="bg-[#241d2d] text-[#fbf7ee] px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-[#d4a340]" />
            <div>
              <h2 className="font-comfortaa font-bold text-lg md:text-xl text-[#f2e8cf]">
                Conductor's Guide & Controls
              </h2>
              <p className="text-xs text-[#b8aebf]">
                Aerial tram driving physics & archipelago handbook
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Key Controls Grid */}
          <div>
            <h3 className="font-comfortaa font-bold text-sm text-[#1e4738] mb-2.5">
              Keyboard & Touch Controls
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-white rounded-xl p-3 border border-[#382216]/10 shadow-sm flex flex-col gap-1">
                <kbd className="bg-[#f2e8cf] text-[#382216] px-2 py-1 rounded text-xs font-bold w-fit border border-black/10">
                  W / ↑
                </kbd>
                <span className="text-xs font-bold text-[#1e4738]">Power Throttle</span>
                <span className="text-[10px] text-[#7a6452]">Accelerate tram</span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-[#382216]/10 shadow-sm flex flex-col gap-1">
                <kbd className="bg-[#f2e8cf] text-[#382216] px-2 py-1 rounded text-xs font-bold w-fit border border-black/10">
                  S / ↓
                </kbd>
                <span className="text-xs font-bold text-[#c2593f]">Brake Calipers</span>
                <span className="text-[10px] text-[#7a6452]">Decelerate / Stop</span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-[#382216]/10 shadow-sm flex flex-col gap-1">
                <kbd className="bg-[#f2e8cf] text-[#382216] px-2 py-1 rounded text-xs font-bold w-fit border border-black/10">
                  Space
                </kbd>
                <span className="text-xs font-bold text-[#d4a340]">Ring Tram Bell</span>
                <span className="text-[10px] text-[#7a6452]">Greet stations</span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-[#382216]/10 shadow-sm flex flex-col gap-1">
                <kbd className="bg-[#f2e8cf] text-[#382216] px-2 py-1 rounded text-xs font-bold w-fit border border-black/10">
                  A / D / Drag
                </kbd>
                <span className="text-xs font-bold text-[#382216]">Pan Camera</span>
                <span className="text-[10px] text-[#7a6452]">Orbit perspective</span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-[#382216]/10 shadow-sm flex flex-col gap-1">
                <kbd className="bg-[#f2e8cf] text-[#382216] px-2 py-1 rounded text-xs font-bold w-fit border border-black/10">
                  C Key
                </kbd>
                <span className="text-xs font-bold text-[#382216]">Cycle Camera</span>
                <span className="text-[10px] text-[#7a6452]">Chase / Cab / Scenic</span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-[#382216]/10 shadow-sm flex flex-col gap-1">
                <kbd className="bg-[#f2e8cf] text-[#382216] px-2 py-1 rounded text-xs font-bold w-fit border border-black/10">
                  P Key
                </kbd>
                <span className="text-xs font-bold text-[#3d7b88]">Postcard Snap</span>
                <span className="text-[10px] text-[#7a6452]">Photo Mode</span>
              </div>
            </div>
          </div>

          {/* Conductor's Tips */}
          <div className="space-y-2.5 pt-2 border-t border-[#382216]/10">
            <h3 className="font-comfortaa font-bold text-sm text-[#1e4738]">
              Conductor's Art & Sky Etiquette
            </h3>

            <div className="bg-white rounded-2xl p-3.5 border border-[#382216]/10 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#d4a340] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#382216]">Smooth Cruise & Multiplier Streaks</h4>
                <p className="text-xs text-[#614e41] mt-0.5 leading-relaxed font-medium">
                  Smooth throttle input and taking curves gently maintains 100% comfort. This builds up your tipping streak multiplier up to 4.0×!
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-[#382216]/10 flex items-start gap-3">
              <Wind className="w-5 h-5 text-[#3d7b88] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#382216]">Crosswinds on High Spire Viaducts</h4>
                <p className="text-xs text-[#614e41] mt-0.5 leading-relaxed font-medium">
                  When passing the High Pines bridge (500m elevation), crosswinds are strong. Stay below 40 km/h to prevent severe cabin roll.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-[#382216]/10 flex items-start gap-3">
              <Compass className="w-5 h-5 text-[#c2593f] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#382216]">Floating Sky Mail Parcels</h4>
                <p className="text-xs text-[#614e41] mt-0.5 leading-relaxed font-medium">
                  Keep an eye out for golden glowing mail parcels floating along the rails. Glide through them to collect extra gold and postal achievements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f0e7d5] px-6 py-3.5 text-right border-t border-[#382216]/10">
          <button
            onClick={onClose}
            className="bg-[#1e4738] text-white px-5 py-2 rounded-xl font-comfortaa font-bold text-xs shadow hover:scale-102 transition-all cursor-pointer"
          >
            Ready to Drive
          </button>
        </div>
      </div>
    </div>
  );
};
