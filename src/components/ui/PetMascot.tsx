import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import catPlayingData from '../../assets/animations/catPlaying.json';
import loaderCatData from '../../assets/animations/LoaderCat.json';
import cuteCatWorksData from '../../assets/animations/CuteCatWorks.json';
import happyDogData from '../../assets/animations/HappyDog.json';

const pets = [
  { data: catPlayingData, name: '猫咪酱', bubble: '正在梦中捉小鱼~' },
  { data: loaderCatData, name: '打工猫', bubble: '努力搬砖中喵~' },
  { data: cuteCatWorksData, name: '专注猫', bubble: '认真工作中勿扰！' },
  { data: happyDogData, name: '快乐狗', bubble: '今天也要开心汪~' },
];

export default function PetMascot() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * pets.length));

  const shuffle = useCallback(() => {
    let next: number;
    do {
      next = Math.floor(Math.random() * pets.length);
    } while (next === index && pets.length > 1);
    setIndex(next);
  }, [index]);

  const pet = pets[index];

  return (
    <div className="bg-white rounded-3xl border border-warm-dark/50 p-4 relative">
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
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-full h-[140px] sm:h-[180px] flex items-center justify-center">
            <Lottie
              animationData={pet.data}
              loop
              className="w-full h-full"
            />
          </div>
          <div className="bg-warm-dark/40 rounded-xl px-3 py-1.5 text-xs text-text-sub">
            {pet.bubble}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
