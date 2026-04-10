import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../../store';
import { useTranslation, changeLanguage } from '../../i18n';
import Button from '../ui/Button';
import Input from '../ui/Input';
import * as storage from '../../utils/storage';
import { showToast } from '../ui/Toast';

const LANGUAGES = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
] as const;

export default function SettingsPage() {
  const { state, dispatch } = useAppState();
  const { t, i18n } = useTranslation();
  const [focusMinutes, setFocusMinutes] = useState(state.settings.pomodoroFocusMinutes.toString());
  const [breakMinutes, setBreakMinutes] = useState(state.settings.pomodoroBreakMinutes.toString());
  const [longBreakMinutes, setLongBreakMinutes] = useState(state.settings.longBreakMinutes.toString());
  const [longBreakInterval, setLongBreakInterval] = useState(state.settings.longBreakInterval.toString());
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState(state.settings.customTags);

  const saveSettings = useCallback(async (partial: Record<string, unknown>) => {
    const settings = {
      ...state.settings,
      pomodoroFocusMinutes: parseInt(focusMinutes) || 25,
      pomodoroBreakMinutes: parseInt(breakMinutes) || 5,
      longBreakMinutes: parseInt(longBreakMinutes) || 15,
      longBreakInterval: parseInt(longBreakInterval) || 4,
      customTags: tags,
      ...partial,
    };
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    await storage.saveSettings(settings);
    showToast(t('settings.saved'));
  }, [state.settings, focusMinutes, breakMinutes, longBreakMinutes, longBreakInterval, tags, dispatch, t]);

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
  };

  const updatePomodoro = (field: string, value: string, min: number, max: number) => {
    const num = Math.min(max, Math.max(min, parseInt(value) || min));
    // Update local display to show clamped value
    if (field === 'pomodoroFocusMinutes') setFocusMinutes(num.toString());
    if (field === 'pomodoroBreakMinutes') setBreakMinutes(num.toString());
    if (field === 'longBreakMinutes') setLongBreakMinutes(num.toString());
    if (field === 'longBreakInterval') setLongBreakInterval(num.toString());
    saveSettings({ [field]: num });
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const next = [...tags, trimmed];
      setTags(next);
      setNewTag('');
      saveSettings({ customTags: next });
    }
  };

  const removeTag = (tag: string) => {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    saveSettings({ customTags: next });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
        <span className="text-base">⚙️</span> {t('settings.title')}
      </h3>

      {/* Language selector */}
      <div className="bg-white rounded-2xl p-4 border border-warm-dark/50 space-y-3">
        <h4 className="text-sm font-medium text-text-main">{t('settings.languageSection')}</h4>
        <div className="flex gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                i18n.language === lang.value
                  ? 'bg-primary text-white'
                  : 'bg-warm text-text-main hover:bg-warm-dark'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pomodoro settings */}
      <div className="bg-white rounded-2xl p-4 border border-warm-dark/50 space-y-4">
        <h4 className="text-sm font-medium text-text-main">{t('settings.pomodoroSection')}</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('settings.focusDuration')}
            type="number"
            value={focusMinutes}
            onChange={e => setFocusMinutes(e.target.value)}
            onBlur={() => updatePomodoro('pomodoroFocusMinutes', focusMinutes, 1, 120)}
          />
          <Input
            label={t('settings.breakDuration')}
            type="number"
            value={breakMinutes}
            onChange={e => setBreakMinutes(e.target.value)}
            onBlur={() => updatePomodoro('pomodoroBreakMinutes', breakMinutes, 1, 60)}
          />
          <Input
            label={t('settings.longBreakDuration')}
            type="number"
            value={longBreakMinutes}
            onChange={e => setLongBreakMinutes(e.target.value)}
            onBlur={() => updatePomodoro('longBreakMinutes', longBreakMinutes, 1, 60)}
          />
          <Input
            label={t('settings.longBreakInterval')}
            type="number"
            value={longBreakInterval}
            onChange={e => setLongBreakInterval(e.target.value)}
            onBlur={() => updatePomodoro('longBreakInterval', longBreakInterval, 1, 10)}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl p-4 border border-warm-dark/50 space-y-3">
        <h4 className="text-sm font-medium text-text-main">{t('settings.tagsSection')}</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-warm-dark rounded-full text-xs text-text-main"
            >
              #{tag.startsWith('tag.') ? t(tag, tag) : tag}
              <button onClick={() => removeTag(tag)} className="hover:text-accent">✕</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('settings.addTagPlaceholder')}
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            className="flex-1 px-3 py-2 bg-warm border border-warm-dark rounded-xl text-sm outline-none focus:border-primary"
          />
          <Button size="sm" onClick={addTag}>{t('settings.addTag')}</Button>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white rounded-2xl p-4 border border-warm-dark/50 space-y-3">
        <h4 className="text-sm font-medium text-text-main">{t('settings.dataSection')}</h4>
        <p className="text-xs text-text-sub">{t('settings.dataNotice')}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (confirm(t('settings.clearDataConfirm'))) {
              await storage.clearAll();
              location.reload();
            }
          }}
        >
          {t('settings.clearData')}
        </Button>
      </div>
    </motion.div>
  );
}