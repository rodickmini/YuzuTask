import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Copy, FileText, Settings, Check } from 'lucide-react';
import { useAppState } from '../../store';
import { generateWeeklyReport } from '../../utils/report';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { showToast } from '../ui/Toast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import * as storage from '../../utils/storage';
import type { UserSettings } from '../../types';

export default function WeeklyReport() {
  const { state, dispatch } = useAppState();
  const [report, setReport] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings form state
  const [reportDay, setReportDay] = useState(state.settings.weeklyReport.dayOfWeek);
  const [reportTime, setReportTime] = useState(state.settings.weeklyReport.time);
  const [template, setTemplate] = useState(state.settings.weeklyReport.template);

  const weekLabel = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${format(monday, 'M月d日', { locale: zhCN })} - ${format(sunday, 'M月d日', { locale: zhCN })}`;
  }, []);

  const handleGenerate = () => {
    const reportText = generateWeeklyReport(
      state.workLogs,
      state.tasks,
      state.settings.weeklyReport,
    );
    setReport(reportText);
    setIsGenerated(true);
    showToast('周报已生成~ ✨');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      showToast('已复制到剪贴板~');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败，请手动复制', 'error');
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
    showToast('周报设置已保存~');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
          <span className="text-base">📊</span> 周报生成器
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
      <div className="bg-white rounded-2xl p-4 shadow-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-main font-medium">
            本周：{weekLabel}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-light text-primary">
              {state.workLogs.filter(l => {
                const now = new Date();
                const day = now.getDay();
                const mondayOffset = day === 0 ? -6 : 1 - day;
                const monday = new Date(now);
                monday.setDate(now.getDate() + mondayOffset);
                monday.setHours(0, 0, 0, 0);
                return new Date(l.date) >= monday;
              }).length}
            </div>
            <div className="text-xs text-text-sub">工作记录</div>
          </div>
          <div>
            <div className="text-2xl font-light text-mint">
              {state.tasks.filter(t => {
                const now = new Date();
                const day = now.getDay();
                const mondayOffset = day === 0 ? -6 : 1 - day;
                const monday = new Date(now);
                monday.setDate(now.getDate() + mondayOffset);
                monday.setHours(0, 0, 0, 0);
                return t.status === 'done' && new Date(t.completedAt || t.createdAt) >= monday;
              }).length}
            </div>
            <div className="text-xs text-text-sub">已完成任务</div>
          </div>
          <div>
            <div className="text-2xl font-light text-cream">
              {(() => {
                const total = state.workLogs
                  .filter(l => {
                    const now = new Date();
                    const day = now.getDay();
                    const mondayOffset = day === 0 ? -6 : 1 - day;
                    const monday = new Date(now);
                    monday.setDate(now.getDate() + mondayOffset);
                    monday.setHours(0, 0, 0, 0);
                    return new Date(l.date) >= monday;
                  })
                  .reduce((s, l) => s + l.durationMinutes, 0);
                return total >= 60 ? `${Math.round(total / 60 * 10) / 10}h` : `${total}m`;
              })()}
            </div>
            <div className="text-xs text-text-sub">总工时</div>
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
          <p className="text-text-sub text-sm mb-4">基于本周的工作记录和任务自动生成周报</p>
          <Button onClick={handleGenerate} size="lg">
            生成本周周报
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
            <span className="text-xs text-text-sub">可直接编辑后复制</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleGenerate}>
                重新生成
              </Button>
              <Button size="sm" onClick={handleCopy} icon={copied ? <Check size={14} /> : <Copy size={14} />}>
                {copied ? '已复制' : '复制'}
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
        title="周报设置"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-sub block mb-1">提醒生成周报的时间</label>
            <div className="flex gap-3">
              <select
                value={reportDay}
                onChange={e => setReportDay(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm outline-none focus:border-primary"
              >
                <option value={1}>周一</option>
                <option value={2}>周二</option>
                <option value={3}>周三</option>
                <option value={4}>周四</option>
                <option value={5}>周五</option>
                <option value={6}>周六</option>
                <option value={0}>周日</option>
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
            <label className="text-xs text-text-sub block mb-1">周报模板</label>
            <p className="text-xs text-text-sub/60 mb-2">
              可用占位符：{'{{completedItems}}'} {'{{inProgressItems}}'} {'{{nextWeekPlan}}'} {'{{blockers}}'}
            </p>
            <textarea
              value={template}
              onChange={e => setTemplate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm text-text-main font-mono outline-none focus:border-primary resize-none h-48"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowSettings(false)}>取消</Button>
            <Button onClick={handleSaveSettings}>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
