// Types for API responses

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  username: string;
  profilePicture: string;
  joinDate: string;
  currentStreak: number;
  longestStreak: number;
  rank: string;
}

export interface UserActivity {
  activity: ActivityDay[];
  stats: ActivityStats;
  streak: {
    current: number;
    longest: number;
  };
}

export interface ActivityDay {
  date: string;
  problems_solved: number;
  problems_attempted: number;
  active_minutes: number;
}

export interface ActivityStats {
  total_solved: number;
  total_attempted: number;
  total_minutes: number;
  avg_daily_solved: number;
  max_daily_solved: number;
}

export interface Badge {
  badge_id: number;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  earned: boolean;
  earned_date: string | null;
}

export interface UserPreferences {
  user_id: number;
  theme: string;
  email_notifications: boolean;
  daily_reminders: boolean;
  achievement_notifications: boolean;
  preferred_language: string;
  default_problem_view: string;
}
