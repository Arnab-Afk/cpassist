import { useState, useEffect } from 'react';
import UserProfile from '@/components/UserProfile';
import { PageLoader } from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/AuthContext';
import { getWithAuth, postWithAuth } from '@/lib/api';
import type { UserActivity, Badge, UserPreferences } from '@/lib/types';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Update this type to match backend response
interface BadgesResponse {
  badges: Badge[];
  counts: { requirement_type: string; count: number }[];
}

function ProfilePage() {
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'badges'>('profile');
  const { user, isLoading: isAuthLoading, token } = useAuth();
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user data from the backend
  useEffect(() => {
    if (!user || !token) return;
    
    const fetchUserData = async () => {
      setIsDataLoading(true);
      setError(null);
      
      try {
        // Fetch data based on active section to minimize requests
        if (activeSection === 'profile') {
          const activity = await getWithAuth<UserActivity>(
            'https://cpbackend.arnabbhowmik019.workers.dev/activity',
            token
          );
          setUserActivity(activity);
        } 
        
        if (activeSection === 'badges') {
          // Update to handle the correct response structure
          const badgesResponse = await getWithAuth<BadgesResponse>(
            'https://cpbackend.arnabbhowmik019.workers.dev/badges/user',
            token
          );
          // Extract the badges array from the response
          setUserBadges(badgesResponse.badges);
        }
        
        if (activeSection === 'preferences') {
          const preferences = await getWithAuth<UserPreferences>(
            'https://cpbackend.arnabbhowmik019.workers.dev/preferences',
            token
          );
          setUserPreferences(preferences);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your profile data. Please try again.');
      } finally {
        setIsDataLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, token, activeSection]);

  // Show loading state
  if (isAuthLoading || isDataLoading) {
    return <PageLoader message="Loading profile..." />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <p className="text-xl mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-main text-main-foreground rounded-base"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Handle no user data
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl">User profile not available. Please log in again.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8">
        {/* User profile at the top */}
        <UserProfile />
        
        {/* Navigation tabs */}
        <div className="border-2 border-border rounded-base overflow-hidden">
          <div className="flex border-b-2 border-border">
            <button
              className={`flex-1 py-3 px-4 text-center ${activeSection === 'profile' ? 'bg-main text-main-foreground' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => {
                setActiveSection('profile');
                setError(null);
                setSuccessMessage(null);
              }}
            >
              Activity
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeSection === 'preferences' ? 'bg-main text-main-foreground' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => {
                setActiveSection('preferences');
                setError(null);
                setSuccessMessage(null);
              }}
            >
              Preferences
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${activeSection === 'badges' ? 'bg-main text-main-foreground' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => {
                setActiveSection('badges');
                setError(null);
                setSuccessMessage(null);
              }}
            >
              Badges & Achievements
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Recent Activity</h2>
                
                {!userActivity ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Loading your activity data...</p>
                  </div>
                ) : userActivity.activity.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">You don't have any activity recorded yet. Start solving problems to track your progress!</p>
                  </div>
                ) : (
                  <>
                    {/* Activity statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Problems Solved</h3>
                        <p className="text-2xl font-bold">{userActivity.stats.total_solved}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Daily Solved</h3>
                        <p className="text-2xl font-bold">{userActivity.stats.avg_daily_solved.toFixed(1)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Time Spent</h3>
                        <p className="text-2xl font-bold">{Math.floor(userActivity.stats.total_minutes / 60)} hrs {userActivity.stats.total_minutes % 60} mins</p>
                      </div>
                    </div>
                    
                    {/* Recent activity list */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Your Recent Activity</h3>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-border">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Problems Solved</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Problems Attempted</th>
                              <th className="px-4 py-3 text-left text-sm font-medium">Time Spent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {userActivity.activity.slice(0, 7).map((day) => (
                              <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-4 py-3 text-sm">{new Date(day.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-sm">{day.problems_solved}</td>
                                <td className="px-4 py-3 text-sm">{day.problems_attempted}</td>
                                <td className="px-4 py-3 text-sm">{day.active_minutes} mins</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">User Preferences</h2>
                
                {!userPreferences ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Loading your preferences...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center p-4 border border-border rounded-md">
                      <div>
                        <h3 className="font-medium">Theme</h3>
                        <p className="text-sm text-muted-foreground">Choose your preferred application theme</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className={`px-3 py-1 rounded-md ${userPreferences.theme === 'light' ? 'bg-main text-main-foreground' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => {
                            setUserPreferences({
                              ...userPreferences,
                              theme: 'light'
                            });
                          }}
                        >
                          Light
                        </button>
                        <button 
                          className={`px-3 py-1 rounded-md ${userPreferences.theme === 'dark' ? 'bg-main text-main-foreground' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => {
                            setUserPreferences({
                              ...userPreferences,
                              theme: 'dark'
                            });
                          }}
                        >
                          Dark
                        </button>
                        <button 
                          className={`px-3 py-1 rounded-md ${userPreferences.theme === 'system' ? 'bg-main text-main-foreground' : 'bg-gray-100 dark:bg-gray-700'}`}
                          onClick={() => {
                            setUserPreferences({
                              ...userPreferences,
                              theme: 'system'
                            });
                          }}
                        >
                          System
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-border rounded-md">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">Receive email notifications for updates</p>
                      </div>
                      <div>
                        <div 
                          className={`w-12 h-6 ${userPreferences.email_notifications ? 'bg-green-500' : 'bg-gray-200'} rounded-full relative cursor-pointer`}
                          onClick={() => {
                            setUserPreferences({
                              ...userPreferences,
                              email_notifications: !userPreferences.email_notifications
                            });
                          }}
                        >
                          <div 
                            className={`absolute w-5 h-5 bg-white rounded-full top-0.5 shadow transition ${userPreferences.email_notifications ? 'left-7' : 'left-0.5'}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-border rounded-md">
                      <div>
                        <h3 className="font-medium">Daily Reminders</h3>
                        <p className="text-sm text-muted-foreground">Get reminders to maintain your streak</p>
                      </div>
                      <div>
                        <div 
                          className={`w-12 h-6 ${userPreferences.daily_reminders ? 'bg-green-500' : 'bg-gray-200'} rounded-full relative cursor-pointer`}
                          onClick={() => {
                            setUserPreferences({
                              ...userPreferences,
                              daily_reminders: !userPreferences.daily_reminders
                            });
                          }}
                        >
                          <div 
                            className={`absolute w-5 h-5 bg-white rounded-full top-0.5 shadow transition ${userPreferences.daily_reminders ? 'left-7' : 'left-0.5'}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-border rounded-md">
                      <div>
                        <h3 className="font-medium">Preferred Language</h3>
                        <p className="text-sm text-muted-foreground">Select your preferred programming language</p>
                      </div>
                      <div>
                        <select 
                          className="px-3 py-2 rounded-md border border-border bg-white dark:bg-gray-700 transition-all hover:border-main focus:outline-none focus:ring-2 focus:ring-main focus:ring-opacity-50"
                          value={userPreferences.preferred_language || 'JavaScript'}
                          onChange={(e) => {
                            setUserPreferences({
                              ...userPreferences,
                              preferred_language: e.target.value
                            });
                          }}
                        >
                          <option value="JavaScript">JavaScript</option>
                          <option value="Python">Python</option>
                          <option value="Java">Java</option>
                          <option value="C++">C++</option>
                          <option value="Go">Go</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button 
                        className="px-4 py-2 bg-main text-main-foreground rounded-md"
                        onClick={async () => {
                          if (!token) return;
                          
                          try {
                            setIsDataLoading(true);
                            const updatedPreferences = await postWithAuth<UserPreferences>(
                              'https://cpbackend.arnabbhowmik019.workers.dev/preferences',
                              userPreferences,
                              token
                            );
                            // Update the state with the response from the server
                            setUserPreferences(updatedPreferences);
                            // Show success feedback
                            setError(null);
                            setSuccessMessage('Preferences saved successfully!');
                            // Clear success message after 3 seconds
                            setTimeout(() => {
                              setSuccessMessage(null);
                            }, 3000);
                          } catch (err) {
                            console.error('Error saving preferences:', err);
                            setError('Failed to save preferences. Please try again.');
                          } finally {
                            setIsDataLoading(false);
                          }
                        }}
                      >
                        Save Preferences
                      </button>
                      
                      {/* Success message */}
                      {successMessage && (
                        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
                          <CheckCircle className="mr-2" size={18} />
                          {successMessage}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeSection === 'badges' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Badges & Achievements</h2>
                
                {!userBadges ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Loading your badges...</p>
                  </div>
                ) : userBadges.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">You haven't earned any badges yet. Keep solving problems to unlock badges!</p>
                    
                    {/* Default badges that can be earned */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      <div className="border border-border rounded-md p-4 text-center bg-gray-50 dark:bg-gray-800 opacity-70">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <span className="text-lg">🏆</span>
                        </div>
                        <h3 className="font-medium">First Solve</h3>
                        <p className="text-xs text-muted-foreground mt-1">Solve your first problem to earn this badge</p>
                      </div>
                      
                      <div className="border border-border rounded-md p-4 text-center bg-gray-50 dark:bg-gray-800 opacity-70">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <span className="text-lg">🔥</span>
                        </div>
                        <h3 className="font-medium">7-Day Streak</h3>
                        <p className="text-xs text-muted-foreground mt-1">Practice for 7 consecutive days</p>
                      </div>
                      
                      <div className="border border-border rounded-md p-4 text-center bg-gray-50 dark:bg-gray-800 opacity-70">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <span className="text-lg">🌟</span>
                        </div>
                        <h3 className="font-medium">10 Easy Problems</h3>
                        <p className="text-xs text-muted-foreground mt-1">Solve 10 easy problems</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {userBadges.map((badge) => (
                      <div 
                        key={badge.badge_id} 
                        className="border border-border rounded-md p-4 text-center bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <span className="text-lg">{badge.icon || '🏆'}</span>
                        </div>
                        <h3 className="font-medium">{badge.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                        {badge.earned_date && (
                          <p className="text-xs text-primary mt-2">
                            Earned on {new Date(badge.earned_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
