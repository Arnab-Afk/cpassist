# 📊 Progress Tracking System - How It Works

## Current Implementation

CPAssist tracks your coding progress through **manual submissions** to the platform. Here's how it works:

### 1. **Manual Submission Flow** (Currently Available)

```
User solves problem → Submits code through CPAssist → 
Backend saves submission → Updates solvedProblems → 
Updates streak & profile → Progress automatically tracked
```

**Steps:**
1. Go to Questions page
2. Select a problem to solve
3. Write your solution in the editor
4. Click "Submit" button
5. Your progress is automatically tracked!

**What Gets Tracked:**
- ✅ Problem ID and title
- ✅ Your code solution
- ✅ Programming language used
- ✅ Submission status (ACCEPTED, WRONG_ANSWER, etc.)
- ✅ Runtime and memory usage
- ✅ Submission timestamp
- ✅ Personal notes

**Database Records Created:**
```javascript
Submission {
  userId: "user123",
  problemId: "prob456",
  code: "class Solution { ... }",
  language: "java",
  status: "ACCEPTED",
  runtime: 45,
  submittedAt: "2025-11-04T10:30:00"
}

User.solvedProblems: Set["prob456", "prob789", ...]
```

---

## External Platform Integration

### ⚠️ **Current Limitation**

**CPAssist CANNOT automatically detect when you solve problems on LeetCode, Codeforces, or CodeChef.**

This is because:
- ❌ LeetCode has no official public API
- ❌ Codeforces/CodeChef APIs are limited
- ❌ OAuth integration not available
- ❌ No way to track external submissions automatically

### 🔄 **Manual Sync Feature** (New!)

We've added a **"Sync with Platforms"** feature in your profile preferences:

**How to Use:**
1. Go to Profile → Preferences
2. Scroll to "Sync with Platforms" section
3. Enter your LeetCode username
4. Click "Sync LeetCode"
5. The system will import your solved problems

**Limitations:**
- ⚠️ Uses unofficial LeetCode API (may break)
- ⚠️ Only works if problems exist in our database
- ⚠️ Can't retrieve your actual code submissions
- ⚠️ Creates placeholder "synced" submissions
- ⚠️ May be rate-limited by LeetCode

---

## 🚀 Recommended Solutions

### **Option 1: Browser Extension** (Coming Soon)

We're developing a browser extension that will:

```javascript
// How it will work:
1. You solve a problem on LeetCode
2. Extension detects submission
3. Extracts problem details and your code
4. Automatically sends to CPAssist backend
5. Progress updated in real-time!
```

**Features:**
- ✅ Real-time automatic tracking
- ✅ Captures your actual code
- ✅ Works on LeetCode, Codeforces, CodeChef
- ✅ No manual sync needed
- ✅ Privacy-focused (only sends to your account)

### **Option 2: API Integration** (If Available)

If platforms provide official APIs in the future:

```java
// OAuth flow:
1. User authorizes CPAssist
2. CPAssist gets access token
3. Fetches submissions via official API
4. Syncs automatically every hour
```

### **Option 3: Hybrid Approach** (Best Practice)

**Use CPAssist as your primary platform:**
1. Solve problems directly in CPAssist
2. Get automatic tracking with no setup
3. Access all features (notes, code history, analytics)
4. Optionally use manual sync for external problems

---

## 📱 Progress Tracking Features

### **What You Can Track:**

#### **Profile Page:**
- Total problems solved
- Current streak (consecutive days)
- Longest streak achieved
- Last solved date
- Rank based on problems solved
- 8 achievement badges with progress

#### **Progress Tracker Page:**
- Overall progress (all problems)
- Progress by difficulty (Easy/Medium/Hard)
- Progress by topic (Arrays, DP, Graphs, etc.)
- Platform statistics (LeetCode, Codeforces, CodeChef)
- Recent activity with submission details
- Streak calendar (last 15 days)
- Milestone tracking (Beginner → Expert)

#### **Questions Page:**
- Filter by topic/difficulty/platform
- See which problems you've solved (✓ checkmark)
- Track attempted problems
- Bookmark problems
- Search functionality

### **How Progress is Calculated:**

```typescript
// Example calculations:

// 1. Problems Solved
totalSolved = user.solvedProblems.length;

// 2. Difficulty Breakdown
easySolved = solvedProblems.filter(id => 
  problems.find(p => p.id === id && p.difficulty === 'EASY')
).length;

// 3. Topic Progress
topicSolved = solvedProblems.filter(id => 
  problems.find(p => p.id === id && p.topicId === topicId)
).length;

// 4. Streak Calculation
if (lastSolvedDate === today) currentStreak++;
else if (lastSolvedDate !== yesterday) currentStreak = 0;

// 5. Rank
rank = calculateRank(totalSolved);
// 0-10: Newbie, 11-50: Beginner, 51-100: Intermediate, etc.
```

---

## 🎯 Best Practices

### **For Maximum Progress Tracking:**

1. **Use CPAssist as Primary Platform**
   - Solve problems directly in the app
   - Get instant tracking with no setup
   - Build a complete code history

2. **Regular Manual Sync (Optional)**
   - If you solve on LeetCode, sync weekly
   - Keeps your stats up-to-date
   - Better than no tracking at all

3. **Install Browser Extension (When Available)**
   - Automatic tracking everywhere
   - Never miss a solved problem
   - Seamless experience

4. **Update Platform Stats**
   - Go to Profile → Preferences
   - Manually update your LeetCode/Codeforces stats
   - Displays on your profile

---

## 🔮 Future Roadmap

### **Phase 1: Browser Extension** (Q1 2026)
- Chrome extension for LeetCode
- Firefox support
- Automatic submission detection
- Real-time sync

### **Phase 2: Mobile App** (Q2 2026)
- iOS/Android apps
- Mobile code editor
- Push notifications for streaks
- Offline problem solving

### **Phase 3: Advanced Analytics** (Q3 2026)
- Time complexity analysis
- Code quality scoring
- Comparison with peers
- AI-powered insights

### **Phase 4: Social Features** (Q4 2026)
- Follow other coders
- Share solutions
- Leaderboards
- Coding challenges

---

## 📚 API Endpoints

### **For Developers:**

```bash
# Submit a solution
POST /api/submissions
{
  "problemId": "prob123",
  "code": "class Solution {...}",
  "language": "java",
  "status": "ACCEPTED"
}

# Sync with LeetCode
POST /api/sync/leetcode
{
  "leetcodeUsername": "your_username"
}

# Get user progress
GET /api/progress

# Get submissions
GET /api/submissions/user?page=0&size=20

# Mark problem as solved
POST /api/users/problems/{problemId}/solve
```

---

## ❓ FAQs

**Q: Will CPAssist know when I solve a LeetCode problem?**
A: Not automatically. You need to either:
- Solve it directly in CPAssist, OR
- Use manual sync feature, OR
- Wait for our browser extension

**Q: Can I import my existing LeetCode history?**
A: Yes! Use the "Sync with Platforms" feature in Profile → Preferences

**Q: Does syncing copy my code from LeetCode?**
A: No. LeetCode doesn't expose your code through their API. Synced submissions will have placeholder notes.

**Q: How often should I manually sync?**
A: Weekly is fine if you solve problems externally. Or just use CPAssist directly!

**Q: Will the browser extension steal my data?**
A: No! It's open-source (coming soon) and only sends data to YOUR CPAssist account.

**Q: Can I use CPAssist offline?**
A: Currently no. We're working on offline mode for the mobile app.

---

## 🛠️ Technical Architecture

```
┌─────────────────┐
│  User Solves    │
│   Problem       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CPAssist       │
│  Frontend       │◄──────┐
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│  Spring Boot    │       │
│  Backend API    │       │
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│   MongoDB       │       │
│  - Users        │       │
│  - Problems     │       │
│  - Submissions  │       │
│  - Progress     │       │
└─────────────────┘       │
                          │
                          │
         ┌────────────────┘
         │
┌─────────────────┐
│  Browser Ext    │
│  (Future)       │
│                 │
│  Detects:       │
│  - LeetCode     │
│  - Codeforces   │
│  - CodeChef     │
└─────────────────┘
```

---

## 📞 Support

For questions or feature requests:
- Create an issue on GitHub
- Email: support@cpassist.com
- Discord: (coming soon)

---

## 🎉 Summary

**TL;DR:**
- ✅ CPAssist tracks problems solved **directly in the app**
- ⚠️ **Cannot** automatically detect external platform submissions
- 🔄 Manual sync feature available (limited)
- 🚀 Browser extension coming soon for automatic tracking
- 💡 Best approach: Use CPAssist as your primary platform

**The Goal:** Make CPAssist your one-stop shop for coding practice, with all your progress tracked automatically! 🎯
