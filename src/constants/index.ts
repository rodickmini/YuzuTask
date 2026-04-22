// ==================== Pet Configuration ====================
export const PET_CONFIG = {
  /** Maximum satiety value */
  MAX_SATIETY: 100,
  /** Satiety increase per feeding */
  FEED_SATIETY_INCREMENT: 20,
  /** Food reward for completing a pomodoro focus session */
  POMODORO_FOOD_REWARD: 2,
  /** Initial food count for new users */
  INITIAL_FOOD_COUNT: 3,
  /** Initial satiety for new users */
  INITIAL_SATIETY: 80,
  /** Satiety decay per hour */
  DECAY_PER_HOUR: 5,
} as const;

// ==================== Trash Configuration ====================
export const TRASH_CONFIG = {
  /** Days before auto-purging deleted items */
  AUTO_PURGE_DAYS: 30,
} as const;

// ==================== Tag Colors ====================
export interface TagColorConfig {
  /** Background + text classes for Tag component (pill style) */
  badge: string;
  /** Text-only color class for sidebar display */
  sidebar: string;
}

export const TAG_COLORS: Record<string, TagColorConfig> = {
  'tag.work': { badge: 'bg-primary-light/40 text-primary-dark', sidebar: 'text-[#5A9BAC]' },
  'tag.dev': { badge: 'bg-mint-light/40 text-emerald-700', sidebar: 'text-[#6DB885]' },
  'tag.meeting': { badge: 'bg-cream-light/40 text-amber-700', sidebar: 'text-[#E0A060]' },
  'tag.doc': { badge: 'bg-accent-light/40 text-rose-600', sidebar: 'text-[#D08080]' },
  'tag.comm': { badge: 'bg-purple-100 text-purple-600', sidebar: 'text-purple-500' },
  'tag.learn': { badge: 'bg-blue-100 text-blue-600', sidebar: 'text-blue-500' },
  'tag.life': { badge: 'bg-pink-100 text-pink-600', sidebar: 'text-pink-500' },
};

/** Get the badge (pill) color classes for a tag */
export function getTagBadgeColor(tag: string): string {
  return TAG_COLORS[tag]?.badge ?? 'bg-warm-dark text-text-sub';
}

/** Get the sidebar text color class for a tag */
export function getTagSidebarColor(tag: string): string {
  return TAG_COLORS[tag]?.sidebar ?? 'text-gray-400';
}
