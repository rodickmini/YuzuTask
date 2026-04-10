import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import zh from './locales/zh.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

function detectLanguage(): string {
  const lang = navigator.language;
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('ja')) return 'ja';
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: detectLanguage(),
  fallbackLng: 'zh',
  interpolation: {
    escapeValue: false,
  },
});

export { detectLanguage, useTranslation };
export default i18n;
