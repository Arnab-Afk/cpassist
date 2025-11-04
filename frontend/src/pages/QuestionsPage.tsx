import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { problemsAPI, userAPI } from '../lib/apiClient';
import apiClient from '../lib/apiClient';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  tags: string[];
  platform?: string;
  platformUrl?: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
}

function QuestionsPage() {
  const { difficulty } = useParams();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all problems
        const problemsResponse = await problemsAPI.getAll({
          page: 0,
          size: 1000
        });
        
        // Fetch topics
        const topicsResponse = await apiClient.get('/topics');
        
        // Fetch user's solved problems
        try {
          const userProfile = await userAPI.getProfile();
          setSolvedProblems(new Set(userProfile.solvedProblems || []));
        } catch (err) {
          console.log('User not logged in or error fetching profile');
        }
        
        setProblems(problemsResponse.content || []);
        setTopics(topicsResponse.data || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load problems. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Filter questions based on difficulty, topic, and search query
  const filteredQuestions = problems.filter(question => {
    // Filter by difficulty if provided (URL param)
    if (difficulty && question.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
      return false;
    }
    
    // Filter by selected topic if any
    if (selectedTopic && question.topic !== selectedTopic) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !question.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mb-4"></div>
          <p className="text-lg">Loading problems...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-lg text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-main text-main-foreground rounded-base hover:translate-y-[-2px] transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {difficulty 
            ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} DSA Problems` 
            : "DSA Problems"}
        </h1>
        <div className="text-sm text-foreground/70">
          {filteredQuestions.length} {filteredQuestions.length === 1 ? 'problem' : 'problems'} found
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/4">
          {/* Topics Filter */}
          <div className="border-2 border-border rounded-base p-4 mb-6 shadow-[var(--shadow)] sticky top-4">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span>📚</span>
              Filter by Topic
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              <button 
                onClick={() => setSelectedTopic(null)}
                className={`w-full text-left px-3 py-2 rounded-base transition-all ${
                  !selectedTopic 
                    ? 'bg-main text-main-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' 
                    : 'hover:bg-main/10'
                }`}
              >
                All Topics
              </button>
              {topics.map(topic => (
                <button 
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full text-left px-3 py-2 rounded-base transition-all ${
                    selectedTopic === topic.id 
                      ? 'bg-main text-main-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' 
                      : 'hover:bg-main/10'
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Difficulty Filter */}
          <div className="border-2 border-border rounded-base p-4 shadow-[var(--shadow)] sticky top-[450px]">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span>🎯</span>
              Difficulty
            </h2>
            <div className="space-y-2">
              <Link 
                to="/questions"
                className={`block px-3 py-2 rounded-base transition-all ${
                  !difficulty 
                    ? 'bg-main text-main-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' 
                    : 'hover:bg-main/10'
                }`}
              >
                All Difficulties
              </Link>
              <Link 
                to="/questions/easy"
                className={`block px-3 py-2 rounded-base transition-all ${
                  difficulty === 'easy' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' 
                    : 'hover:bg-green-50 dark:hover:bg-green-900/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🟢</span>
                  Easy
                </span>
              </Link>
              <Link 
                to="/questions/medium"
                className={`block px-3 py-2 rounded-base transition-all ${
                  difficulty === 'medium' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' 
                    : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🟡</span>
                  Medium
                </span>
              </Link>
              <Link 
                to="/questions/hard"
                className={`block px-3 py-2 rounded-base transition-all ${
                  difficulty === 'hard' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]' 
                    : 'hover:bg-red-50 dark:hover:bg-red-900/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>🔴</span>
                  Hard
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-3/4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search problems by title..."
                className="w-full px-4 py-3 pl-12 border-2 border-border rounded-base focus:outline-none focus:border-main transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Problems List */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(question => {
                const isSolved = solvedProblems.has(question.id);
                const difficultyLower = question.difficulty.toLowerCase();
                
                return (
                  <div 
                    key={question.id}
                    className="border-2 border-border rounded-base p-5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-y-[-2px] bg-background"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {isSolved && <span className="text-green-600 dark:text-green-400">✓</span>}
                        {question.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-base border-2 ${
                          difficultyLower === 'easy'
                            ? 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900/30 dark:text-green-200' 
                            : difficultyLower === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-500 dark:bg-red-900/30 dark:text-red-200'
                        }`}>
                          {question.difficulty}
                        </span>
                        {isSolved && (
                          <span className="px-3 py-1 text-xs font-semibold bg-main text-main-foreground rounded-base border-2 border-border">
                            ✓ Solved
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{question.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-xs px-2 py-1 bg-main/10 text-main rounded-base border border-main/30">
                        📂 {question.topic}
                      </span>
                      {question.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-background border border-border rounded-base">
                          #{tag}
                        </span>
                      ))}
                      {question.platform && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 rounded-base border border-purple-500">
                          🌐 {question.platform}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-foreground/60">
                        {/* Additional info */}
                      </div>
                      <div className="flex gap-2">
                        {question.platformUrl && (
                          <a
                            href={question.platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border-2 border-border rounded-base text-sm font-medium hover:bg-main/10 transition-all"
                          >
                            View Problem →
                          </a>
                        )}
                        <button 
                          onClick={() => navigate(`/progress/add?problemId=${question.id}`)}
                          className="px-4 py-2 bg-main text-main-foreground rounded-base text-sm font-medium hover:translate-y-[-2px] transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                        >
                          {isSolved ? '📝 Add Another' : '🚀 Solve'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-base bg-background">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-semibold mb-2">No problems found</p>
                <p className="text-sm text-foreground/70 mb-4">
                  Try adjusting your filters or search query
                </p>
                <button 
                  onClick={() => {
                    setSelectedTopic(null);
                    setSearchQuery("");
                  }}
                  className="px-6 py-2 bg-main text-main-foreground rounded-base hover:translate-y-[-2px] transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionsPage;
