# 🔧 Extension Token Issue - FIXED

## What Was Wrong?

The error **"String contains non ISO-8859-1 code point"** happened because:

1. The token input field was `type="password"` which caused browser to mask it with special characters (•••)
2. Some browsers add hidden unicode characters when pasting into password fields
3. The token wasn't being properly cleaned before sending to the API

## What I Fixed

### 1. **Changed Input Type** (`popup.html`)
- Changed from `type="password"` to `type="text"`
- Now you can see the actual token when pasting
- Added monospace font for better readability
- Token should look like: `eyJhbGciOiJIUzI1NiJ9.eyJzdWI...`

### 2. **Added Token Cleaning** (`popup.js`)
- Automatically removes non-ASCII characters
- Strips quotes, whitespace, and special characters
- Validates JWT format (must have 3 parts: `xxx.yyy.zzz`)
- Detects if you copied the masked version (•••) by mistake

### 3. **Better Error Messages** (`popup.js`)
- Shows specific error if token format is wrong
- Warns if you copied the bullet points instead of actual token
- Better messages for connection issues

### 4. **Updated Profile Page** (`ProfilePage.tsx`)
- Added helpful instructions about token format
- Shows that token starts with "eyJ..."
- Mentions 24-hour expiration

---

## 🎯 How to Use (Updated)

### Step 1: Reload the Extension

1. Go to `chrome://extensions/`
2. Find **CPAssist** extension
3. Click the **reload** button (🔄 icon)

### Step 2: Get Fresh Token

1. Go to http://localhost:5173/profile
2. Click **Preferences** tab
3. Scroll to purple **"Browser Extension Setup"** section
4. Click **"📋 Copy Token for Extension"** button
5. You should see "✓ Copied!" message

### Step 3: Configure Extension

1. Click CPAssist extension icon in browser toolbar
2. You'll see the popup with two fields
3. **CPAssist Auth Token field:**
   - Paste your token (Cmd+V / Ctrl+V)
   - Token should look like: `eyJhbGciOiJIUzI1NiJ9.eyJzdWI6...`
   - If you see dots (•••), you copied the masked version - try again!
4. **Backend URL field:**
   - Should be: `http://localhost:8080`
5. Click **"Save & Connect"** button

### Step 4: Verify Connection

✅ **Success Looks Like:**
```
✓ Connected to CPAssist
```

❌ **Common Issues:**

**"Invalid token format. JWT should have 3 parts"**
- Token doesn't have the right format
- Should be: `xxxxx.yyyyy.zzzzz` (3 parts separated by dots)
- Solution: Copy token again from Profile page

**"Token contains bullet points"**
- You copied the masked version (•••) from the profile preview
- Solution: Click the "Copy Token" button, don't select and copy the preview

**"Invalid token or backend not reachable"**
- Backend isn't running OR token is expired
- Solution: 
  1. Check backend is running: `curl http://localhost:8080/api/actuator/health`
  2. Get fresh token from profile page
  3. Try again

---

## 🧪 Testing

### 1. Verify Token Format

Your token should:
- Start with `eyJ`
- Have exactly 2 dots (`.`) creating 3 parts
- Contain only alphanumeric characters and `-`, `_`
- Be about 200-400 characters long

Example valid token start:
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhcm5hYi5iXzM4OTcx...
```

### 2. Test Copy Button

```javascript
// Open Profile page and console (F12)
// Run this to see your token:
console.log(localStorage.getItem('token'));

// Should output something like:
// eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhcm5hYi5iXzM4OTcx...
```

### 3. Test Extension Connection

1. Open extension popup
2. Paste token
3. Click "Save & Connect"
4. Should show: "✓ Connected to CPAssist"

### 4. Test Auto-Sync

1. Go to https://leetcode.com/
2. Submit any problem (or re-submit old one)
3. Wait for "Accepted" ✓
4. Look for notification: "Problem synced! ✓"
5. Check http://localhost:5173/progress

---

## 🔍 Debugging

### Check Token in Console

```javascript
// Extension popup - right click and "Inspect"
// In console:
chrome.storage.sync.get(['authToken'], (result) => {
  console.log('Stored token:', result.authToken);
  console.log('Token length:', result.authToken?.length);
  console.log('Token parts:', result.authToken?.split('.').length);
});
```

### Check Token in Profile

```javascript
// Profile page - press F12, in console:
const token = localStorage.getItem('token');
console.log('Token:', token);
console.log('Starts with eyJ:', token?.startsWith('eyJ'));
console.log('Parts:', token?.split('.').length);
console.log('Contains non-ASCII:', /[^\x00-\x7F]/.test(token));
```

### Check Backend Connection

```bash
# Get your token from profile
TOKEN="your-actual-token-here"

# Test connection
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -v

# Should return your user data with 200 status
```

---

## ✅ Verification Checklist

- [ ] Extension reloaded in Chrome
- [ ] Backend running on port 8080
- [ ] Fresh token copied from profile page
- [ ] Token pasted in extension (visible, not masked)
- [ ] Token starts with `eyJ`
- [ ] Token has exactly 3 parts (2 dots)
- [ ] Backend URL is `http://localhost:8080`
- [ ] Clicked "Save & Connect"
- [ ] Status shows "✓ Connected to CPAssist"
- [ ] Browser console has no errors
- [ ] Extension console has no errors

---

## 🎉 Success!

Once connected, you should:
1. ✅ See "✓ Connected to CPAssist" in extension popup
2. ✅ See your stats (synced count, last sync)
3. ✅ Be able to solve LeetCode problems and have them auto-sync
4. ✅ Get notifications when problems sync
5. ✅ See progress update in http://localhost:5173/progress

---

## 💡 Pro Tips

### Token Expiry
- JWT tokens expire after 24 hours
- If extension stops working tomorrow, get fresh token
- Extension will show "Invalid token" error when expired

### Multiple Devices
- Each browser/device needs its own extension instance
- All can use the same JWT token (until it expires)
- They'll all sync to the same CPAssist account

### Privacy
- Token gives full access to your account
- Don't share your token
- Extension only sends data to YOUR backend (localhost:8080)
- No third-party services involved

### Development
- To modify extension: edit files in `browser-extension/`
- Then reload extension in Chrome
- Changes take effect immediately
- Check both page console and extension console for logs

---

## 🆘 Still Not Working?

1. **Check the fix was applied:**
   ```bash
   cd browser-extension
   grep "type=\"text\"" popup.html
   # Should show: type="text"
   
   grep "replace(/\[^\\x00-\\x7F\]/g" popup.js
   # Should show the cleaning code
   ```

2. **Verify backend CORS:**
   ```bash
   cd backend
   grep "chrome-extension" src/main/resources/application.yml
   # Should show: chrome-extension://*
   ```

3. **Check backend is updated:**
   ```bash
   # Backend should have been rebuilt
   ls -la target/cpassist-backend-1.0.0.jar
   # Check timestamp is recent (today)
   ```

4. **Full reset:**
   ```bash
   # Stop backend (Ctrl+C)
   cd backend
   mvn clean package -DskipTests
   java -jar target/cpassist-backend-1.0.0.jar
   
   # Reload extension in Chrome
   # Get fresh token from profile
   # Try again
   ```

---

**Still stuck?** Check:
- Backend logs for errors
- Browser console (F12) for errors  
- Extension console (chrome://extensions → Details → background page)
- Network tab to see API calls

The token cleaning and validation should now prevent the "non ISO-8859-1" error! 🎯
