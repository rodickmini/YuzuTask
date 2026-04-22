import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import catPlayingData from '../../assets/animations/catPlaying.json';
import loaderCatData from '../../assets/animations/LoaderCat.json';
import cuteCatWorksData from '../../assets/animations/CuteCatWorks.json';
import happyDogData from '../../assets/animations/HappyDog.json';
import { useAppState } from '../../store';
import * as petStorage from '../../utils/petStorage';
import { useTranslation } from '../../i18n';

const petAnimations = [
  { data: catPlayingData, isDog: false },
  { data: loaderCatData, isDog: false },
  { data: cuteCatWorksData, isDog: false },
  { data: happyDogData, isDog: true },
];

const particles = ['❤️', '⭐', '✨', '💛', '🌟'];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSatietyColor(satiety: number): string {
  if (satiety > 60) return 'bg-mint';
  if (satiety > 30) return 'bg-cream';
  return 'bg-accent';
}

function getBubbleText(satiety: number, defaultBubble: string, hungryLines: string[], happyLines: string[]): string {
  if (satiety < 30) return randomPick(hungryLines);
  if (satiety > 80) return randomPick(happyLines);
  return defaultBubble;
}

interface FloatingParticle {
  id: number;
  emoji: string;
  x: number;
}

export default function PetMascot() {
  const { state, dispatch } = useAppState();
  const { petState } = state;
  const { t } = useTranslation();

  const petBubbles = t('pet.bubbles', { returnObjects: true }) as string[];
  const hoverLines = t('pet.hover', { returnObjects: true }) as string[];
  const clickLines = t('pet.click', { returnObjects: true }) as string[];
  const hungryLines = t('pet.hungry', { returnObjects: true }) as string[];
  const happyLines = t('pet.happy', { returnObjects: true }) as string[];

  const [index, setIndex] = useState(() => Math.floor(Math.random() * petAnimations.length));
  const [isHovered, setIsHovered] = useState(false);
  const [bubbleOverride, setBubbleOverride] = useState<string | null>(null);
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const [isFeeding, setIsFeeding] = useState(false);

  const pet = petAnimations[index];
  const foodEmoji = pet.isDog ? '🦴' : '🐟';

  const shuffle = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * petAnimations.length);
    } while (next === index && petAnimations.length > 1);
    setIndex(next);
    setBubbleOverride(null);
  }, [index]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setBubbleOverride(randomPick(hoverLines));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setBubbleOverride(null);
  }, []);

  const handleClick = useCallback(() => {
    setBubbleOverride(randomPick(clickLines));
    // Spawn particles
    const newParticles: FloatingParticle[] = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      emoji: randomPick(particles),
      x: (Math.random() - 0.5) * 80,
    }));
    setFloatingParticles(prev => [...prev, ...newParticles]);
    // Remove after animation
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);
  }, []);

  const handleFeed = useCallback(async () => {
    if (petState.foodCount <= 0) return;
    setIsFeeding(true);
    dispatch({ type: 'FEED_PET' });
    const updated = await petStorage.feedPet(petState);
    if (updated) {
      dispatch({ type: 'SET_PET_STATE', payload: updated });
    }
    setBubbleOverride(randomPick(happyLines));
    setTimeout(() => {
      setIsFeeding(false);
      setBubbleOverride(null);
    }, 1500);
  }, [petState, dispatch, happyLines]);

  const displayBubble = bubbleOverride ?? getBubbleText(petState.satiety, petBubbles[index] ?? '', hungryLines, happyLines);

  return (
    <div className="bg-white rounded-3xl border border-warm-dark/50 p-3 relative">
      {/* Shuffle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={shuffle}
        className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 text-[11px] text-primary-dark bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors z-10"
      >
        <span>🔀</span>
        {t('pet.changePet')}
      </motion.button>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{
            opacity: 1,
            scale: isFeeding ? 1.1 : isHovered ? 1.05 : 1,
            y: 0,
          }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          {/* Pet animation area */}
          <motion.div
            className="w-full h-[120px] flex items-center justify-center cursor-pointer relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            animate={isFeeding ? { scale: [1, 1.15, 1] } : {}}
            transition={isFeeding ? { duration: 0.4, repeat: 2 } : {}}
          >
            <Lottie
              animationData={pet.data}
              loop
              className="w-full h-full"
            />

            {/* Floating particles */}
            <AnimatePresence>
              {floatingParticles.map(p => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, y: 0, x: p.x, scale: 1 }}
                  animate={{ opacity: 0, y: -60, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute bottom-1/3 text-lg pointer-events-none"
                  style={{ left: '50%', transform: `translateX(${p.x}px)` }}
                >
                  {p.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Speech bubble */}
          <div className="bg-warm-dark/40 rounded-xl px-3 py-1.5 text-xs text-text-sub min-h-[24px]">
            {displayBubble}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Satiety bar */}
      <div className="mt-2 px-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] text-text-sub">{t('pet.satiety')}</span>
          <span className="text-[10px] font-medium text-text-main">{petState.satiety}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${getSatietyColor(petState.satiety)}`}
            initial={false}
            animate={{ width: `${petState.satiety}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Food count & Feed button */}
      <div className="mt-2 flex items-center justify-between px-1">
        <span className="text-xs text-text-sub flex items-center gap-1">
          {foodEmoji} <span className="font-medium text-text-main">{petState.foodCount}</span>
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFeed}
          disabled={petState.foodCount <= 0}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg transition-colors ${
            petState.foodCount > 0
              ? 'text-primary-dark bg-primary/10 hover:bg-primary/20'
              : 'text-text-sub/50 bg-warm-dark/10 cursor-not-allowed'
          }`}
        >
          <span>🍽️</span>
          {t('pet.feed')}
        </motion.button>
      </div>
    </div>
  );
}
