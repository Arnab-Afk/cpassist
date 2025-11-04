# Admin Panel - Quick Reference

## Access URLs

- **Dashboard**: http://localhost:5173/admin
- **Users**: http://localhost:5173/admin/users  
- **Problems**: http://localhost:5173/admin/problems
- **Topics**: http://localhost:5173/admin/topics
- **Submissions**: http://localhost:5173/admin/submissions

## Pages Overview

| Page | Route | Main Features |
|------|-------|---------------|
| **Dashboard** | `/admin` | Statistics overview, Quick actions, Activity feed |
| **Users** | `/admin/users` | User list, Search/Filter, Enable/Disable, Role management |
| **Problems** | `/admin/problems` | Problem grid, CRUD operations, Difficulty filtering |
| **Topics** | `/admin/topics` | Topic cards, Create/Edit/Delete, Color themes |
| **Submissions** | `/admin/submissions` | Submission table, Status monitoring, Performance metrics |

## Key Features by Page

### Dashboard
✅ 6 Statistics cards  
✅ 4 Quick action buttons  
✅ Recent activity feed  
✅ Color-coded metrics  

### Manage Users
✅ Searchable user table  
✅ Role badges (User, Moderator, Admin)  
✅ Enable/Disable accounts  
✅ Delete users  
✅ User details modal  
✅ Filter by role  

### Manage Problems
✅ Card grid layout  
✅ Create/Edit/Delete problems  
✅ Difficulty levels (Easy, Medium, Hard)  
✅ Topic assignment  
✅ Tags support  
✅ Rich problem editor  

### Manage Topics
✅ Colorful topic cards  
✅ Emoji icons  
✅ 6 color themes  
✅ Create/Edit/Delete topics  
✅ Problem count tracking  

### View Submissions
✅ Submission monitoring  
✅ Status tracking (5 types)  
✅ Performance metrics  
✅ Language filtering  
✅ Detailed submission view  

## API Endpoints Required

```typescript
// Already Implemented (Problems)
GET    /problems
POST   /problems
PUT    /problems/:id
DELETE /problems/:id
GET    /topics

// Need to Implement
GET    /admin/users
PATCH  /admin/users/:id/toggle
PATCH  /admin/users/:id/roles
DELETE /admin/users/:id

POST   /admin/topics
PUT    /admin/topics/:id
DELETE /admin/topics/:id

GET    /admin/submissions
GET    /admin/submissions/:id

GET    /admin/stats
```

## Common UI Elements

**Statistics Card:**
- Border: 2px
- Gradient background
- Large number display (text-3xl)
- Color coded by type

**Modal:**
- Black overlay (50% opacity)
- Centered container
- Shadow effect (8px offset)
- Close button (X)

**Table:**
- Header: bg-main
- Alternating row colors
- Border: 2px solid
- Action buttons per row

**Buttons:**
- Primary: bg-main
- Secondary: border-2 border-border
- Danger: bg-red-500
- Warning: bg-yellow-500
- Success: bg-green-500

## Color Scheme

| Color | Usage |
|-------|-------|
| Blue | Users, General Info |
| Green | Success, Active, Accepted |
| Purple | Admin, Special |
| Orange | Warnings, TLE |
| Red | Errors, Critical, Delete |
| Yellow | Medium difficulty, Compilation errors |
| Cyan | Activity, Secondary |
| Pink | New items |

## Status Colors (Submissions)

| Status | Color |
|--------|-------|
| ACCEPTED | Green |
| WRONG_ANSWER | Red |
| TIME_LIMIT_EXCEEDED | Orange |
| RUNTIME_ERROR | Purple |
| COMPILATION_ERROR | Yellow |

## Development Notes

**Current State:**
- ✅ All 5 pages created
- ✅ Routes configured in App.tsx
- ✅ Navigation link added
- ✅ Mock data for testing
- ⚠️ Using mock data (no backend yet)

**Next Steps:**
1. Implement backend admin endpoints
2. Add authentication checks
3. Replace mock data with API calls
4. Add role-based access control
5. Add error handling
6. Add loading states
7. Test with real data

## Security Checklist

- [ ] Verify user has ROLE_ADMIN
- [ ] Protect admin routes
- [ ] Validate JWT tokens
- [ ] Add CSRF protection
- [ ] Implement rate limiting
- [ ] Add audit logging
- [ ] Sanitize inputs
- [ ] Prevent XSS attacks

## Testing URLs (Development)

Assuming frontend runs on `localhost:5173`:

```bash
# Dashboard
http://localhost:5173/admin

# User Management
http://localhost:5173/admin/users

# Problem Management  
http://localhost:5173/admin/problems

# Topic Management
http://localhost:5173/admin/topics

# Submissions
http://localhost:5173/admin/submissions
```

## Files Created

```
frontend/src/pages/admin/
├── AdminDashboard.tsx       (290 lines)
├── ManageUsers.tsx          (390 lines)
├── ManageProblems.tsx       (500 lines)
├── ManageTopics.tsx         (360 lines)
├── ViewSubmissions.tsx      (385 lines)
├── index.ts                 (5 lines)
└── README.md                (250 lines)

Total: ~2,200 lines of code
```

## Quick Commands

**Navigate to admin:**
```tsx
navigate('/admin')
```

**Check if user is admin (TODO):**
```tsx
const user = getCurrentUser();
const isAdmin = user.roles?.includes('ROLE_ADMIN');
```

**Fetch admin data:**
```tsx
const response = await apiClient.get('/admin/users');
```

## Design Patterns Used

1. **Container Pattern**: Main container with max-width
2. **Grid Layout**: Responsive columns
3. **Modal Pattern**: Overlay + centered content
4. **Card Pattern**: Border + shadow + hover effect
5. **Table Pattern**: Header + body with alternating rows
6. **Search & Filter**: Top bar with inputs
7. **Stats Cards**: Visual metrics display
8. **Empty State**: Message when no data
9. **Loading State**: Spinner during fetch
10. **Confirmation Dialog**: Before destructive actions

## Responsive Breakpoints

- `md:` - 768px and up (tablets)
- `lg:` - 1024px and up (desktops)
- Grid columns adjust: 1 → 2 → 3/4 based on screen size

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Dark mode support
- Mobile responsive
- Touch-friendly (large tap targets)

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0  
**Status**: ✅ Complete (Mock Data)
