# Extension Debugging Guide - Progress Not Tracking

## Problem: CodeChef submissions not appearing in CPAssist progress tracker

## Step-by-Step Debugging Process

### 1. Check if Extension is Installed

1. **Open Chrome/Edge**
2. Go to `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode** (toggle in top-right)
4. Look for "**CPAssist - Coding Progress Tracker**"

**If NOT installed:**
```bash
# In Chrome, click "Load unpacked"
# Select: /Users/ishikabhoyar/Desktop/me/cpassist/browser-extension
```

### 2. Verify Extension Configuration

1. **Click the extension icon** in your browser toolbar
2. **Check these settings:**
   - ✅ Backend URL should be: `http://localhost:8080`
   - ✅ JWT Token should be filled (from your profile page)
   - ✅ Click "Test Connection" - should show "Connected successfully"

**If token is missing:**
- Go to http://localhost:5174/profile
- Scroll to "Browser Extension Setup"
- Click "Copy Token"
- Paste into extension popup

### 3. Enable Extension Logs

1. **Open Browser Console while on CodeChef:**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Go to **Console** tab
   - Clear console (🚫 icon)

2. **Reload the CodeChef problem page**
3. **Look for these messages:**
   ```
   ✅ CPAssist: CodeChef tracker loaded
   ✅ CPAssist: Monitoring CodeChef submissions...
   ```

**If you DON'T see these messages:**
- Extension is not loaded on CodeChef
- Check `chrome://extensions` - make sure it's enabled
- Check "Content scripts" section shows CodeChef

### 4. Check Background Service Worker

1. Go to `chrome://extensions`
2. Find "CPAssist" extension
3. Click **"service worker"** link (under "Inspect views")
4. Console opens - this shows background script logs

**Keep this console open** - you'll see API calls here

### 5. Test Submission Detection

**Method 1: Submit a Problem**
1. Go to: https://www.codechef.com/practice/course/stacks-and-queues/STAQUEF/problems/PREP59
2. Write solution and click **Submit**
3. Wait for "Accepted" result
4. **Check Browser Console** (F12) for:
   ```
   CPAssist: CodeChef accepted submission detected!
   CPAssist: Sending CodeChef submission to backend: {...}
   ```

**Method 2: Test on Already Solved**
- Unfortunately, CodeChef tracker only detects NEW submissions
- Must submit again to test

### 6. Monitor API Calls

**In Background Service Worker Console:**

✅ **Successful flow:**
```
POST http://localhost:8080/api/submissions/external
Status: 200 OK
Response: {message: "Submission synced successfully", ...}
```

❌ **Failed flows:**

**401 Unauthorized:**
```
POST http://localhost:8080/api/submissions/external - 401
```
→ Token expired or invalid - get new token from profile

**404 Not Found:**
```
POST http://localhost:8080/api/submissions/external - 404
```
→ Backend not running or wrong URL

**CORS Error:**
```
Access to fetch blocked by CORS policy
```
→ Backend CORS not configured (should be fixed)

### 7. Check Backend Logs

```bash
cd /Users/ishikabhoyar/Desktop/me/cpassist/backend

# Check if backend received the request
# Look for logs like:
# POST /api/submissions/external
```

### 8. Verify in Database

After successful submission, check frontend:
```
http://localhost:5174/progress
```

Should show the problem in one of:
- ✅ Solved Problems tab
- 📝 All Submissions tab

---

## Common Issues and Solutions

### Issue 1: Extension Not Loading on CodeChef

**Symptom:** No console logs from extension
**Solution:**
1. Check `chrome://extensions` - extension enabled?
2. Check manifest.json has: `"matches": ["https://www.codechef.com/*"]`
3. Try refreshing the page with `Cmd+Shift+R` (hard refresh)

### Issue 2: "CPAssist: CodeChef tracker loaded" but No Detection

**Symptom:** Tracker loads but doesn't detect accepted submission
**Solution:**
- The tracker watches for **new** submission results
- It may not detect if you're viewing old results
- **Submit the problem again** to test

### Issue 3: Token Issues

**Symptom:** 401 Unauthorized errors
**Solution:**
1. Go to http://localhost:5174/profile
2. Check token shows as **VALID**
3. Click **Copy Token** again
4. Paste into extension popup
5. Click **Save**

### Issue 4: Backend Not Receiving Requests

**Symptom:** No errors in console, but nothing in backend
**Solution:**
1. Check backend running: `lsof -i :8080`
2. Test endpoint manually:
   ```bash
   curl -X POST http://localhost:8080/api/submissions/external \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "problemTitle": "Test Problem",
       "problemUrl": "https://codechef.com/test",
       "difficulty": "EASY",
       "platform": "CODECHEF",
       "code": "test code",
       "language": "java",
       "status": "ACCEPTED"
     }'
   ```

### Issue 5: CodeChef Detection Not Working

**Why it's tricky:**
- CodeChef uses dynamic content loading
- Success notifications appear briefly
- Page structure varies by problem type

**Current Detection Method:**
```javascript
// Watches for elements with class containing "success" or "accepted"
// And text content containing "accepted" or "Accepted"
```

**Workaround:**
The extension needs to see the acceptance notification appear. If you've already solved the problem and are viewing results, it won't trigger. You need to:
1. Re-submit the solution
2. Wait for the notification to appear
3. Extension will detect it

---

## Testing Checklist

- [ ] Extension installed and visible in `chrome://extensions`
- [ ] Extension enabled (toggle is ON)
- [ ] Backend running on port 8080
- [ ] Frontend running on port 5174
- [ ] Valid JWT token copied from profile
- [ ] Extension configured with token
- [ ] "Test Connection" shows success
- [ ] Browser console shows "CPAssist: CodeChef tracker loaded"
- [ ] Background service worker console open
- [ ] Submit a problem on CodeChef
- [ ] Check console for "CPAssist: CodeChef accepted submission detected!"
- [ ] Check background worker for API call (POST /api/submissions/external)
- [ ] Check http://localhost:5174/progress for new submission

---

## Manual Test with Console Commands

If extension isn't working, test manually in browser console (F12):

```javascript
// Test if tracker is loaded
console.log('Testing CPAssist tracker...');

// Manually trigger submission detection
const submissionData = {
  problemTitle: "Valid Parenthesis",
  problemUrl: window.location.href,
  difficulty: "EASY",
  platform: "CODECHEF",
  code: "test code",
  language: "java",
  status: "ACCEPTED",
  runtime: 100,
  memory: 50
};

chrome.runtime.sendMessage({
  type: 'SUBMISSION_DETECTED',
  data: submissionData
}, (response) => {
  console.log('Response:', response);
});
```

---

## Still Not Working?

### Check Extension Permissions

In `chrome://extensions` → CPAssist → Details:
- ✅ "On all sites" or "On click" for CodeChef
- ✅ Site access: "On www.codechef.com"

### Reload Extension

1. Go to `chrome://extensions`
2. Click **reload** icon (🔄) on CPAssist
3. Close and reopen CodeChef tab
4. Try again

### Check Network Tab

1. Open DevTools (F12) → **Network** tab
2. Filter: `submissions/external`
3. Submit a problem
4. See if request appears
5. Click request → see response/error

---

## Quick Test Command

Run this to see ALL extension logs:
```bash
# This will show you what's happening
# Open this in terminal WHILE submitting on CodeChef
tail -f /Users/ishikabhoyar/Desktop/me/cpassist/backend/logs/application.log
```

(If logs folder doesn't exist, backend logs will be in terminal where you ran `mvn spring-boot:run`)
