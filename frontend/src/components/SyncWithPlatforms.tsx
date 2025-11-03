import { useState } from 'react';
import apiClient from '../lib/apiClient';

export default function SyncWithPlatforms() {
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSync = async (platform: 'leetcode' | 'codeforces' | 'codechef') => {
    if (platform === 'leetcode' && !leetcodeUsername.trim()) {
      setMessage({ type: 'error', text: 'Please enter your LeetCode username' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post(`/sync/${platform}`, {
        [`${platform}Username`]: leetcodeUsername
      });

      setMessage({
        type: 'success',
        text: response.data.message || `Successfully synced with ${platform}!`
      });

      // Clear input
      setLeetcodeUsername('');

      // Reload page after 2 seconds to show updated progress
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || `Failed to sync with ${platform}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-border rounded-base p-6 bg-white dark:bg-gray-800">
      <h3 className="text-xl font-bold mb-4">🔄 Sync with Coding Platforms</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Import your solved problems from external platforms to track all your progress in one place.
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-base ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* LeetCode Sync */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          LeetCode Username
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={leetcodeUsername}
            onChange={(e) => setLeetcodeUsername(e.target.value)}
            placeholder="Enter your LeetCode username"
            className="flex-1 px-3 py-2 border-2 border-border rounded-base focus:outline-none focus:ring-2 focus:ring-main dark:bg-gray-700"
            disabled={loading}
          />
          <button
            onClick={() => handleSync('leetcode')}
            disabled={loading || !leetcodeUsername.trim()}
            className="px-4 py-2 bg-main text-main-foreground rounded-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Syncing...' : 'Sync LeetCode'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ⚠️ Note: LeetCode sync is currently limited and may not work for all users.
        </p>
      </div>

      {/* Coming Soon Platforms */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border border-border rounded-base opacity-60">
          <span className="font-medium">Codeforces</span>
          <span className="text-sm text-muted-foreground">Coming Soon</span>
        </div>
        <div className="flex items-center justify-between p-3 border border-border rounded-base opacity-60">
          <span className="font-medium">CodeChef</span>
          <span className="text-sm text-muted-foreground">Coming Soon</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-base">
        <h4 className="font-semibold text-sm mb-2">💡 Better Alternative: Browser Extension</h4>
        <p className="text-xs text-muted-foreground">
          For real-time automatic syncing, we recommend installing our browser extension 
          (coming soon). It will automatically track your submissions as you solve problems 
          on LeetCode, Codeforces, and CodeChef.
        </p>
      </div>
    </div>
  );
}
