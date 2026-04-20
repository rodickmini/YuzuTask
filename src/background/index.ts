// Background Service Worker for YuzuTask
// Handles alarms and notifications

import i18n from 'i18next';
import zh from '../i18n/locales/zh.json';
import en from '../i18n/locales/en.json';
import ja from '../i18n/locales/ja.json';

function detectLanguage(): string {
  const lang = navigator.language;
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('ja')) return 'ja';
  return 'en';
}

i18n.init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

const t = i18n.t.bind(i18n);

// --- Notification click handler ---
// Opens/focuses a new tab when user clicks a notification
chrome.notifications.onClicked.addListener((_notificationId) => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

// --- Set up weekly report alarm on install ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('yuzutask_settings', (result) => {
    const settings = result.yuzutask_settings;
    if (!settings?.weeklyReport?.enabled) return;

    const config = settings.weeklyReport;
    if (typeof config.dayOfWeek !== 'number' || typeof config.time !== 'string') {
      console.error('[background] Invalid weeklyReport config in settings, skipping alarm setup');
      return;
    }

    setupWeeklyAlarm(config);
  });
});

// --- Alarm listener ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'weekly-report') {
    chrome.notifications.create('weekly-report-reminder', {
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: t('notification.weeklyTitle'),
      message: t('notification.weeklyMessage'),
      priority: 2,
    });
  } else if (alarm.name === 'pomodoro-end') {
    chrome.notifications.create('pomodoro-end', {
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: t('notification.pomodoroTitle'),
      message: t('notification.pomodoroMessage'),
      priority: 2,
    });
  } else if (alarm.name === 'pomodoro-break-end') {
    chrome.notifications.create('pomodoro-break-end', {
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: t('notification.breakTitle'),
      message: t('notification.breakMessage'),
      priority: 2,
    });
  }
});

// --- Message handlers ---
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SET_WEEKLY_ALARM') {
    const config = message.config;
    if (!config || typeof config.dayOfWeek !== 'number' || typeof config.time !== 'string') {
      sendResponse({ ok: false, error: 'Invalid config: dayOfWeek (number) and time (string) are required' });
      return true;
    }
    setupWeeklyAlarm(config);
    sendResponse({ ok: true });
  } else if (message.type === 'CANCEL_ALARM') {
    const alarmName = message.name;
    if (typeof alarmName !== 'string') {
      sendResponse({ ok: false, error: 'Invalid alarm name' });
      return true;
    }
    chrome.alarms.clear(alarmName).then((wasCleared) => {
      sendResponse({ ok: true, wasCleared });
    });
    return true;
  }
  return true;
});

// --- Helpers ---
function setupWeeklyAlarm(config: { dayOfWeek: number; time: string }) {
  chrome.alarms.clear('weekly-report');

  const parts = config.time.split(':');
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.error('[background] Invalid time format:', config.time, '— expected HH:MM');
    return;
  }

  const now = new Date();
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  // Find next occurrence of target day (0=Sunday through 6=Saturday)
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
