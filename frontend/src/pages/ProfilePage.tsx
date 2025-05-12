import { useState } from 'react';

// Mock user data
const mockUser = {
  name: "John Doe",
  username: "johndoe",
  email: "john.doe@example.com",
  joinDate: "January 15, 2025",
  problemsSolved: 125,
  rank: "Intermediate",
  badges: [
    { id: 1, name: "First Solve", description: "Solved your first problem" },
    { id: 2, name: "10 Easy Problems", description: "Solved 10 easy problems" },
    { id: 3, name: "5 Medium Problems", description: "Solved 5 medium problems" },
    { id: 4, name: "Arrays Master", description: "Solved 20 array problems" }
  ],
  streaks: {
    current: 7,
    longest: 15,
    lastActive: "May 12, 2025"
  }
};

function ProfilePage() {
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'badges'>('profile');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="border-2 border-border rounded-base overflow-hidden">
            <div className="bg-main text-main-foreground p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-background border-2 border-border rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden mb-2">
                  {mockUser.name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-border"></div>
              </div>
              <h2 className="text-xl font-bold">{mockUser.name}</h2>
              <p className="text-sm">@{mockUser.username}</p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-2 border-2 border-border rounded-base">
                  <div className="text-xl font-bold">{mockUser.problemsSolved}</div>
                  <div className="text-xs">Problems</div>
                </div>
                <div className="text-center p-2 border-2 border-border rounded-base">
                  <div className="text-xl font-bold">{mockUser.streaks.current}</div>
                  <div className="text-xs">Day Streak</div>
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
              </nav>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {activeSection === 'profile' && (
            <div className="border-2 border-border rounded-base p-6">
              <h2 className="text-2xl font-bold mb-6">Profile Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-foreground/70">Name</div>
                      <div>{mockUser.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Username</div>
                      <div>@{mockUser.username}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Email</div>
                      <div>{mockUser.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Member Since</div>
                      <div>{mockUser.joinDate}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Stats</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-foreground/70">Problems Solved</div>
                      <div>{mockUser.problemsSolved}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Current Rank</div>
                      <div>{mockUser.rank}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Current Streak</div>
                      <div>{mockUser.streaks.current} days</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Longest Streak</div>
                      <div>{mockUser.streaks.longest} days</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="bg-background p-4 rounded-base text-center">
                  <p>You've been active for {mockUser.streaks.current} days in a row!</p>
                  <p className="text-sm text-foreground/70">Last active: {mockUser.streaks.lastActive}</p>
                </div>
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
              <h2 className="text-2xl font-bold mb-6">Badges & Achievements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockUser.badges.map(badge => (
                  <div key={badge.id} className="border-2 border-border rounded-base p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-main text-main-foreground rounded-full flex items-center justify-center text-xl font-bold">
                      {badge.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{badge.name}</h3>
                      <p className="text-sm text-foreground/70">{badge.description}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-2 border-border rounded-base p-4 flex items-center gap-4 opacity-50">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">
                    ?
                  </div>
                  <div>
                    <h3 className="font-semibold">Hard Problem</h3>
                    <p className="text-sm text-foreground/70">Solve your first hard problem</p>
                  </div>
                </div>
                
                <div className="border-2 border-border rounded-base p-4 flex items-center gap-4 opacity-50">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">
                    ?
                  </div>
                  <div>
                    <h3 className="font-semibold">30-Day Streak</h3>
                    <p className="text-sm text-foreground/70">Maintain a 30-day solving streak</p>
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
