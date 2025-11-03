import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, authAPI, userAPI } from '../lib/apiClient';

// Badge definitions
const BADGE_DEFINITIONS: { [key: string]: { id: string; name: string; icon: string; description: string; requirement: number } } = {
  first_solve: { id: 'first_solve', name: "First Solve", icon: "🎯", description: "Solved your first problem", requirement: 1 },
  easy_10: { id: 'easy_10', name: "10 Easy Problems", icon: "⭐", description: "Solved 10 easy problems", requirement: 10 },
  medium_5: { id: 'medium_5', name: "5 Medium Problems", icon: "🔥", description: "Solved 5 medium problems", requirement: 5 },
  arrays_master: { id: 'arrays_master', name: "Arrays Master", icon: "🏆", description: "Solved 20 array problems", requirement: 20 }
};

// Calculate rank based on problems solved
const calculateRank = (problemsSolved: number): string => {
  if (problemsSolved === 0) return "Beginner";
  if (problemsSolved < 10) return "Novice";
  if (problemsSolved < 50) return "Intermediate";
  if (problemsSolved < 100) return "Advanced";
  if (problemsSolved < 200) return "Expert";
  return "Master";
};

function ProfilePage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'badges'>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check if user is authenticated
        const currentUser = getCurrentUser();
        if (!currentUser.username || !currentUser.accessToken) {
          navigate('/login');
          return;
        }

        // Fetch real user data from API
        const userData = await userAPI.getProfile();
        
        // Calculate derived stats
        const problemsSolved = userData.solvedProblems?.length || 0;
        const rank = calculateRank(problemsSolved);
        const currentStreak = userData.profile?.currentStreak || 0;
        const longestStreak = userData.profile?.longestStreak || 0;
        
        // Format join date
        const joinDate = userData.createdAt 
          ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          : 'Recently';

        // Format last active date
        const lastActive = userData.profile?.lastSolvedDate
          ? new Date(userData.profile.lastSolvedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : 'Never';
        
        setUser({
          ...userData,
          problemsSolved,
          rank,
          joinDate,
          lastActive,
          displayName: userData.fullName || userData.username,
          currentStreak,
          longestStreak
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch user profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      // Even if API call fails, clear local storage and redirect
      localStorage.clear();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mb-4"></div>
          <p className="text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-lg text-red-600 dark:text-red-400 mb-4">{error || 'Failed to load profile'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-main text-main-foreground rounded-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="border-2 border-border rounded-base overflow-hidden">
            <div className="bg-main text-main-foreground p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-background border-2 border-border rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden mb-2">
                  {user.displayName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-border"></div>
              </div>
              <h2 className="text-xl font-bold">{user.displayName || user.username}</h2>
              <p className="text-sm">@{user.username}</p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-3 border-2 border-border rounded-base bg-gradient-to-br from-main/10 to-main/5 hover:translate-y-[-2px] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                  <div className="text-2xl font-bold text-main">{user.problemsSolved}</div>
                  <div className="text-xs font-medium">Problems</div>
                </div>
                <div className="text-center p-3 border-2 border-border rounded-base bg-gradient-to-br from-orange-500/10 to-orange-500/5 hover:translate-y-[-2px] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">🔥 {user.currentStreak}</div>
                  <div className="text-xs font-medium">Day Streak</div>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveSection('profile')}
                  className={`w-full text-left px-3 py-2 rounded-base ${activeSection === 'profile' ? 'bg-main text-main-foreground' : ''}`}
                >
                  Profile Overview
                </button>
                <button 
                  onClick={() => setActiveSection('preferences')}
                  className={`w-full text-left px-3 py-2 rounded-base ${activeSection === 'preferences' ? 'bg-main text-main-foreground' : ''}`}
                >
                  Preferences
                </button>
                <button 
                  onClick={() => setActiveSection('badges')}
                  className={`w-full text-left px-3 py-2 rounded-base ${activeSection === 'badges' ? 'bg-main text-main-foreground' : ''}`}
                >
                  Badges & Achievements
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-transparent hover:border-red-500"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {activeSection === 'profile' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-border rounded-base p-6 bg-gradient-to-br from-main/10 to-main/5 shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground/70">Problems Solved</span>
                    <svg className="w-8 h-8 text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-main">{user.problemsSolved}</div>
                  <div className="text-sm text-foreground/60 mt-1">
                    {user.problemsSolved === 0 ? "Start solving! 🚀" : "Keep it up! 🎯"}
                  </div>
                </div>

                <div className="border-2 border-border rounded-base p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground/70">Current Streak</span>
                    <span className="text-3xl">🔥</span>
                  </div>
                  <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{user.currentStreak} days</div>
                  <div className="text-sm text-foreground/60 mt-1">Best: {user.longestStreak} days</div>
                </div>

                <div className="border-2 border-border rounded-base p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground/70">Rank</span>
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{user.rank}</div>
                  <div className="text-sm text-foreground/60 mt-1">
                    {user.problemsSolved < 10 ? "Keep going! 🚀" : "Level up soon! 🚀"}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="border-2 border-border rounded-base p-6 shadow-[var(--shadow)]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-base bg-background/50">
                    <svg className="w-5 h-5 text-main mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-foreground/70">Name</div>
                      <div className="font-semibold">{user.displayName || user.username}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-base bg-background/50">
                    <svg className="w-5 h-5 text-main mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-foreground/70">Username</div>
                      <div className="font-semibold">@{user.username}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-base bg-background/50">
                    <svg className="w-5 h-5 text-main mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-foreground/70">Email</div>
                      <div className="font-semibold">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-base bg-background/50">
                    <svg className="w-5 h-5 text-main mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-foreground/70">Member Since</div>
                      <div className="font-semibold">{user.joinDate}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="border-2 border-border rounded-base p-6 shadow-[var(--shadow)]">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Recent Activity
                </h3>
                {user.currentStreak > 0 ? (
                  <div className="bg-gradient-to-r from-main/10 via-orange-500/10 to-purple-500/10 p-6 rounded-base text-center border-2 border-border">
                    <div className="text-4xl mb-2">🔥</div>
                    <p className="text-lg font-semibold mb-1">You're on fire!</p>
                    <p className="text-foreground/70">You've been active for <span className="font-bold text-main">{user.currentStreak} days</span> in a row!</p>
                    <p className="text-sm text-foreground/60 mt-2">Last active: {user.lastActive}</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-500/10 to-gray-500/5 p-6 rounded-base text-center border-2 border-dashed border-border">
                    <div className="text-4xl mb-2">📚</div>
                    <p className="text-lg font-semibold mb-1">Ready to start?</p>
                    <p className="text-foreground/70">Solve your first problem to begin your streak!</p>
                    <button 
                      onClick={() => navigate('/problems')}
                      className="mt-4 px-4 py-2 bg-main text-main-foreground rounded-base hover:translate-y-[-2px] transition-transform"
                    >
                      Browse Problems
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeSection === 'preferences' && (
            <div className="border-2 border-border rounded-base p-6">
              <h2 className="text-2xl font-bold mb-6">Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Theme</h3>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border-2 border-border rounded-base bg-main text-main-foreground">Light</button>
                    <button className="px-4 py-2 border-2 border-border rounded-base">Dark</button>
                    <button className="px-4 py-2 border-2 border-border rounded-base">System</button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notification Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="email-notifs" className="mr-2" checked readOnly />
                      <label htmlFor="email-notifs">Email Notifications</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="daily-reminder" className="mr-2" checked readOnly />
                      <label htmlFor="daily-reminder">Daily Reminders</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="achievement-notifs" className="mr-2" checked readOnly />
                      <label htmlFor="achievement-notifs">Achievement Notifications</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Default Problem View</h3>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border-2 border-border rounded-base bg-main text-main-foreground">All Problems</button>
                    <button className="px-4 py-2 border-2 border-border rounded-base">Unsolved Only</button>
                    <button className="px-4 py-2 border-2 border-border rounded-base">Bookmarked</button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-right">
                <button className="px-4 py-2 bg-main text-main-foreground rounded-base">Save Preferences</button>
              </div>
            </div>
          )}
          
          {activeSection === 'badges' && (
            <div className="border-2 border-border rounded-base p-6">
              <h2 className="text-2xl font-bold mb-2">Badges & Achievements</h2>
              <p className="text-foreground/70 mb-6">Collect badges by solving problems and reaching milestones!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earned Badges */}
                {user.profile?.badges && user.profile.badges.size > 0 ? (
                  Array.from(user.profile.badges as Set<string>).map((badgeId) => {
                    const badgeDef = BADGE_DEFINITIONS[badgeId];
                    if (!badgeDef) return null;
                    
                    return (
                      <div key={badgeId} className="border-2 border-border rounded-base p-4 flex items-center gap-4 bg-gradient-to-br from-main/5 to-transparent hover:translate-y-[-2px] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                        <div className="w-16 h-16 bg-gradient-to-br from-main to-main/80 text-white rounded-full flex items-center justify-center text-3xl shadow-lg">
                          {badgeDef.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{badgeDef.name}</h3>
                          <p className="text-sm text-foreground/70">{badgeDef.description}</p>
                        </div>
                        <div className="text-green-600 dark:text-green-400">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 border-2 border-dashed border-border rounded-base p-8 text-center opacity-60">
                    <div className="text-5xl mb-3">🏆</div>
                    <p className="text-lg font-semibold text-foreground/70">No badges earned yet</p>
                    <p className="text-sm text-foreground/50 mt-2">Start solving problems to earn your first badge!</p>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-border rounded-base p-4 flex items-center gap-4 opacity-60 hover:opacity-80 transition-opacity">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl">
                    <span className="opacity-50">🎯</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground/70">Hard Problem</h3>
                    <p className="text-sm text-foreground/50">Solve your first hard problem</p>
                    <div className="mt-1 text-xs font-medium text-main">🔒 Locked</div>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-base p-4 flex items-center gap-4 opacity-60 hover:opacity-80 transition-opacity">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl">
                    <span className="opacity-50">🎊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground/70">30-Day Streak</h3>
                    <p className="text-sm text-foreground/50">Maintain a 30-day solving streak</p>
                    <div className="mt-1">
                      <div className="text-xs font-medium text-foreground/70 mb-1">Progress: 7/30 days</div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-main transition-all" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
