# CPAssist Browser Extension

Automatically track your coding progress across LeetCode, Codeforces, and CodeChef!

## 🚀 Features

- ✅ **Automatic Tracking** - Detects when you solve problems
- 📊 **Real-time Sync** - Instantly syncs to your CPAssist account
- 🎯 **Multi-Platform** - Works on LeetCode, Codeforces, and CodeChef
- 🔐 **Secure** - Uses JWT authentication
- 📝 **Code Capture** - Saves your solutions (LeetCode only)
- 🔔 **Notifications** - Get notified when problems are synced
- 🎨 **Beautiful UI** - Clean and modern interface

## Installation

### Prerequisites

⚠️ **Important**: Make sure your backend is running on `http://localhost:8080` before configuring the extension!

You can verify by visiting: http://localhost:8080/api/actuator/health

### Step 1: Install the Extension

1. Open Chrome (or any Chromium-based browser like Edge, Brave)
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `browser-extension` folder from this project

### Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in the `browser-extension` folder
4. Configure as above

### Step 2: Get Your JWT Token

#### Easy Method (Recommended) ⭐

1. Log in to your CPAssist account at `http://localhost:5173`
2. Go to your **Profile** page
3. Click on **Preferences** tab
4. Find the "Browser Extension Setup" section (purple box at top)
5. Click **"📋 Copy Token for Extension"** button
6. Token is now in your clipboard!

#### Manual Method

1. Log in to CPAssist frontend at `http://localhost:5173`
2. Open browser console (F12 or Cmd+Option+I on Mac)
3. Type: `localStorage.getItem('token')`
4. Copy the token (without quotes)

### Step 3: Configure Extension

1. Click the CPAssist extension icon in your browser toolbar
2. Paste the token in the "CPAssist Auth Token" field
3. Verify Backend URL is: `http://localhost:8080`
4. Click **"Save & Connect"**
5. You should see "✓ Connected to CPAssist" status

If you see "Invalid token" error:
- Make sure backend is running on port 8080
- Try copying token again from Profile page
- Check browser console for detailed errors

## 🎯 How to Use

1. **Install & Configure** (one-time setup)
   - Install extension
   - Add your auth token
   - Done!

2. **Solve Problems**
   - Go to LeetCode/Codeforces/CodeChef
   - Solve any problem
   - Submit your solution
   - Extension automatically detects and syncs! ✨

3. **View Progress**
   - Go to http://localhost:3000/progress
   - See all your synced problems
   - Track your progress across platforms

## 📋 Supported Platforms

| Platform | Status | Code Capture | Real-time Sync |
|----------|--------|--------------|----------------|
| LeetCode | ✅ Working | ✅ Yes | ✅ Yes |
| Codeforces | ✅ Working | ❌ No* | ✅ Yes |
| CodeChef | ✅ Working | ❌ No* | ✅ Yes |

*Codeforces and CodeChef don't expose submitted code through their UI

## 🛠️ Technical Details

### Architecture

```
User solves problem
      ↓
Content Script detects submission
      ↓
Extracts problem info & code
      ↓
Sends to Background Worker
      ↓
Background Worker authenticates
      ↓
Sends to CPAssist Backend API
      ↓
Progress updated! ✓
```

### Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker (handles API calls)
- `leetcode-tracker.js` - LeetCode content script
- `codeforces-tracker.js` - Codeforces content script
- `codechef-tracker.js` - CodeChef content script
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic

### API Endpoints

The extension calls:
```
POST /api/submissions/external
Authorization: Bearer <token>

Body: {
  "problemTitle": "Two Sum",
  "problemUrl": "https://leetcode.com/problems/two-sum/",
  "difficulty": "EASY",
  "platform": "LEETCODE",
  "code": "class Solution {...}",
  "language": "java",
  "status": "ACCEPTED",
  "runtime": 45,
  "memory": 38.5,
  "submittedAt": "2025-11-04T10:30:00Z"
}
```

## 🔧 Development

### Testing Locally

1. Make sure CPAssist backend is running:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Load extension in Chrome (Developer mode)

3. Go to LeetCode and solve a problem

4. Check:
   - Extension icon for sync status
   - Browser console for logs (F12)
   - Backend logs for API calls
   - CPAssist app for synced problem

### Debug Mode

Open extension popup and press F12 to see:
- Storage data
- API calls
- Error messages

Open page console (F12) to see:
- Content script logs
- Submission detection
- Problem extraction

## 🐛 Troubleshooting

### Extension not detecting submissions

1. **Check auth token**
   - Open extension popup
   - Verify token is saved
   - Try re-entering token

2. **Check backend URL**
   - Make sure backend is running
   - Try http://localhost:8080
   - Check CORS settings

3. **Check browser console**
   - Open DevTools (F12)
   - Look for CPAssist logs
   - Check for errors

### Submissions not syncing

1. **Verify backend is running**
   ```bash
   curl http://localhost:8080/api/users/profile \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Check network tab**
   - F12 → Network tab
   - Submit a problem
   - Look for POST to `/api/submissions/external`
   - Check response

3. **Review backend logs**
   - Look for incoming requests
   - Check for authentication errors
   - Verify problem matching

### Token expired

- Log in to CPAssist again
- Get new token from DevTools
- Update in extension popup

## 📱 Permissions Explained

- **storage** - Save your auth token securely
- **activeTab** - Access current page to detect submissions
- **notifications** - Show sync success/failure notifications
- **host_permissions** - Access LeetCode, Codeforces, CodeChef, and your backend

We only access the specific platforms listed. Your code and data are sent directly to YOUR CPAssist backend.

## 🔒 Privacy & Security

- ✅ Extension only sends data to YOUR backend
- ✅ Token stored locally in browser (not shared)
- ✅ No third-party analytics
- ✅ No data collection
- ✅ Open source (you can review all code)

## 🚀 Future Features

- [ ] Settings page for customization
- [ ] Manual sync button
- [ ] Statistics dashboard
- [ ] Dark mode
- [ ] More platforms (HackerRank, Atcoder)
- [ ] Streak notifications
- [ ] Daily goals

## 📝 License

MIT License - Feel free to modify and distribute!

## 🤝 Contributing

Issues and PRs welcome! See main repository: https://github.com/Arnab-Afk/cpassist

## 📞 Support

- GitHub Issues: https://github.com/Arnab-Afk/cpassist/issues
- Discord: Coming soon!

---

Made with ❤️ for the coding community
