import type { Variants } from 'framer-motion';

/** Card entrance animation (fade up) */
export const cardIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -80, transition: { duration: 0.3 } },
};

/** Card entrance from bottom (for new items, more pronounced) */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 200 } },
};

/** Slide out to the left (for deleted items) */
export const slideOutLeft: Variants = {
  exit: { opacity: 0, x: -100, transition: { duration: 0.3, ease: 'easeIn' } },
};

/** Expand/collapse animation */
export const expandCollapse: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

/** Fade in only */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

/** Stagger container for page load - children fade in sequentially */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.15 },
  },
};

/** Stagger child item - fades up */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
