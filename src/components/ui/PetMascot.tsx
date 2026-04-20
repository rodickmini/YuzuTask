import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import catPlayingData from '../../assets/animations/catPlaying.json';
import loaderCatData from '../../assets/animations/LoaderCat.json';
import cuteCatWorksData from '../../assets/animations/CuteCatWorks.json';
import happyDogData from '../../assets/animations/HappyDog.json';
import { useAppState } from '../../store';
import * as petStorage from '../../utils/petStorage';

const pets = [
  { data: catPlayingData, name: '猫咪酱', bubble: '正在梦中捉小鱼~', isDog: false },
  { data: loaderCatData, name: '打工猫', bubble: '努力搬砖中喵~', isDog: false },
  { data: cuteCatWorksData, name: '专注猫', bubble: '认真工作中勿扰！', isDog: false },
  { data: happyDogData, name: '快乐狗', bubble: '今天也要开心汪~', isDog: true },
];

const hoverLines = ['摸摸我~', '嘿嘿~', '要抱抱！', '别走嘛~', '(*≧▽≦)'];
const clickLines = ['喵~', '汪汪！', '再摸就生气了哦', '好舒服~', '还要还要！', '❤️'];
const hungryLines = ['肚子咕咕叫...', '好饿...', '有吃的吗...', '想吃小鱼干...'];
const happyLines = ['今天好开心~', '吃饱饱！', '幸福满满~', '谢谢投喂！'];

const particles = ['❤️', '⭐', '✨', '💛', '🌟'];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSatietyColor(satiety: number): string {
  if (satiety > 60) return 'bg-mint';
  if (satiety > 30) return 'bg-cream';
  return 'bg-accent';
}

function getBubbleText(satiety: number, defaultBubble: string): string {
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

  const [index, setIndex] = useState(() => Math.floor(Math.random() * pets.length));
  const [isHovered, setIsHovered] = useState(false);
  const [bubbleOverride, setBubbleOverride] = useState<string | null>(null);
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([]);
  const [isFeeding, setIsFeeding] = useState(false);

  const pet = pets[index];
  const foodEmoji = pet.isDog ? '🦴' : '🐟';

  const shuffle = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * pets.length);
    } while (next === index && pets.length > 1);
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
  }, [petState, dispatch]);

  const displayBubble = bubbleOverride ?? getBubbleText(petState.satiety, pet.bubble);

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
        换一只
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
          <span className="text-[10px] text-text-sub">饱腹度</span>
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
          投喂
        </motion.button>
      </div>
    </div>
  );
}
