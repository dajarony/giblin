import { STATIONS } from './game/constants';
import { BottomDashboard } from './components/HUD/BottomDashboard';
import { SubtitleToast } from './components/HUD/SubtitleToast';
import { TopBar } from './components/HUD/TopBar';
import { AchievementsModal } from './components/Modals/AchievementsModal';
import { HelpControlsModal } from './components/Modals/HelpControlsModal';
import { PassengerLogModal } from './components/Modals/PassengerLogModal';
import { PhotoModeModal } from './components/Modals/PhotoModeModal';
import { StationArrivalModal } from './components/Modals/StationArrivalModal';
import { TimeWeatherModal } from './components/Modals/TimeWeatherModal';
import { WorkshopModal } from './components/Modals/WorkshopModal';
import { useGameController } from './app/hooks/useGameController';

export default function App() {
  const game = useGameController();
  const { gameState, actions, input, modals, toast, achievements } = game;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#1a162b] font-['Quicksand',sans-serif]">
      <div
        ref={game.containerRef}
        className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none">
        <TopBar
          gameState={gameState}
          onToggleCamera={actions.toggleCamera}
          onToggleAudio={actions.toggleAudio}
          onToggleMusic={actions.toggleMusic}
          onOpenWorkshop={actions.openWorkshop}
          onOpenWeather={() => game.openModal('weather')}
          onOpenPassengerLog={() => game.openModal('passengerLog')}
          onOpenPhotoMode={actions.openPhotoMode}
          onOpenAchievements={() => game.openModal('achievements')}
          onOpenHelp={() => game.openModal('help')}
        />
      </div>

      <SubtitleToast message={toast.message} speaker={toast.speaker} avatar={toast.avatar} />

      <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
        <BottomDashboard
          gameState={gameState}
          onPowerStart={() => input.setPower(true)}
          onPowerEnd={() => input.setPower(false)}
          onBrakeStart={() => input.setBrake(true)}
          onBrakeEnd={() => input.setBrake(false)}
          onRingBell={actions.ringBell}
          onBlowWhistle={game.ringWhistle}
          isPowerActive={input.isPowerActive}
          isBrakeActive={input.isBrakeActive}
        />
      </div>

      <WorkshopModal
        isOpen={modals.workshop}
        onClose={actions.closeWorkshop}
        gameState={gameState}
        onBuyUpgrade={actions.buyUpgrade}
        onSelectPaint={actions.selectPaint}
      />

      <PassengerLogModal
        isOpen={modals.passengerLog}
        onClose={() => game.closeModal('passengerLog')}
        gameState={gameState}
        onSelectRequest={actions.selectPassengerStory}
      />

      <StationArrivalModal
        isOpen={modals.station}
        onDepart={actions.departStation}
        onOpenWorkshop={actions.openWorkshop}
        station={STATIONS[gameState.currentStationIndex]}
        gameState={gameState}
        earnedTips={game.earnedTipsForArrival}
      />

      <TimeWeatherModal
        isOpen={modals.weather}
        onClose={() => game.closeModal('weather')}
        currentWeather={gameState.weather}
        onSelectWeather={actions.selectWeather}
      />

      <PhotoModeModal
        isOpen={modals.photo}
        onClose={() => game.closeModal('photo')}
        screenshotUrl={game.screenshotData}
        gameState={gameState}
        onPostcardSaved={game.savePostcard}
      />

      <AchievementsModal
        isOpen={modals.achievements}
        onClose={() => game.closeModal('achievements')}
        achievements={achievements}
      />

      <HelpControlsModal
        isOpen={modals.help}
        onClose={() => game.closeModal('help')}
      />
    </div>
  );
}
