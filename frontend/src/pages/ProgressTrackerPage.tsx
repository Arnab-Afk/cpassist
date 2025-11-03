import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProblemStatistics from '../components/ProblemStatistics';
import StreakCalendar from '../components/StreakCalendar';
import { userAPI } from '../lib/apiClient';
import apiClient from '../lib/apiClient';

// Import platform logos
import leetcodeLogo from '../assets/leetcode.png';
import codeforcesLogo from '../assets/codeforces.png';
import codechefLogo from '../assets/codechef.svg';

function ProgressTrackerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile data
        const profile = await userAPI.getProfile();
        
        // Fetch all topics
        const topicsResponse = await apiClient.get('/topics');
        
        // Fetch recent submissions
        const submissionsResponse = await apiClient.get('/submissions/user?page=0&size=10');
        
        // Fetch all problems to get counts by difficulty
        const problemsResponse = await apiClient.get('/problems?page=0&size=1000');
        
        setUserData(profile);
        setTopics(topicsResponse.data || []);
        setSubmissions(submissionsResponse.data?.content || []);
        setProblems(problemsResponse.data?.content || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mb-4"></div>
          <p className="text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Please log in to view your progress</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-main text-main-foreground rounded-base">
          Go to Login
        </button>
      </div>
    );
  }

  // Calculate statistics from real data
  const totalSolved = userData.solvedProblems?.length || 0;
  const totalAvailable = problems.length;
  
  // Count problems by difficulty
  const easyProblems = problems.filter(p => p.difficulty === 'EASY');
  const mediumProblems = problems.filter(p => p.difficulty === 'MEDIUM');
  const hardProblems = problems.filter(p => p.difficulty === 'HARD');
  
  // Calculate solved by difficulty (from submissions or solved problems)
  const easySolved = userData.solvedProblems?.filter((id: string) => 
    problems.find(p => p.id === id && p.difficulty === 'EASY')
  ).length || 0;
  const mediumSolved = userData.solvedProblems?.filter((id: string) => 
    problems.find(p => p.id === id && p.difficulty === 'MEDIUM')
  ).length || 0;
  const hardSolved = userData.solvedProblems?.filter((id: string) => 
    problems.find(p => p.id === id && p.difficulty === 'HARD')
  ).length || 0;

  // Generate streak data for calendar (last 15 days)
  const generateStreakData = () => {
    const data = [];
    const today = new Date();
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // TODO: Get actual count from submissions on that date
      data.push({
        date: date.toISOString().split('T')[0],
        count: i < (userData.profile?.currentStreak || 0) ? Math.floor(Math.random() * 3) + 1 : 0
      });
    }
    return data;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Progress Tracker</h1>
      
      <div className="border-2 border-border rounded-base p-4 mb-6 dark:bg-gray-800">
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-base ${activeTab === 'overview' ? 'bg-main text-main-foreground' : 'bg-background dark:bg-gray-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-base ${activeTab === 'topics' ? 'bg-main text-main-foreground' : 'bg-background dark:bg-gray-700'}`}
          >
            By Topics
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-base ${activeTab === 'activity' ? 'bg-main text-main-foreground' : 'bg-background dark:bg-gray-700'}`}
          >
            Recent Activity
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ProblemStatistics
                totalCompleted={totalSolved}
                totalAvailable={totalAvailable}
                byDifficulty={{
                  easy: { completed: easySolved, total: easyProblems.length },
                  medium: { completed: mediumSolved, total: mediumProblems.length },
                  hard: { completed: hardSolved, total: hardProblems.length }
                }}
              />
              
              <StreakCalendar
                data={generateStreakData()}
                currentStreak={userData.profile?.currentStreak || 0}
                longestStreak={userData.profile?.longestStreak || 0}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ProgressCard 
                title="Overall Progress" 
                total={totalAvailable} 
                solved={totalSolved}
                bgClass="bg-main text-main-foreground"
              />
              <ProgressCard 
                title="Easy Problems" 
                total={easyProblems.length} 
                solved={easySolved}
                bgClass="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
              />
              <ProgressCard 
                title="Medium Problems" 
                total={mediumProblems.length} 
                solved={mediumSolved}
                bgClass="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProgressCard 
                title="Hard Problems" 
                total={hardProblems.length} 
                solved={hardSolved}
                bgClass="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
              />
              <div className="border-2 border-border rounded-base p-4 col-span-1 md:col-span-2">
                <h3 className="text-xl font-semibold mb-3">Milestone Progress</h3>
                <div className="space-y-4">
                  <Milestone name="Beginner" target={50} current={totalSolved} />
                  <Milestone name="Intermediate" target={150} current={totalSolved} />
                  <Milestone name="Advanced" target={300} current={totalSolved} />
                  <Milestone name="Expert" target={450} current={totalSolved} />
                </div>
              </div>
            </div>
            
            <div className="border-2 border-border rounded-base p-4 mt-8">
              <h3 className="text-xl font-semibold mb-4">Progress by Platform</h3>
              {userData.preferences?.platformStats && Object.keys(userData.preferences.platformStats).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(userData.preferences.platformStats).map(([platformName, stats]: [string, any]) => {
                    const platformInfo = {
                      leetcode: { logo: 'https://leetcode.com/favicon.ico', link: 'https://leetcode.com' },
                      codeforces: { logo: 'https://codeforces.com/favicon.ico', link: 'https://codeforces.com' },
                      codechef: { logo: 'https://codechef.com/favicon.ico', link: 'https://www.codechef.com' }
                    }[platformName.toLowerCase()] || { logo: '', link: '#' };
                    
                    const solved = stats.problemsSolved || 0;
                    const total = 1000; // Default total, can be made dynamic
                    
                    return (
                      <div key={platformName} className="border border-border rounded-base p-4">
                        <div className="flex items-center mb-3">
                          {platformInfo.logo && (
                            <div className="w-8 h-8 mr-3">
                              <img src={platformInfo.logo} alt={platformName} className="max-h-full" />
                            </div>
                          )}
                          <h4 className="font-semibold capitalize">{platformName}</h4>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">{solved} solved</span>
                          {stats.rating && <span className="text-sm">Rating: {stats.rating}</span>}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-3">
                          <div 
                            className="bg-main h-2.5 rounded-full" 
                            style={{ width: `${Math.min((solved / total) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <a 
                          href={platformInfo.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center w-full mt-2 px-3 py-2 bg-main text-main-foreground rounded-base text-sm hover:opacity-90"
                        >
                          Practice on {platformName.charAt(0).toUpperCase() + platformName.slice(1)}
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No platform statistics available yet.</p>
                  <p className="text-sm mt-2">Add your platform stats in your profile settings.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'topics' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Progress by Topics</h3>
            {topics.length > 0 ? (
              <div className="space-y-4">
                {topics.map((topic: any) => {
                  // Calculate solved problems for this topic
                  const topicProblems = problems.filter(p => p.topicId === topic.id);
                  const topicSolved = userData.solvedProblems?.filter((solvedId: string) => 
                    topicProblems.some(p => p.id === solvedId)
                  ).length || 0;
                  const topicTotal = topicProblems.length;
                  const percentage = topicTotal > 0 ? Math.round((topicSolved / topicTotal) * 100) : 0;
                  
                  return (
                    <div key={topic.id} className="border-2 border-border rounded-base p-4 dark:bg-gray-800">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-semibold">{topic.name}</h4>
                        <span className="text-sm">{topicSolved} / {topicTotal} solved</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div 
                          className="bg-main h-2.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-right text-sm">
                        {percentage}%
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="text-sm font-medium mb-2">Practice on:</h5>
                        <div className="flex flex-wrap gap-3">
                          <a 
                            href="https://leetcode.com/problemset/all/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-base border border-border hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              <img src={leetcodeLogo} alt="LeetCode" className="max-h-full" />
                            </div>
                            <span className="text-sm">LeetCode</span>
                          </a>
                          <a 
                            href="https://codeforces.com/problemset"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-base border border-border hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              <img src={codeforcesLogo} alt="Codeforces" className="max-h-full" />
                            </div>
                            <span className="text-sm">Codeforces</span>
                          </a>
                          <a 
                            href="https://www.codechef.com/problems"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 rounded-base border border-border hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              <img src={codechefLogo} alt="CodeChef" className="max-h-full" />
                            </div>
                            <span className="text-sm">CodeChef</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No topics available yet.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            {submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="py-2 px-3 text-left">Date</th>
                      <th className="py-2 px-3 text-left">Problem</th>
                      <th className="py-2 px-3 text-left">Language</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission: any) => {
                      const problem = problems.find(p => p.id === submission.problemId);
                      const submissionDate = new Date(submission.submittedAt);
                      
                      return (
                        <tr key={submission.id} className="border-b border-border">
                          <td className="py-3 px-3">
                            {submissionDate.toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            {problem?.title || 'Unknown Problem'}
                          </td>
                          <td className="py-3 px-3 capitalize">
                            {submission.language}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 text-xs rounded-base ${
                              submission.status === 'ACCEPTED' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                                : submission.status === 'WRONG_ANSWER'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            }`}>
                              {submission.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {submission.runtime ? `${submission.runtime}ms` : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity yet.</p>
                <p className="text-sm mt-2">Start solving problems to see your activity here!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressCard({ title, total, solved, bgClass }: { 
  title: string; 
  total: number;
  solved: number;
  bgClass: string;
}) {
  const percentage = Math.round((solved / total) * 100);
  
  return (
    <div className={`rounded-base p-4 ${bgClass}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex justify-between mb-2">
        <span>{solved} / {total} solved</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-white/30 rounded-full h-2.5">
        <div 
          className="bg-white h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function Milestone({ name, target, current }: { name: string; target: number; current: number }) {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const completed = current >= target;
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-medium">{name}</span>
        <span className="text-sm">
          {completed ? (
            <span className="text-green-600">Completed!</span>
          ) : (
            `${current} / ${target}`
          )}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${completed ? 'bg-green-600' : 'bg-main'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressTrackerPage;
