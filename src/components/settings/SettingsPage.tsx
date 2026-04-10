import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../../store';
import Button from '../ui/Button';
import Input from '../ui/Input';
import * as storage from '../../utils/storage';
import { showToast } from '../ui/Toast';

export default function SettingsPage() {
  const { state, dispatch } = useAppState();
  const [focusMinutes, setFocusMinutes] = useState(state.settings.pomodoroFocusMinutes.toString());
  const [breakMinutes, setBreakMinutes] = useState(state.settings.pomodoroBreakMinutes.toString());
  const [longBreakMinutes, setLongBreakMinutes] = useState(state.settings.longBreakMinutes.toString());
  const [longBreakInterval, setLongBreakInterval] = useState(state.settings.longBreakInterval.toString());
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState(state.settings.customTags);

  const handleSave = async () => {
    const settings = {
      ...state.settings,
      pomodoroFocusMinutes: parseInt(focusMinutes) || 25,
      pomodoroBreakMinutes: parseInt(breakMinutes) || 5,
      longBreakMinutes: parseInt(longBreakMinutes) || 15,
      longBreakInterval: parseInt(longBreakInterval) || 4,
      customTags: tags,
    };
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    await storage.saveSettings(settings);
    showToast('设置已保存~');
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6"
    >
      <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
        <span className="text-base">⚙️</span> 设置
      </h3>

      {/* Pomodoro settings */}
      <div className="bg-white rounded-2xl p-4 shadow-card space-y-4">
        <h4 className="text-sm font-medium text-text-main">🍅 番茄钟</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="专注时长(分钟)"
            type="number"
            value={focusMinutes}
            onChange={e => setFocusMinutes(e.target.value)}
          />
          <Input
            label="休息时长(分钟)"
            type="number"
            value={breakMinutes}
            onChange={e => setBreakMinutes(e.target.value)}
          />
          <Input
            label="长休息时长(分钟)"
            type="number"
            value={longBreakMinutes}
            onChange={e => setLongBreakMinutes(e.target.value)}
          />
          <Input
            label="长休息间隔(次)"
            type="number"
            value={longBreakInterval}
            onChange={e => setLongBreakInterval(e.target.value)}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
        <h4 className="text-sm font-medium text-text-main">🏷️ 自定义标签</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-warm-dark rounded-full text-xs text-text-main"
            >
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-accent">✕</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="添加新标签..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            className="flex-1 px-3 py-2 bg-warm border border-warm-dark rounded-xl text-sm outline-none focus:border-primary"
          />
          <Button size="sm" onClick={addTag}>添加</Button>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
        <h4 className="text-sm font-medium text-text-main">💾 数据管理</h4>
        <p className="text-xs text-text-sub">所有数据保存在浏览器本地，不会上传到任何服务器</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
              await storage.clearAll();
              location.reload();
            }
          }}
        >
          清除所有数据
        </Button>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>保存设置</Button>
      </div>
    </motion.div>
  );
}
