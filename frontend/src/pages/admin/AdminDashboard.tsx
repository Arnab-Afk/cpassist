import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, adminAPI } from '../../lib/apiClient';

interface DashboardStats {
  totalUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  totalTopics: number;
  activeUsers: number;
  recentSignups: number;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    totalTopics: 0,
    activeUsers: 0,
    recentSignups: 0,
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser.username || !currentUser.accessToken) {
      navigate('/login');
      return;
    }

    // TODO: Check if user has admin role
    // For now, we'll just load the page

    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats({
        totalUsers: data.totalUsers || 0,
        totalProblems: data.totalProblems || 0,
        totalSubmissions: data.totalSubmissions || 0,
        totalTopics: data.totalTopics || 0,
        activeUsers: data.activeUsers || 0,
        recentSignups: data.recentSignups || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setLoading(false);
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalProblems: 0,
        totalSubmissions: 0,
        totalTopics: 0,
        activeUsers: 0,
        recentSignups: 0,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-foreground/70">Manage and monitor the CP Assist platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
          change="+12%"
        />
        <StatCard
          title="Total Problems"
          value={stats.totalProblems}
          icon="📝"
          color="green"
          change="+8"
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon="🚀"
          color="purple"
          change="+450"
        />
        <StatCard
          title="Topics"
          value={stats.totalTopics}
          icon="📚"
          color="orange"
        />
        <StatCard
          title="Active Users (7d)"
          value={stats.activeUsers}
          icon="⚡"
          color="cyan"
          change="+5%"
        />
        <StatCard
          title="New Signups (30d)"
          value={stats.recentSignups}
          icon="✨"
          color="pink"
          change="+15"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickAction
          title="Manage Users"
          description="View and manage user accounts"
          icon="👤"
          link="/admin/users"
          color="from-blue-500/10 to-blue-500/5"
          borderColor="border-blue-500"
        />
        <QuickAction
          title="Manage Problems"
          description="Add, edit, or delete problems"
          icon="📝"
          link="/admin/problems"
          color="from-green-500/10 to-green-500/5"
          borderColor="border-green-500"
        />
        <QuickAction
          title="Manage Topics"
          description="Organize problem categories"
          icon="📚"
          link="/admin/topics"
          color="from-purple-500/10 to-purple-500/5"
          borderColor="border-purple-500"
        />
        <QuickAction
          title="View Submissions"
          description="Monitor all submissions"
          icon="📊"
          link="/admin/submissions"
          color="from-orange-500/10 to-orange-500/5"
          borderColor="border-orange-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="border-2 border-border rounded-base p-6 shadow-[var(--shadow)]">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>📈</span>
          Recent Activity
        </h2>
        <div className="space-y-3">
          <ActivityItem
            type="user"
            message="New user registered: john_doe"
            time="5 minutes ago"
          />
          <ActivityItem
            type="problem"
            message="Problem 'Two Sum' was updated"
            time="15 minutes ago"
          />
          <ActivityItem
            type="submission"
            message="250+ submissions received in the last hour"
            time="1 hour ago"
          />
          <ActivityItem
            type="topic"
            message="New topic 'Dynamic Programming' added"
            time="2 hours ago"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: string;
}

function StatCard({ title, value, icon, color, change }: StatCardProps) {
  const colorMap: { [key: string]: string } = {
    blue: 'from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400',
    green: 'from-green-500/10 to-green-500/5 text-green-600 dark:text-green-400',
    purple: 'from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400',
    orange: 'from-orange-500/10 to-orange-500/5 text-orange-600 dark:text-orange-400',
    cyan: 'from-cyan-500/10 to-cyan-500/5 text-cyan-600 dark:text-cyan-400',
    pink: 'from-pink-500/10 to-pink-500/5 text-pink-600 dark:text-pink-400',
  };

  return (
    <div className={`border-2 border-border rounded-base p-6 bg-gradient-to-br ${colorMap[color]} shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground/70">{title}</span>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className={`text-4xl font-bold ${color !== 'blue' ? colorMap[color].split(' ')[2] : 'text-blue-600 dark:text-blue-400'}`}>
        {value.toLocaleString()}
      </div>
      {change && (
        <div className="text-sm text-foreground/60 mt-1 flex items-center gap-1">
          <span>{change.startsWith('+') ? '↗️' : '↘️'}</span>
          <span>{change} from last month</span>
        </div>
      )}
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
  borderColor: string;
}

function QuickAction({ title, description, icon, link, color, borderColor }: QuickActionProps) {
  return (
    <Link
      to={link}
      className={`border-2 ${borderColor} rounded-base p-5 bg-gradient-to-br ${color} hover:translate-y-[-2px] transition-transform shadow-[var(--shadow)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-foreground/70">{description}</p>
    </Link>
  );
}

interface ActivityItemProps {
  type: 'user' | 'problem' | 'submission' | 'topic';
  message: string;
  time: string;
}

function ActivityItem({ type, message, time }: ActivityItemProps) {
  const iconMap = {
    user: '👤',
    problem: '📝',
    submission: '🚀',
    topic: '📚',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-base bg-background/50 border border-border">
      <div className="text-2xl">{iconMap[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs text-foreground/60">{time}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;
