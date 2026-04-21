import type { Variants } from 'framer-motion';

// Unified timing constants
export const DURATION = {
  fast: 0.15,
  standard: 0.2,
  slow: 0.3,
} as const;

/** List item: subtle fade-up enter, clean fade-out exit */
export const listItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

/** Page transition: very subtle fade for tab switching */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

/** Card entrance animation (kept for modal/special moments) */
export const cardIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.standard, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

/** Card entrance from bottom (for forms) */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 250 } },
};

/** Expand/collapse animation */
export const expandCollapse: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: DURATION.slow } },
  exit: { opacity: 0, height: 0, transition: { duration: DURATION.standard } },
};

/** Fade in only */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

/** Stagger container for page load */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

/** Stagger child item */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: 'easeOut' } },
};
