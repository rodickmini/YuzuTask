import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Copy, FileText, Settings, Check } from 'lucide-react';
import { useAppState } from '../../store';
import { generateWeeklyReport } from '../../utils/report';
import { format } from 'date-fns';
import { getDateFnsLocale, getStartOfCurrentWeek } from '../../utils/date';
import { useTranslation } from '../../i18n';
import { showToast } from '../ui/Toast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import * as storage from '../../utils/storage';
import type { UserSettings } from '../../types';

export default function WeeklyReport() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();
  const [report, setReport] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings form state
  const [reportDay, setReportDay] = useState(state.settings.weeklyReport.dayOfWeek);
  const [reportTime, setReportTime] = useState(state.settings.weeklyReport.time);
  const [template, setTemplate] = useState(state.settings.weeklyReport.template);

  const weekMonday = useMemo(() => getStartOfCurrentWeek(), []);

  const weekLabel = useMemo(() => {
    const sunday = new Date(weekMonday);
    sunday.setDate(weekMonday.getDate() + 6);
    return `${format(weekMonday, 'MMM d', { locale: getDateFnsLocale() })} - ${format(sunday, 'MMM d', { locale: getDateFnsLocale() })}`;
  }, []);

  const handleGenerate = () => {
    const reportText = generateWeeklyReport(
      state.workLogs,
      state.tasks,
      state.settings.weeklyReport,
    );
    setReport(reportText);
    setIsGenerated(true);
    showToast(t('weekly.generated'));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      showToast(t('weekly.copiedToClipboard'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(t('weekly.copyFailed'), 'error');
    }
  };

  const handleSaveSettings = async () => {
    const newSettings: UserSettings = {
      ...state.settings,
      weeklyReport: {
        ...state.settings.weeklyReport,
        dayOfWeek: reportDay,
        time: reportTime,
        template,
      },
    };
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
    await storage.saveSettings(newSettings);
    setShowSettings(false);
    showToast(t('weekly.settingsSaved'));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
          <span className="text-base">📊</span> {t('weekly.title')}
        </h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl text-text-sub hover:bg-warm-dark transition-colors"
          >
            <Settings size={16} />
          </motion.button>
        </div>
      </div>

      {/* Week info */}
      <div className="bg-white rounded-2xl p-4 border border-warm-dark/50 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-main font-medium">
            {t('weekly.currentWeek')}{weekLabel}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-light text-primary">
              {state.workLogs.filter(l => new Date(l.date) >= weekMonday).length}
            </div>
            <div className="text-xs text-text-sub">{t('weekly.workLogs')}</div>
          </div>
          <div>
            <div className="text-2xl font-light text-mint">
              {state.tasks.filter(t => t.status === 'done' && new Date(t.completedAt || t.createdAt) >= weekMonday).length}
            </div>
            <div className="text-xs text-text-sub">{t('weekly.completedTasks')}</div>
          </div>
          <div>
            <div className="text-2xl font-light text-cream">
              {(() => {
                const total = state.workLogs
                  .filter(l => new Date(l.date) >= weekMonday)
                  .reduce((s, l) => s + l.durationMinutes, 0);
                return total >= 60 ? `${Math.round(total / 60 * 10) / 10}h` : `${total}m`;
              })()}
            </div>
            <div className="text-xs text-text-sub">{t('weekly.totalHours')}</div>
          </div>
        </div>
      </div>

      {/* Generate button */}
      {!isGenerated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <FileText size={48} className="text-primary/30 mb-4" />
          <p className="text-text-sub text-sm mb-4">{t('weekly.description')}</p>
          <Button onClick={handleGenerate} size="lg">
            {t('weekly.generate')}
          </Button>
        </motion.div>
      )}

      {/* Report output */}
      {isGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-sub">{t('weekly.editableTip')}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleGenerate}>
                {t('weekly.regenerate')}
              </Button>
              <Button size="sm" onClick={handleCopy} icon={copied ? <Check size={14} /> : <Copy size={14} />}>
                {copied ? t('weekly.copied') : t('weekly.copy')}
              </Button>
            </div>
          </div>
          <textarea
            value={report}
            onChange={e => setReport(e.target.value)}
            className="flex-1 w-full p-4 bg-white border border-warm-dark rounded-2xl text-sm text-text-main font-mono leading-relaxed outline-none resize-none focus:border-primary focus:shadow-soft"
          />
        </motion.div>
      )}

      {/* Settings modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title={t('weekly.settings')}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-sub block mb-1">{t('weekly.reminderTime')}</label>
            <div className="flex gap-3">
              <select
                value={reportDay}
                onChange={e => setReportDay(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm outline-none focus:border-primary"
              >
                <option value={1}>{t('weekly.day.1')}</option>
                <option value={2}>{t('weekly.day.2')}</option>
                <option value={3}>{t('weekly.day.3')}</option>
                <option value={4}>{t('weekly.day.4')}</option>
                <option value={5}>{t('weekly.day.5')}</option>
                <option value={6}>{t('weekly.day.6')}</option>
                <option value={0}>{t('weekly.day.0')}</option>
              </select>
              <Input
                type="time"
                value={reportTime}
                onChange={e => setReportTime(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-sub block mb-1">{t('weekly.template')}</label>
            <p className="text-xs text-text-sub/60 mb-2">
              {t('weekly.templateHint')}{'{{completedItems}}'} {'{{inProgressItems}}'} {'{{nextWeekPlan}}'} {'{{blockers}}'}
            </p>
            <textarea
              value={template}
              onChange={e => setTemplate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm text-text-main font-mono outline-none focus:border-primary resize-none h-48"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowSettings(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSaveSettings}>{t('common.save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
