// Background Service Worker for TaskTab
// Handles alarms and notifications

// Set up weekly report alarm on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('tasktab_settings', (result) => {
    const settings = result.tasktab_settings;
    if (settings?.weeklyReport?.enabled) {
      setupWeeklyAlarm(settings.weeklyReport);
    }
  });
});

// Listen for alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'weekly-report') {
    chrome.notifications.create('weekly-report-reminder', {
      type: 'basic',
      iconUrl: 'public/icons/icon-128.png',
      title: 'TaskTab 周报提醒',
      message: '该写周报啦~ 点击新标签页生成本周周报吧！',
      priority: 2,
    });
  }

  if (alarm.name === 'pomodoro-end') {
    chrome.notifications.create('pomodoro-end', {
      type: 'basic',
      iconUrl: 'public/icons/icon-128.png',
      title: '番茄钟结束',
      message: '专注时间结束啦，休息一下吧~',
      priority: 2,
    });
  }
});

// Handle messages from popup/newtab
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SET_WEEKLY_ALARM') {
    setupWeeklyAlarm(message.config);
    sendResponse({ ok: true });
  }
  if (message.type === 'CANCEL_ALARM') {
    chrome.alarms.clear(message.name);
    sendResponse({ ok: true });
  }
  return true;
});

function setupWeeklyAlarm(config: { dayOfWeek: number; time: string }) {
  chrome.alarms.clear('weekly-report');

  const [hours, minutes] = config.time.split(':').map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  // Find next occurrence of target day
  const currentDay = target.getDay();
  let daysUntil = config.dayOfWeek - currentDay;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0 && target <= now) daysUntil = 7;

  target.setDate(target.getDate() + daysUntil);

  chrome.alarms.create('weekly-report', {
    when: target.getTime(),
    periodInMinutes: 7 * 24 * 60, // weekly
  });
}
