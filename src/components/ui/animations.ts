import type { Variants } from 'framer-motion';

/** Card entrance animation (fade up) */
export const cardIn: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

/** Card entrance from bottom (for new items) */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/** Slide out to the left (for deleted items) */
export const slideOutLeft: Variants = {
  exit: { opacity: 0, x: -80, transition: { duration: 0.3 } },
};

/** Expand/collapse animation */
export const expandCollapse: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
};

/** Fade in only */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};
