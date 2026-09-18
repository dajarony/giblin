import React, { useState } from 'react';
import { GameState } from '../../types/game';
import { UPGRADE_ITEMS, PAINT_SCHEMES } from '../../game/constants';
import { Wrench, Palette, BookOpen, Activity, Check, ArrowRight, X, Sparkles, Coins } from 'lucide-react';

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onBuyUpgrade: (upgradeId: string, cost: number) => void;
  onSelectPaint: (paintId: string, cost: number) => void;
}

export const WorkshopModal: React.FC<WorkshopModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onBuyUpgrade,
  onSelectPaint
}) => {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'paint' | 'journal' | 'diagnostics'>('upgrades');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyUpgrade = (id: string, cost: number) => {
    if (gameState.installedUpgrades[id]) return;
    if (gameState.gold < cost) {
      setStatusMessage("Oliver: 'You'll need a few more passenger tips for that one, conductor!'");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    onBuyUpgrade(id, cost);
    setStatusMessage("Cogsworth: 'Clink-clank! Bolting on new brass fittings now!'");
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleApplyPaint = (id: string, cost: number) => {
    if (gameState.selectedPaint === id) return;
    if (!gameState.unlockedPaints[id] && gameState.gold < cost) {
      setStatusMessage("Oliver: 'High-gloss seaside lacquer requires a bit more coin!'");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    onSelectPaint(id, cost);
    setStatusMessage("Oliver: 'Applying fresh coats of lacquer. What a radiant shine!'");
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#fbf7ee] border-2 border-white/80 w-full max-w-4xl h-[90vh] max-h-[750px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#382216]">
        {/* ── Header ── */}
        <div className="bg-[#241d2d] text-[#fbf7ee] px-6 py-4 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#d4a340]/20 border border-[#d4a340]/40 flex items-center justify-center text-2xl shadow-inner">
              🛠️
            </div>
            <div>
              <h2 className="font-comfortaa font-bold text-xl md:text-2xl text-[#f2e8cf] flex items-center gap-2">
                Oliver's Cloudworks
                <span className="text-xs bg-[#d4a340]/30 text-[#f5cf6d] px-2.5 py-0.5 rounded-full font-['Quicksand'] font-semibold">
                  Dock & Hangar
                </span>
              </h2>
              <p className="text-xs text-[#b8aebf]">
                Aerial tram modification, lacquer studio & restoration dock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Available Gold */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-xl font-bold text-sm text-[#f5cf6d]">
              <Coins className="w-4 h-4 text-[#d4a340]" />
              <span>{gameState.gold} 🪙</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="bg-[#f0e7d5] px-6 py-2.5 flex gap-2 border-b border-[#382216]/10 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold font-comfortaa transition-all cursor-pointer ${
              activeTab === 'upgrades'
                ? 'bg-[#1e4738] text-white shadow'
                : 'text-[#6a482f] hover:bg-black/5'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Upgrades & Rigging</span>
          </button>

          <button
            onClick={() => setActiveTab('paint')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold font-comfortaa transition-all cursor-pointer ${
              activeTab === 'paint'
                ? 'bg-[#1e4738] text-white shadow'
                : 'text-[#6a482f] hover:bg-black/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Lacquer & Livery</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold font-comfortaa transition-all cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-[#1e4738] text-white shadow'
                : 'text-[#6a482f] hover:bg-black/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Oliver's Journal</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold font-comfortaa transition-all cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'bg-[#1e4738] text-white shadow'
                : 'text-[#6a482f] hover:bg-black/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Conductor Stats</span>
          </button>
        </div>

        {/* ── Main Tab Content ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: UPGRADES */}
          {activeTab === 'upgrades' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {UPGRADE_ITEMS.map((item) => {
                const isInstalled = !!gameState.installedUpgrades[item.id];
                const canAfford = gameState.gold >= item.cost;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-4.5 border-2 flex flex-col justify-between gap-3 transition-all ${
                      isInstalled
                        ? 'bg-[#eef7f2] border-[#3d8b68]/40 shadow-sm'
                        : 'bg-white border-[#382216]/10 hover:border-[#d4a340] hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#7a6452] bg-[#f2e8cf] px-2.5 py-0.5 rounded-lg">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="font-comfortaa font-bold text-base text-[#382216] mt-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#614e41] mt-1.5 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#382216]/10 flex flex-col gap-2">
                      <div className="text-[11px] font-bold text-[#1e4738] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#d4a340]" />
                        <span>{item.benefit}</span>
                      </div>

                      <button
                        onClick={() => handleApplyUpgrade(item.id, item.cost)}
                        disabled={isInstalled || (!isInstalled && !canAfford)}
                        className={`w-full py-2.5 rounded-xl font-comfortaa font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isInstalled
                            ? 'bg-[#3d8b68]/15 text-[#246344] cursor-default'
                            : canAfford
                            ? 'bg-[#1e4738] text-white hover:bg-[#285f4b] active:scale-98 shadow-md'
                            : 'bg-black/10 text-black/40 cursor-not-allowed'
                        }`}
                      >
                        {isInstalled ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Equipped</span>
                          </>
                        ) : (
                          <span>Equip Modification • {item.cost} 🪙</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: PAINT SCHEMES */}
          {activeTab === 'paint' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PAINT_SCHEMES.map((paint) => {
                const isSelected = gameState.selectedPaint === paint.id;
                const isUnlocked = !!gameState.unlockedPaints[paint.id] || paint.cost === 0;
                const canAfford = gameState.gold >= paint.cost;

                return (
                  <div
                    key={paint.id}
                    className={`rounded-2xl p-4.5 border-2 flex flex-col justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-[#f4f7ee] border-[#1e4738] shadow-md ring-2 ring-[#1e4738]/20'
                        : 'bg-white border-[#382216]/10 hover:border-[#d4a340]'
                    }`}
                  >
                    <div>
                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div
                          className="w-6 h-6 rounded-lg border border-black/20 shadow-sm"
                          style={{ backgroundColor: `#${paint.primaryColor.toString(16).padStart(6, '0')}` }}
                          title="Primary Body"
                        />
                        <div
                          className="w-6 h-6 rounded-lg border border-black/20 shadow-sm"
                          style={{ backgroundColor: `#${paint.secondaryColor.toString(16).padStart(6, '0')}` }}
                          title="Chassis Wood"
                        />
                        <div
                          className="w-6 h-6 rounded-lg border border-black/20 shadow-sm"
                          style={{ backgroundColor: `#${paint.roofColor.toString(16).padStart(6, '0')}` }}
                          title="Roof Cap"
                        />
                        <div
                          className="w-6 h-6 rounded-lg border border-black/20 shadow-sm"
                          style={{ backgroundColor: `#${paint.trimColor.toString(16).padStart(6, '0')}` }}
                          title="Brass Trim"
                        />
                      </div>

                      <h3 className="font-comfortaa font-bold text-base text-[#382216] leading-snug">
                        {paint.name}
                      </h3>

                      <p className="text-xs text-[#614e41] mt-1.5 leading-relaxed font-medium">
                        {paint.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#382216]/10">
                      <button
                        onClick={() => handleApplyPaint(paint.id, paint.cost)}
                        disabled={isSelected || (!isUnlocked && !canAfford)}
                        className={`w-full py-2.5 rounded-xl font-comfortaa font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e4738] text-white cursor-default'
                            : isUnlocked
                            ? 'bg-[#d4a340] text-[#382216] hover:bg-[#e0b04c] active:scale-98 shadow-md'
                            : canAfford
                            ? 'bg-[#1e4738] text-white hover:bg-[#285f4b] active:scale-98'
                            : 'bg-black/10 text-black/40 cursor-not-allowed'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active Livery</span>
                          </>
                        ) : isUnlocked ? (
                          <span>Apply Lacquer (Owned)</span>
                        ) : (
                          <span>Unlock Paint • {paint.cost} 🪙</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: OLIVER'S JOURNAL & LORE */}
          {activeTab === 'journal' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-5 border border-[#382216]/10 shadow-sm flex items-start gap-4">
                <span className="text-4xl">🦉</span>
                <div>
                  <h3 className="font-comfortaa font-bold text-lg text-[#1e4738]">
                    Master Engineer Oliver's Notes
                  </h3>
                  <p className="text-xs text-[#7a6452] font-semibold mt-0.5">
                    Entry 142 — The Art of Cloud Tramways
                  </p>
                  <p className="text-xs text-[#4d3a2b] mt-2.5 leading-relaxed font-medium">
                    "Driving an aerial tram across Aethelgard isn't merely about throttle and steel. It is about harmony with the sky currents. When ascending the High Pines bridge, ease off the power and let the cool mountain thermals carry the cabin. Keep your passengers serene, and the journey itself becomes the reward."
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#382216]/10 shadow-sm flex items-start gap-4">
                <span className="text-4xl">🐋</span>
                <div>
                  <h3 className="font-comfortaa font-bold text-lg text-[#1e4738]">
                    Sighting of the Great Cloud Leviathan
                  </h3>
                  <p className="text-xs text-[#7a6452] font-semibold mt-0.5">
                    Field Note from the Whispering Spire
                  </p>
                  <p className="text-xs text-[#4d3a2b] mt-2.5 leading-relaxed font-medium">
                    "Every solstice, the celestial Cloud Whale breaches through the lower cumulus stratum near Saltlight Terminus. Ring the tram's brass bell when passing the lighthouse, and the great beast hums in deep resonance. A sign of bountiful voyages ahead!"
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#382216]/10 shadow-sm flex items-start gap-4">
                <span className="text-4xl">🤖</span>
                <div>
                  <h3 className="font-comfortaa font-bold text-lg text-[#1e4738]">
                    Cogsworth's Maintenance Wisdom
                  </h3>
                  <p className="text-xs text-[#7a6452] font-semibold mt-0.5">
                    Automaton Assistant Protocol #7
                  </p>
                  <p className="text-xs text-[#4d3a2b] mt-2.5 leading-relaxed font-medium">
                    "Whir-clack! Remember to tap the brake progressively before the steep coastal descent into Mango Tide Pier. Sudden hard stops spill the conductor's tea and distress the local mail pigeons."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONDUCTOR STATS & DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-4 border border-[#382216]/10 shadow-sm text-center">
                  <div className="text-2xl font-comfortaa font-bold text-[#1e4738]">
                    {Math.round(gameState.totalDistanceTraveled)} km
                  </div>
                  <div className="text-xs font-semibold text-[#7a6452] mt-1">
                    Total Sky Rail Distance
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#382216]/10 shadow-sm text-center">
                  <div className="text-2xl font-comfortaa font-bold text-[#c2593f]">
                    {gameState.totalTripsCompleted}
                  </div>
                  <div className="text-xs font-semibold text-[#7a6452] mt-1">
                    Station Runs Completed
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#382216]/10 shadow-sm text-center">
                  <div className="text-2xl font-comfortaa font-bold text-[#d4a340]">
                    {gameState.parcelsCollected} / 5
                  </div>
                  <div className="text-xs font-semibold text-[#7a6452] mt-1">
                    Sky Parcels Recovered
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-[#382216]/10 shadow-sm text-center">
                  <div className="text-2xl font-comfortaa font-bold text-[#3d7b88]">
                    {Object.keys(gameState.installedUpgrades).filter(k => gameState.installedUpgrades[k]).length} / {UPGRADE_ITEMS.length}
                  </div>
                  <div className="text-xs font-semibold text-[#7a6452] mt-1">
                    Modifications Fitted
                  </div>
                </div>
              </div>

              {/* Maintenance Health Bar */}
              <div className="bg-white rounded-2xl p-5 border border-[#382216]/10 shadow-sm space-y-3">
                <h4 className="font-comfortaa font-bold text-sm text-[#382216]">
                  Tram System Diagnostics
                </h4>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Bogie Wheel Bearings</span>
                    <span className="text-[#1e4738]">100% (Oiled Bronze)</span>
                  </div>
                  <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1e4738] w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Catenary Power Collector</span>
                    <span className="text-[#1e4738]">98% (Clean Contact)</span>
                  </div>
                  <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3d8b68] w-[98%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Pneumatic Brake Calipers</span>
                    <span className="text-[#1e4738]">100% (Calibrated)</span>
                  </div>
                  <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#48bca2] w-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer / Status & Depart Button ── */}
        <div className="bg-[#f0e7d5] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#382216]/10 shrink-0">
          <div className="text-xs font-bold text-[#1e4738] flex items-center gap-2">
            {statusMessage ? (
              <span className="animate-pulse">{statusMessage}</span>
            ) : (
              <span>Companion Cogsworth: "All tracks cleared for departure, Conductor!"</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gradient-to-br from-[#d4a340] to-[#ffaa42] text-[#382216] border-2 border-white rounded-2xl px-6 py-2.5 font-comfortaa font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>All Aboard → Depart to Coastal Line</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
