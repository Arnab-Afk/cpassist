# Quick Checklist - Progress Not Tracking

## ⚡ Fast Troubleshooting Steps

### 🔴 Step 1: Is Extension Installed?
- [ ] Open `chrome://extensions` (or `edge://extensions`)
- [ ] Look for "CPAssist - Coding Progress Tracker"
- [ ] Extension toggle is **ON** (blue)

**If NO:** Click "Load unpacked" → Select: `/Users/ishikabhoyar/Desktop/me/cpassist/browser-extension`

---

### 🔴 Step 2: Is Backend Running?
```bash
lsof -i :8080
```
- [ ] Should show Java process

**If NO:** 
```bash
cd /Users/ishikabhoyar/Desktop/me/cpassist/backend
mvn spring-boot:run
```

---

### 🔴 Step 3: Get JWT Token
- [ ] Go to: http://localhost:5174/profile
- [ ] Scroll to "Browser Extension Setup"
- [ ] Click "Copy Token" button
- [ ] Token copied to clipboard

---

### 🔴 Step 4: Configure Extension
- [ ] Click extension icon in browser toolbar
- [ ] Backend URL: `http://localhost:8080`
- [ ] Paste JWT token
- [ ] Click "Save"
- [ ] Click "Test Connection"
- [ ] Should say "Connected successfully"

---

### 🔴 Step 5: Test Backend API
```bash
cd /Users/ishikabhoyar/Desktop/me/cpassist
./test-extension-api.sh
```
- [ ] Paste your JWT token when prompted
- [ ] Should return "SUCCESS!"

---

### 🔴 Step 6: Test on CodeChef
1. [ ] Open DevTools (F12) → Console tab
2. [ ] Go to: https://www.codechef.com/practice/course/stacks-and-queues/STAQUEF/problems/PREP59
3. [ ] Look for: `CPAssist: CodeChef tracker loaded`
4. [ ] Submit the problem (even if already solved)
5. [ ] Wait for "Accepted" result
6. [ ] Look for: `CPAssist: CodeChef accepted submission detected!`
7. [ ] Look for: `CPAssist: Sending CodeChef submission to backend:`

---

### 🔴 Step 7: Check Progress
- [ ] Go to: http://localhost:5174/progress
- [ ] Should see the problem in "Solved Problems" or "All Submissions"

---

## 🚨 If Still Not Working

### Check Console Logs
**Browser Console (F12):**
```
✅ Should see: CPAssist: CodeChef tracker loaded
✅ Should see: CPAssist: Monitoring CodeChef submissions...
```

**Background Service Worker:**
1. Go to `chrome://extensions`
2. Click "service worker" under CPAssist
3. Submit on CodeChef
4. Should see POST to `/api/submissions/external`

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| No console logs | Extension not loaded | Refresh page with Cmd+Shift+R |
| 401 Unauthorized | Token expired | Get new token from profile |
| 404 Not Found | Wrong URL | Check backend URL in extension |
| CORS error | CORS not configured | Already configured, reload backend |
| "Tracker loaded" but no detection | Old submission page | Must submit again |

---

## 🎯 Most Likely Issues

### 1️⃣ Extension Not Installed
**Check:** `chrome://extensions` shows CPAssist

### 2️⃣ Token Not Configured
**Check:** Extension popup has token filled in

### 3️⃣ Viewing Old Results
**Problem:** Extension only detects NEW submissions
**Solution:** Re-submit the problem (even if solved)

---

## 📞 Need More Help?

**Full debugging guide:** `EXTENSION_DEBUG_GUIDE.md`

**Test backend API:**
```bash
./test-extension-api.sh
```

**Check backend logs:** Look at terminal where you ran `mvn spring-boot:run`

**Check extension logs:**
- Browser console (F12) on CodeChef
- Background service worker (`chrome://extensions` → service worker)
