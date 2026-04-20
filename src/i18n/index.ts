import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import zh from './locales/zh.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

const LANG_STORAGE_KEY = 'yuzutask_language';
const SUPPORTED_LANGS = ['zh', 'en', 'ja'] as const;

function detectLanguage(): string {
  const lang = navigator.language;
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('ja')) return 'ja';
  return 'en';
}

async function loadSavedLanguage(): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const result = await chrome.storage.local.get(LANG_STORAGE_KEY);
      const saved = result[LANG_STORAGE_KEY];
      if (typeof saved === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(saved)) {
        return saved;
      }
    } catch {
      // ignore — fall back to detection
    }
  }
  return detectLanguage();
}

export async function changeLanguage(lang: string): Promise<void> {
  if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) return;
  await i18n.changeLanguage(lang);
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.set({ [LANG_STORAGE_KEY]: lang });
    } catch {
      // ignore
    }
  }
}

// Initialize with detected language (may be overridden by saved preference)
loadSavedLanguage().then((lang) => {
  if (lang !== i18n.language) {
    i18n.changeLanguage(lang);
  }
});

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export { detectLanguage, useTranslation };
export default i18n;
