# Admin Panel

This folder contains all admin-related pages and functionality for the CP Assist platform.

## Pages

### 1. AdminDashboard (`AdminDashboard.tsx`)
**Route**: `/admin`

The main dashboard for administrators with:
- **Statistics Overview**:
  - Total Users, Problems, Submissions, Topics
  - Active Users (7 days)
  - New Signups (30 days)
- **Quick Actions**: Links to all admin management pages
- **Recent Activity Feed**: Real-time platform activity
- **Visual Stats Cards**: Color-coded statistics with icons

### 2. ManageUsers (`ManageUsers.tsx`)
**Route**: `/admin/users`

Complete user management interface:
- **User List**: Searchable and filterable table of all users
- **User Details Modal**: View full user information
- **Actions**:
  - Enable/Disable user accounts
  - Toggle user roles (USER, MODERATOR, ADMIN)
  - Delete users
  - View user statistics (problems solved, join date, etc.)
- **Filters**: Search by username/email, filter by role
- **Stats**: Total users, active users, admin count

### 3. ManageProblems (`ManageProblems.tsx`)
**Route**: `/admin/problems`

Problem management system:
- **Problem Grid**: Card-based view of all problems
- **Problem Editor Modal**: Create and edit problems with fields for:
  - Title, Difficulty, Topic
  - Description, Constraints, Examples
  - Tags, Companies
- **Actions**:
  - Create new problems
  - Edit existing problems
  - Delete problems
  - View problem details
- **Filters**: Search, difficulty, topic
- **Stats**: Total problems by difficulty level

### 4. ManageTopics (`ManageTopics.tsx`)
**Route**: `/admin/topics`

Topic/Category management:
- **Topic Cards**: Color-coded topic cards with icons
- **Topic Editor Modal**: Create and edit topics with:
  - Name, Description
  - Icon (emoji), Color theme
  - Problem count
- **Actions**:
  - Create new topics
  - Edit existing topics
  - Delete topics (with warning about reassigning problems)
- **Stats**: Total topics, total problems, average problems per topic

### 5. ViewSubmissions (`ViewSubmissions.tsx`)
**Route**: `/admin/submissions`

Submission monitoring dashboard:
- **Submissions Table**: Detailed view of all code submissions
- **Submission Details Modal**: View individual submission info
- **Information Displayed**:
  - User, Problem, Language
  - Status (Accepted, Wrong Answer, TLE, Runtime Error, etc.)
  - Execution time, Memory usage
  - Submission timestamp
- **Filters**: Search by user/problem, filter by status/language
- **Stats**: Total submissions, acceptance rate, error counts

## Features

### UI/UX Consistency
All admin pages follow the same design pattern as the rest of the application:
- **Neobrutalist Design**: Bold borders, shadows, vibrant colors
- **Responsive Layout**: Mobile-friendly grid layouts
- **Color Coding**: Semantic colors for different states and types
- **Loading States**: Animated spinners during data fetching
- **Empty States**: Helpful messages when no data is available
- **Modals**: Consistent modal design for detailed views and editing

### Common Features Across All Pages
1. **Back to Dashboard Button**: Easy navigation
2. **Search & Filter**: Find specific items quickly
3. **Statistics Cards**: Visual overview of key metrics
4. **Action Buttons**: Clear CTAs for primary actions
5. **Confirmation Dialogs**: Prevent accidental deletions
6. **Error Handling**: User-friendly error messages

### Security Notes
- **TODO**: Implement role-based access control
- **TODO**: Add authentication checks before rendering admin pages
- **TODO**: Add backend API endpoints for admin operations
- **TODO**: Implement audit logging for admin actions

## API Integration

The admin pages are designed to work with the following API endpoints (to be implemented on backend):

```typescript
// Users
GET    /admin/users                 // Get all users
PATCH  /admin/users/:id/toggle      // Enable/disable user
PATCH  /admin/users/:id/roles       // Update user roles
DELETE /admin/users/:id             // Delete user

// Problems
GET    /problems                    // Get all problems (already exists)
POST   /problems                    // Create problem (already exists)
PUT    /problems/:id                // Update problem (already exists)
DELETE /problems/:id                // Delete problem (already exists)

// Topics
GET    /topics                      // Get all topics (already exists)
POST   /admin/topics                // Create topic
PUT    /admin/topics/:id            // Update topic
DELETE /admin/topics/:id            // Delete topic

// Submissions
GET    /admin/submissions           // Get all submissions
GET    /admin/submissions/:id       // Get submission details

// Dashboard Stats
GET    /admin/stats                 // Get dashboard statistics
```

## Usage

To access the admin panel:

1. Navigate to `/admin` in your browser
2. The dashboard will display an overview of the platform
3. Use the quick action buttons or navigation to access specific management pages
4. Each page has search and filter capabilities for efficient management

## Development

### Adding New Admin Features

1. Create a new component in this folder
2. Export it in `index.ts`
3. Add the route in `App.tsx`
4. Update this README with the new feature

### Mock Data

Currently, all pages use mock data for development. To switch to real API:

1. Implement the backend endpoints
2. Replace mock data logic in each component's `fetch` functions
3. Handle errors appropriately
4. Test with real data

## Styling

All components use:
- **Tailwind CSS**: For utility classes
- **CSS Variables**: Defined in `index.css`
  - `--border`, `--main`, `--background`, etc.
- **Dark Mode Support**: Using `dark:` prefix
- **Custom Shadows**: `shadow-[var(--shadow)]`

## Future Enhancements

- [ ] Role-based access control
- [ ] Advanced analytics and charts
- [ ] Bulk operations (bulk delete, bulk edit)
- [ ] Export data to CSV/JSON
- [ ] Activity logs and audit trail
- [ ] Real-time notifications
- [ ] User suspension with reasons
- [ ] Problem version history
- [ ] Submission code viewer with syntax highlighting
- [ ] Performance metrics and platform health
- [ ] Email management for announcements
- [ ] Scheduled maintenance mode
