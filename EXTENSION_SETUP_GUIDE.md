# CPAssist Browser Extension - Complete Setup Guide

## 🎯 Quick Start (5 Minutes)

### Step 1: Start Backend ✅
```bash
cd backend
java -jar target/cpassist-backend-1.0.0.jar
```

Verify it's running: http://localhost:8080/api/actuator/health

### Step 2: Install Extension 🔌

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (top right toggle)
3. Click **"Load unpacked"**
4. Navigate to and select the `browser-extension` folder
5. You should see "CPAssist" extension appear

### Step 3: Get JWT Token 🔑

**Easy Way (Recommended):**
1. Go to http://localhost:5173 and log in
2. Click your profile (top right)
3. Go to **Preferences** tab
4. Find the purple **"Browser Extension Setup"** box
5. Click **"📋 Copy Token for Extension"**
6. Done! Token is in clipboard ✓

**Manual Way:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.getItem('token')`
4. Copy the token (remove quotes)

### Step 4: Configure Extension ⚙️

1. Click the CPAssist extension icon (top right of browser)
2. Paste token in **"CPAssist Auth Token"** field
3. Backend URL should be: `http://localhost:8080`
4. Click **"Save & Connect"**

✅ You should see: **"✓ Connected to CPAssist"**

### Step 5: Test It! 🎉

1. Go to https://leetcode.com/
2. Solve any problem (or use a previously solved one)
3. Click "Submit"
4. Wait for "Accepted" status
5. Look for extension notification: "Problem synced! ✓"
6. Check http://localhost:5173/progress to see it appear!

---

## 🐛 Troubleshooting

### ❌ "Invalid token or backend not reachable"

**Problem**: Extension can't connect to backend

**Solutions**:

1. **Check backend is running:**
   ```bash
   curl http://localhost:8080/api/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **Verify JWT token:**
   - Token might have expired (24 hours)
   - Go to Profile → Preferences → Copy fresh token
   - Paste in extension and click "Save & Connect"

3. **Check backend URL:**
   - Must be exactly: `http://localhost:8080`
   - No trailing slash
   - Include `http://` prefix

4. **CORS Issue:**
   - Backend has been configured to allow extension origins
   - If still issues, check backend logs for CORS errors
   - Restart backend: `java -jar target/cpassist-backend-1.0.0.jar`

5. **Token format:**
   - Should be long string like: `eyJhbGciOiJIUzI1NiJ9...`
   - No quotes around it
   - No extra spaces

### ❌ Extension not detecting submissions

**Problem**: You solved problem but extension didn't sync

**Solutions**:

1. **Check submission status:**
   - Extension only syncs "Accepted" submissions
   - "Wrong Answer" or "Time Limit Exceeded" are ignored
   - Wait for green "Accepted" checkmark

2. **Verify extension is enabled:**
   - Go to `chrome://extensions/`
   - Make sure CPAssist toggle is ON
   - Check for any error messages

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for CPAssist logs
   - Should see: "Submission detected: Problem Title"

4. **Platform-specific:**

   **LeetCode:**
   - Must be on problem page (not contest page)
   - Wait 2-3 seconds after "Accepted"
   - Check you're on `leetcode.com` not `leetcode.cn`

   **Codeforces:**
   - Must be on status page after submission
   - Look for green "Accepted" in status table
   - Extension checks every 3 seconds

   **CodeChef:**
   - Wait for submission to finish processing
   - Look for "Accepted" notification
   - Extension monitors for result popup

### ❌ "Failed to fetch" error

**Problem**: Network error when connecting

**Solutions**:

1. **Check network:**
   - Make sure you're not behind proxy
   - Disable VPN temporarily
   - Check firewall settings

2. **Backend port:**
   - Verify backend is on port 8080
   - Check if another service is using port 8080:
     ```bash
     lsof -i :8080
     ```

3. **Backend URL typo:**
   - Must be: `http://localhost:8080`
   - Common mistakes:
     - ❌ `https://localhost:8080` (no https)
     - ❌ `http://localhost:8080/api` (no /api)
     - ❌ `localhost:8080` (missing http://)

### ❌ Token expired or invalid

**Problem**: Token stopped working after some time

**Solution**:

JWT tokens expire after 24 hours. Get a new one:

1. Log in to CPAssist again
2. Go to Profile → Preferences
3. Click "📋 Copy Token for Extension"
4. Open extension popup
5. Paste new token
6. Click "Save & Connect"

### ❌ Backend not starting

**Problem**: Backend fails to start

**Solutions**:

1. **Check Java version:**
   ```bash
   java -version
   ```
   Need Java 17 or higher

2. **Check MongoDB:**
   ```bash
   brew services list | grep mongodb
   ```
   Should show "started"

   If not running:
   ```bash
   brew services start mongodb-community
   ```

3. **Port already in use:**
   ```bash
   lsof -i :8080
   kill -9 <PID>
   ```

4. **Rebuild project:**
   ```bash
   cd backend
   mvn clean package -DskipTests
   java -jar target/cpassist-backend-1.0.0.jar
   ```

### ❌ Problems not showing in frontend

**Problem**: Extension synced but not visible in app

**Solutions**:

1. **Refresh frontend:**
   - Go to http://localhost:5173/progress
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

2. **Check backend logs:**
   - Look for: `POST /api/submissions/external`
   - Should return 200 status
   - Check for any errors

3. **Verify submission in database:**
   ```bash
   mongosh
   use cpassist
   db.submissions.find().sort({_id:-1}).limit(1)
   ```

4. **Check problem matching:**
   - Backend logs should show: "Problem created" or "Problem found"
   - If not, title might not match exactly

---

## 🔍 Debug Mode

### Extension Logs

**Open Extension Console:**
1. Go to `chrome://extensions/`
2. Find CPAssist extension
3. Click "background page" or "service worker"
4. Console opens with extension logs

**What to look for:**
- `Submission detected: ...` - Content script found submission
- `Syncing submission to backend...` - Sending to API
- `Submission synced successfully` - All good!
- `Error syncing submission: ...` - Something went wrong

### Content Script Logs

**Open Page Console:**
1. Go to LeetCode/Codeforces/CodeChef
2. Press F12
3. Go to Console tab
4. Submit a problem
5. Look for CPAssist messages

**LeetCode logs:**
```
CPAssist: Monitoring for submissions...
CPAssist: Submission detected: Two Sum
CPAssist: Code: class Solution { ... }
CPAssist: Runtime: 45ms, Memory: 38.5MB
```

### Backend API Test

Test backend directly:

```bash
# Get your token
TOKEN="your-jwt-token-here"

# Test connection
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# Test submission endpoint
curl -X POST http://localhost:8080/api/submissions/external \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "problemTitle": "Test Problem",
    "problemUrl": "https://leetcode.com/problems/test/",
    "difficulty": "EASY",
    "platform": "LEETCODE",
    "code": "class Solution {}",
    "language": "java",
    "status": "ACCEPTED",
    "runtime": 45,
    "memory": 38.5
  }'
```

---

## 📊 Verification Checklist

Use this to verify everything is working:

- [ ] Backend running on http://localhost:8080
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB running
- [ ] Extension installed and enabled
- [ ] JWT token copied from profile
- [ ] Extension shows "✓ Connected to CPAssist"
- [ ] Backend logs show successful connection
- [ ] Test submission on LeetCode detected
- [ ] Extension notification appeared
- [ ] Submission visible in frontend progress page
- [ ] Backend logs show POST /submissions/external with 200

---

## 🎓 How It Works

### The Flow

```
1. You submit problem on LeetCode
   ↓
2. Content script (leetcode-tracker.js) detects "Accepted"
   ↓
3. Script extracts:
   - Problem title: "Two Sum"
   - Problem URL: "https://leetcode.com/problems/two-sum/"
   - Difficulty: "EASY"
   - Your code: "class Solution {...}"
   - Runtime: 45ms
   - Memory: 38.5MB
   ↓
4. Sends message to background worker (background.js)
   ↓
5. Background worker adds your JWT token
   ↓
6. Makes POST request to: http://localhost:8080/api/submissions/external
   ↓
7. Backend receives, validates token
   ↓
8. Backend creates/finds problem in database
   ↓
9. Backend creates submission record
   ↓
10. Backend marks problem as solved for you
   ↓
11. Extension shows notification: "Problem synced! ✓"
   ↓
12. Refresh frontend to see it! 🎉
```

### Security

- JWT token stored in Chrome's secure storage
- Token required for all API calls
- Backend validates token on every request
- No third-party services involved
- Code sent directly to YOUR backend

---

## 🚀 Advanced Tips

### Multiple Accounts

Want to track multiple LeetCode accounts?

1. Use different Chrome profiles
2. Each profile has its own extension instance
3. Configure each with different JWT tokens
4. Each syncs to corresponding CPAssist account

### Development Mode

To modify extension:

1. Edit files in `browser-extension/`
2. Go to `chrome://extensions/`
3. Click reload button on CPAssist extension
4. Changes take effect immediately

### Custom Backend URL

Running backend on different port?

1. Open extension popup
2. Change Backend URL to your port
3. Example: `http://localhost:9090`
4. Make sure CORS is configured

---

## 📞 Still Having Issues?

Check these resources:

1. **Backend logs** - Most errors appear here
2. **Browser console** - Extension errors show here
3. **Network tab** - See actual API calls
4. **Extension console** - Background worker logs
5. **MongoDB** - Verify data is saving

Common issue patterns:

- **Token issues** → Re-login and copy fresh token
- **CORS errors** → Restart backend
- **Detection issues** → Check platform-specific scripts
- **Sync issues** → Verify backend API endpoint
- **Display issues** → Hard refresh frontend

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Extension popup shows "✓ Connected to CPAssist"
2. ✅ Browser console shows submission detection
3. ✅ Extension notification appears after submission
4. ✅ Backend logs show POST /submissions/external
5. ✅ Progress page shows new submission
6. ✅ Problem count increases
7. ✅ Statistics update

**Happy Coding! 🎉**
