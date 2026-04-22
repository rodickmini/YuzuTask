import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../../store';
import { useTranslation, changeLanguage } from '../../i18n';
import Button from '../ui/Button';
import Input from '../ui/Input';
import * as storage from '../../utils/storage';
import { showToast } from '../ui/Toast';
import { useConfirm } from '../../hooks/useConfirm';
import * as dataService from '../../services/dataService';

const LANGUAGES = [
  { value: 'zh', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
] as const;

export default function SettingsPage() {
  const { state, dispatch } = useAppState();
  const { t, i18n } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [focusMinutes, setFocusMinutes] = useState(state.settings.pomodoroFocusMinutes.toString());
  const [breakMinutes, setBreakMinutes] = useState(state.settings.pomodoroBreakMinutes.toString());
  const [longBreakMinutes, setLongBreakMinutes] = useState(state.settings.longBreakMinutes.toString());
  const [longBreakInterval, setLongBreakInterval] = useState(state.settings.longBreakInterval.toString());

  const saveSettings = useCallback(async (partial: Record<string, unknown>) => {
    const settings = {
      ...state.settings,
      pomodoroFocusMinutes: parseInt(focusMinutes) || 25,
      pomodoroBreakMinutes: parseInt(breakMinutes) || 5,
      longBreakMinutes: parseInt(longBreakMinutes) || 15,
      longBreakInterval: parseInt(longBreakInterval) || 4,
      ...partial,
    };
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    await storage.saveSettings(settings);
    showToast(t('settings.saved'));
  }, [state.settings, focusMinutes, breakMinutes, longBreakMinutes, longBreakInterval, dispatch, t]);

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
  };

  const updatePomodoro = (field: string, value: string, min: number, max: number) => {
    const num = Math.min(max, Math.max(min, parseInt(value) || min));
    if (field === 'pomodoroFocusMinutes') setFocusMinutes(num.toString());
    if (field === 'pomodoroBreakMinutes') setBreakMinutes(num.toString());
    if (field === 'longBreakMinutes') setLongBreakMinutes(num.toString());
    if (field === 'longBreakInterval') setLongBreakInterval(num.toString());
    saveSettings({ [field]: num });
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

      {/* Task position */}
      <div className="bg-white rounded-2xl p-4 border border-warm-dark/50 space-y-3">
        <h4 className="text-sm font-medium text-text-main">{t('settings.taskPositionSection')}</h4>
        <div className="flex gap-2">
          {(['top', 'bottom'] as const).map(pos => (
            <button
              key={pos}
              onClick={() => saveSettings({ newTaskPosition: pos })}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                state.settings.newTaskPosition === pos
                  ? 'bg-primary text-white'
                  : 'bg-warm text-text-main hover:bg-warm-dark'
              }`}
            >
              {t(`settings.newTask${pos === 'top' ? 'Top' : 'Bottom'}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white rounded-2xl p-4 border border-warm-dark/50 space-y-3">
        <h4 className="text-sm font-medium text-text-main">{t('settings.dataSection')}</h4>
        <p className="text-xs text-text-sub">{t('settings.dataNotice')}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                const json = await dataService.exportData();
                dataService.triggerDownload(json);
                showToast(t('settings.exportSuccess'));
              } catch {
                showToast(t('settings.exportError'));
              }
            }}
          >
            {t('settings.exportData')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            {t('settings.importData')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                await dataService.importData(text);
                showToast(t('settings.importSuccess'));
                setTimeout(() => location.reload(), 500);
              } catch {
                showToast(t('settings.importError'));
              }
              e.target.value = '';
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const confirmed = await confirm({
                title: t('settings.clearData'),
                message: t('settings.clearDataConfirm'),
                variant: 'danger',
              });
              if (confirmed) {
                await storage.clearAll();
                location.reload();
              }
            }}
          >
            {t('settings.clearData')}
          </Button>
        </div>
      </div>
      <ConfirmDialog />
    </motion.div>
  );
}