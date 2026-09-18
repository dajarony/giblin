import React from 'react';
import { WeatherPreset } from '../../types/game';
import { Sun, Sunset, Moon, CloudFog, Sunrise, X, Check } from 'lucide-react';

interface TimeWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeather: WeatherPreset;
  onSelectWeather: (weather: WeatherPreset) => void;
}

export const TimeWeatherModal: React.FC<TimeWeatherModalProps> = ({
  isOpen,
  onClose,
  currentWeather,
  onSelectWeather
}) => {
  if (!isOpen) return null;

  const presets: { id: WeatherPreset; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'golden_morning',
      title: 'Golden Morning Dawn',
      desc: 'Warm honey sunlight breaking through alpine pink mist and soft cloud swells.',
      icon: Sunrise,
      color: 'from-[#e6a15c] to-[#6d435a]'
    },
    {
      id: 'day',
      title: 'Midday Ghibli Azure',
      desc: 'Brilliant deep blue skies, sunlit terracotta roofs, and crystal cloud formations.',
      icon: Sun,
      color: 'from-[#4a8fe7] to-[#1e587d]'
    },
    {
      id: 'sunset',
      title: 'Terracotta Sunset',
      desc: 'Vibrant orange, magenta twilight hues, and glowing lighthouse beacons.',
      icon: Sunset,
      color: 'from-[#c2593f] to-[#3a1d38]'
    },
    {
      id: 'night',
      title: 'Starry Midnight & Aurora',
      desc: 'Deep indigo night sky with shimmering constellations and warm lantern glows.',
      icon: Moon,
      color: 'from-[#1b2438] to-[#0c101c]'
    },
    {
      id: 'fog',
      title: 'Cloud Sea Fog',
      desc: 'Dense mystical cloud blankets that wrap the viaducts in soft vapor.',
      icon: CloudFog,
      color: 'from-[#5d5a6e] to-[#323040]'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#fbf7ee] border-2 border-white/80 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-[#382216]">
        {/* Header */}
        <div className="bg-[#241d2d] text-[#fbf7ee] px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌤️</span>
            <div>
              <h2 className="font-comfortaa font-bold text-lg md:text-xl text-[#f2e8cf]">
                Time of Day & Atmosphere
              </h2>
              <p className="text-xs text-[#b8aebf]">
                Select the lighting mood across the archipelago
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

        {/* Options */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {presets.map((p) => {
            const isSelected = currentWeather === p.id;
            const IconComponent = p.icon;

            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectWeather(p.id);
                  onClose();
                }}
                className={`w-full text-left rounded-2xl p-4 border-2 transition-all flex items-center justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#1e4738] shadow-md ring-2 ring-[#1e4738]/20'
                    : 'bg-[#f7f2e4] border-[#382216]/10 hover:bg-white hover:border-[#d4a340]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white shadow shrink-0`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-comfortaa font-bold text-sm text-[#382216]">
                      {p.title}
                    </h4>
                    <p className="text-xs text-[#614e41] mt-0.5 leading-snug font-medium">
                      {p.desc}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#1e4738] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#f0e7d5] px-6 py-3.5 text-right border-t border-[#382216]/10">
          <button
            onClick={onClose}
            className="bg-[#1e4738] text-white px-5 py-2 rounded-xl font-comfortaa font-bold text-xs shadow hover:scale-102 transition-all cursor-pointer"
          >
            Confirm Atmosphere
          </button>
        </div>
      </div>
    </div>
  );
};
