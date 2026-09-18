import { useCallback, useState } from 'react';
import { ACHIEVEMENTS_LIST } from '../../game/constants';
import { soundEngine } from '../../audio/SoundEngine';
import type { Achievement } from '../../types/game';

export type ShowToast = (message: string, speaker?: string, avatar?: string, duration?: number) => void;

export function useAchievements(showToast: ShowToast) {
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    ACHIEVEMENTS_LIST.map((achievement) => ({ ...achievement })),
  );

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements((current) => {
      const target = current.find((achievement) => achievement.id === achievementId);
      if (!target || target.unlocked) return current;

      showToast(
        `Achievement Unlocked: "${target.title}"! ✨`,
        'Journal Milestone',
        target.icon,
        4000,
      );
      soundEngine.playCoinSound(true);

      return current.map((achievement) =>
        achievement.id === achievementId ? { ...achievement, unlocked: true } : achievement,
      );
    });
  }, [showToast]);

  return { achievements, unlockAchievement };
}
