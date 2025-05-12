import { useState } from 'react';
import ProblemStatistics from '../components/ProblemStatistics';
import StreakCalendar from '../components/StreakCalendar';

// Import platform logos
import leetcodeLogo from '../assets/leetcode.png';
import codeforcesLogo from '../assets/codeforces.png';
import codechefLogo from '../assets/codechef.svg';

// Mock data for tracking progress
const mockData = {
  totalQuestions: 450,
  solvedQuestions: 125,
  easyQuestions: { total: 200, solved: 85 },
  mediumQuestions: { total: 150, solved: 35 },
  hardQuestions: { total: 100, solved: 5 },
  platformStats: [
    { name: "leetcode", solved: 65, total: 200, logo: leetcodeLogo, link: "https://leetcode.com/problemset/" },
    { name: "codeforces", solved: 40, total: 150, logo: codeforcesLogo, link: "https://codeforces.com/problemset" },
    { name: "codechef", solved: 20, total: 100, logo: codechefLogo, link: "https://www.codechef.com/problems" }
  ],
  topics: [
    { 
      name: "Arrays & Strings", 
      total: 80, 
      solved: 45,
      platforms: [
        { name: "leetcode", count: 25, link: "https://leetcode.com/tag/array/" },
        { name: "codeforces", count: 15, link: "https://codeforces.com/problemset?tags=implementation,strings" },
        { name: "codechef", count: 5, link: "https://www.codechef.com/tags/problems/arrays" }
      ]
    },
    { 
      name: "Linked Lists", 
      total: 60, 
      solved: 20,
      platforms: [
        { name: "leetcode", count: 12, link: "https://leetcode.com/tag/linked-list/" },
        { name: "codeforces", count: 5, link: "https://codeforces.com/problemset?tags=data+structures" },
        { name: "codechef", count: 3, link: "https://www.codechef.com/tags/problems/linked-lists" }
      ]
    },
    { 
      name: "Stacks & Queues", 
      total: 40, 
      solved: 15,
      platforms: [
        { name: "leetcode", count: 8, link: "https://leetcode.com/tag/stack/" },
        { name: "codeforces", count: 5, link: "https://codeforces.com/problemset?tags=data+structures" },
        { name: "codechef", count: 2, link: "https://www.codechef.com/tags/problems/stacks" }
      ]
    },
    { 
      name: "Trees & Graphs", 
      total: 70, 
      solved: 20,
      platforms: [
        { name: "leetcode", count: 10, link: "https://leetcode.com/tag/tree/" },
        { name: "codeforces", count: 7, link: "https://codeforces.com/problemset?tags=graphs,trees" },
        { name: "codechef", count: 3, link: "https://www.codechef.com/tags/problems/trees" }
      ]
    },
    { 
      name: "Dynamic Programming", 
      total: 60, 
      solved: 10,
      platforms: [
        { name: "leetcode", count: 5, link: "https://leetcode.com/tag/dynamic-programming/" },
        { name: "codeforces", count: 3, link: "https://codeforces.com/problemset?tags=dp" },
        { name: "codechef", count: 2, link: "https://www.codechef.com/tags/problems/dynamic-programming" }
      ]
    },
    { 
      name: "Sorting & Searching", 
      total: 50, 
      solved: 15,
      platforms: [
        { name: "leetcode", count: 7, link: "https://leetcode.com/tag/sorting/" },
        { name: "codeforces", count: 5, link: "https://codeforces.com/problemset?tags=binary+search,sortings" },
        { name: "codechef", count: 3, link: "https://www.codechef.com/tags/problems/sorting" }
      ]
    },
    { 
      name: "Others", 
      total: 90, 
      solved: 0,
      platforms: [
        { name: "leetcode", count: 0, link: "https://leetcode.com/problemset/all/" },
        { name: "codeforces", count: 0, link: "https://codeforces.com/problemset" },
        { name: "codechef", count: 0, link: "https://www.codechef.com/problems" }
      ]
    }
  ],
  recentActivity: [
    { id: 1, problem: "Two Sum", date: "2025-05-11", result: "Solved", platform: "leetcode", link: "https://leetcode.com/problems/two-sum/" },
    { id: 2, problem: "Valid Parentheses", date: "2025-05-10", result: "Solved", platform: "leetcode", link: "https://leetcode.com/problems/valid-parentheses/" },
    { id: 3, problem: "LRU Cache", date: "2025-05-09", result: "Attempted", platform: "leetcode", link: "https://leetcode.com/problems/lru-cache/" },
    { id: 4, problem: "Course Schedule", date: "2025-05-08", result: "Solved", platform: "codeforces", link: "https://codeforces.com/problemset/problem/1350/A" },
    { id: 5, problem: "Longest Increasing Subsequence", date: "2025-05-07", result: "Solved", platform: "codechef", link: "https://www.codechef.com/problems/LIS" }
  ],
  streakData: [
    { date: "2025-05-12", count: 2 },
    { date: "2025-05-11", count: 3 },
    { date: "2025-05-10", count: 1 },
    { date: "2025-05-09", count: 2 },
    { date: "2025-05-08", count: 4 },
    { date: "2025-05-07", count: 5 },
    { date: "2025-05-06", count: 0 },
    { date: "2025-05-05", count: 0 },
    { date: "2025-05-04", count: 1 },
    { date: "2025-05-03", count: 2 },
    { date: "2025-05-02", count: 0 },
    { date: "2025-05-01", count: 1 },
    { date: "2025-04-30", count: 3 },
    { date: "2025-04-29", count: 2 },
    { date: "2025-04-28", count: 1 }
  ],
  currentStreak: 7,
  longestStreak: 15
};

function ProgressTrackerPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'activity'>('overview');
  
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
                totalCompleted={mockData.solvedQuestions}
                totalAvailable={mockData.totalQuestions}
                byDifficulty={{
                  easy: { completed: mockData.easyQuestions.solved, total: mockData.easyQuestions.total },
                  medium: { completed: mockData.mediumQuestions.solved, total: mockData.mediumQuestions.total },
                  hard: { completed: mockData.hardQuestions.solved, total: mockData.hardQuestions.total }
                }}
              />
              
              <StreakCalendar
                data={mockData.streakData}
                currentStreak={mockData.currentStreak}
                longestStreak={mockData.longestStreak}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ProgressCard 
                title="Overall Progress" 
                total={mockData.totalQuestions} 
                solved={mockData.solvedQuestions}
                bgClass="bg-main text-main-foreground"
              />
              <ProgressCard 
                title="Easy Problems" 
                total={mockData.easyQuestions.total} 
                solved={mockData.easyQuestions.solved}
                bgClass="bg-green-100 text-green-800"
              />
              <ProgressCard 
                title="Medium Problems" 
                total={mockData.mediumQuestions.total} 
                solved={mockData.mediumQuestions.solved}
                bgClass="bg-yellow-100 text-yellow-800"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProgressCard 
                title="Hard Problems" 
                total={mockData.hardQuestions.total} 
                solved={mockData.hardQuestions.solved}
                bgClass="bg-red-100 text-red-800"
              />
              <div className="border-2 border-border rounded-base p-4 col-span-1 md:col-span-2">
                <h3 className="text-xl font-semibold mb-3">Milestone Progress</h3>
                <div className="space-y-4">
                  <Milestone name="Beginner" target={50} current={mockData.solvedQuestions} />
                  <Milestone name="Intermediate" target={150} current={mockData.solvedQuestions} />
                  <Milestone name="Advanced" target={300} current={mockData.solvedQuestions} />
                  <Milestone name="Expert" target={450} current={mockData.solvedQuestions} />
                </div>
              </div>
            </div>
            
            <div className="border-2 border-border rounded-base p-4 mt-8">
              <h3 className="text-xl font-semibold mb-4">Progress by Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockData.platformStats.map((platform, index) => (
                  <div key={index} className="border border-border rounded-base p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 mr-3">
                        <img src={platform.logo} alt={platform.name} className="max-h-full" />
                      </div>
                      <h4 className="font-semibold capitalize">{platform.name}</h4>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{platform.solved} / {platform.total} solved</span>
                      <span className="text-sm">{Math.round((platform.solved / platform.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div 
                        className="bg-main h-2.5 rounded-full" 
                        style={{ width: `${(platform.solved / platform.total) * 100}%` }}
                      ></div>
                    </div>
                    <a 
                      href={platform.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full mt-2 px-3 py-2 bg-main text-main-foreground rounded-base text-sm hover:opacity-90"
                    >
                      Practice on {platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'topics' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Progress by Topics</h3>
            <div className="space-y-4">
              {mockData.topics.map((topic, index) => (
                <div key={index} className="border-2 border-border rounded-base p-4 dark:bg-gray-800">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">{topic.name}</h4>
                    <span className="text-sm">{topic.solved} / {topic.total} solved</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div 
                      className="bg-main h-2.5 rounded-full" 
                      style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-right text-sm">
                    {Math.round((topic.solved / topic.total) * 100)}%
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="text-sm font-medium mb-2">Practice on:</h5>
                    <div className="flex flex-wrap gap-3">
                      {topic.platforms.map((platform, pIndex) => (
                        <a 
                          key={pIndex}
                          href={platform.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-base border border-border hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            {platform.name === 'leetcode' && (
                              <img src={leetcodeLogo} alt="LeetCode" className="max-h-full" />
                            )}
                            {platform.name === 'codeforces' && (
                              <img src={codeforcesLogo} alt="Codeforces" className="max-h-full" />
                            )}
                            {platform.name === 'codechef' && (
                              <img src={codechefLogo} alt="CodeChef" className="max-h-full" />
                            )}
                          </div>
                          <span className="text-sm">{platform.count} solved</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Platform</th>
                    <th className="py-2 px-3 text-left">Problem</th>
                    <th className="py-2 px-3 text-left">Result</th>
                    <th className="py-2 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.recentActivity.map(activity => (
                    <tr key={activity.id} className="border-b border-border">
                      <td className="py-3 px-3">{activity.date}</td>
                      <td className="py-3 px-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {activity.platform === 'leetcode' && (
                            <img src={leetcodeLogo} alt="LeetCode" className="max-h-full" />
                          )}
                          {activity.platform === 'codeforces' && (
                            <img src={codeforcesLogo} alt="Codeforces" className="max-h-full" />
                          )}
                          {activity.platform === 'codechef' && (
                            <img src={codechefLogo} alt="CodeChef" className="max-h-full" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">{activity.problem}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 text-xs rounded-base ${
                          activity.result === 'Solved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.result}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex space-x-2">
                          <a 
                            href={activity.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-main text-main-foreground text-xs rounded-base hover:opacity-90"
                          >
                            Practice
                          </a>
                          <button className="px-2 py-1 bg-background border border-border text-xs rounded-base hover:bg-gray-100">
                            View Notes
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
