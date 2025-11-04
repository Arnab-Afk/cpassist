import { useState } from 'react';
import apiClient from '../lib/apiClient';

export default function SyncWithPlatforms() {
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [codeforcesUsername, setCodeforcesUsername] = useState('');
  const [codechefUsername, setCodechefUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSync = async (platform: 'leetcode' | 'codeforces' | 'codechef') => {
    let username = '';
    
    if (platform === 'leetcode') {
      username = leetcodeUsername.trim();
    } else if (platform === 'codeforces') {
      username = codeforcesUsername.trim();
    } else if (platform === 'codechef') {
      username = codechefUsername.trim();
    }

    if (!username) {
      setMessage({ type: 'error', text: `Please enter your ${platform} username` });
      return;
    }

    setLoading(true);
    setSyncingPlatform(platform);
    setMessage(null);

    try {
      const response = await apiClient.post(`/sync/${platform}`, {
        username: username
      });

      setMessage({
        type: 'success',
        text: response.data.message || `Successfully synced ${response.data.problemsSynced || 0} problems from ${platform}!`
      });

      // Clear input
      if (platform === 'leetcode') setLeetcodeUsername('');
      if (platform === 'codeforces') setCodeforcesUsername('');
      if (platform === 'codechef') setCodechefUsername('');

      // Reload page after 2 seconds to show updated progress
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || `Failed to sync with ${platform}. Please check the username and try again.`
      });
    } finally {
      setLoading(false);
      setSyncingPlatform(null);
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

      {/* Codeforces Sync */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Codeforces Handle
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={codeforcesUsername}
            onChange={(e) => setCodeforcesUsername(e.target.value)}
            placeholder="Enter your Codeforces handle"
            className="flex-1 px-3 py-2 border-2 border-border rounded-base focus:outline-none focus:ring-2 focus:ring-main dark:bg-gray-700"
            disabled={loading}
          />
          <button
            onClick={() => handleSync('codeforces')}
            disabled={loading || !codeforcesUsername.trim()}
            className="px-4 py-2 bg-main text-main-foreground rounded-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && syncingPlatform === 'codeforces' ? 'Syncing...' : 'Sync Codeforces'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ✅ Syncs all your accepted (OK verdict) submissions from Codeforces
        </p>
      </div>

      {/* CodeChef Sync */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          CodeChef Username
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={codechefUsername}
            onChange={(e) => setCodechefUsername(e.target.value)}
            placeholder="Enter your CodeChef username"
            className="flex-1 px-3 py-2 border-2 border-border rounded-base focus:outline-none focus:ring-2 focus:ring-main dark:bg-gray-700"
            disabled={loading}
          />
          <button
            onClick={() => handleSync('codechef')}
            disabled={loading || !codechefUsername.trim()}
            className="px-4 py-2 bg-main text-main-foreground rounded-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && syncingPlatform === 'codechef' ? 'Syncing...' : 'Sync CodeChef'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ⏳ Coming soon - CodeChef API integration in progress
        </p>
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
