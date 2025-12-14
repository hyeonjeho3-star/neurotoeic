'use client';

import { useSettingsStore } from '@/stores/settingsStore';

export default function SettingsPage() {
  const {
    requestRetention,
    maximumInterval,
    maxNewCardsPerDay,
    maxReviewsPerDay,
    defaultSessionMinutes,
    restReminderMinutes,
    updateSetting,
    resetSettings,
  } = useSettingsStore();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* FSRS Parameters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          FSRS Algorithm
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Retention Rate
            </label>
            <input
              type="range"
              min="0.7"
              max="0.99"
              step="0.01"
              value={requestRetention}
              onChange={(e) => updateSetting('requestRetention', parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>70%</span>
              <span className="font-medium text-orange-500">{Math.round(requestRetention * 100)}%</span>
              <span>99%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Interval (days)
            </label>
            <input
              type="number"
              min="30"
              max="36500"
              value={maximumInterval}
              onChange={(e) => updateSetting('maximumInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Daily Limits */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Limits
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Cards Per Day
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={maxNewCardsPerDay}
              onChange={(e) => updateSetting('maxNewCardsPerDay', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Reviews Per Day
            </label>
            <input
              type="number"
              min="10"
              max="500"
              value={maxReviewsPerDay}
              onChange={(e) => updateSetting('maxReviewsPerDay', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Session Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Session Length (minutes)
            </label>
            <select
              value={defaultSessionMinutes}
              onChange={(e) => updateSetting('defaultSessionMinutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rest Reminder (minutes, 0 to disable)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={restReminderMinutes}
              onChange={(e) => updateSetting('restReminderMinutes', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          if (confirm('Reset all settings to defaults?')) {
            resetSettings();
          }
        }}
        className="w-full py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
