import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { problemsAPI, userAPI } from '../lib/apiClient';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

const AddProgressPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [problemId, setProblemId] = useState('');
  const [problemTitle, setProblemTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [status, setStatus] = useState('ACCEPTED');
  const [runtime, setRuntime] = useState('');
  const [memory, setMemory] = useState('');
  const [notes, setNotes] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Problem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search for problems
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      const response = await problemsAPI.getAll({
        page: 0,
        size: 20
      });
      
      // Filter results based on search query
      const filtered = response.content?.filter((problem: Problem) =>
        problem.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];
      
      setSearchResults(filtered);
      setShowSearch(true);
    } catch (err: any) {
      setError('Failed to search problems: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSearching(false);
    }
  };

  // Select a problem from search results
  const selectProblem = (problem: Problem) => {
    setProblemId(problem.id);
    setProblemTitle(problem.title);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Clear selected problem
  const clearProblem = () => {
    setProblemId('');
    setProblemTitle('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!problemId) {
      setError('Please select a problem');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Create submission
      const submissionData = {
        problemId,
        code: code.trim() || 'No code provided',
        language,
        status,
        runtime: runtime ? parseInt(runtime) : null,
        memory: memory ? parseInt(memory) : null,
        notes: notes.trim() || '',
        submittedAt: new Date().toISOString()
      };
      
      await apiClient.post('/submissions', submissionData);
      
      // If accepted, mark problem as solved
      if (status === 'ACCEPTED') {
        try {
          await userAPI.markSolved(problemId);
        } catch (err) {
          console.warn('Failed to mark as solved:', err);
        }
      }
      
      setSuccess('✅ Progress added successfully! Redirecting...');
      
      // Reset form and redirect
      setTimeout(() => {
        navigate('/progress');
      }, 1500);
      
    } catch (err: any) {
      setError('Failed to add progress: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-600 dark:text-green-400 border-green-500';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400 border-yellow-500';
      case 'HARD':
        return 'text-red-600 dark:text-red-400 border-red-500';
      default:
        return 'text-gray-600 dark:text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add Progress Manually</h1>
        <p className="text-foreground/70">
          Record your coding problem submissions manually
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-base border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
          <span className="text-green-800 dark:text-green-200">{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-base border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Problem Selection Card */}
        <div className="rounded-base border-2 border-border bg-background p-6 shadow-base">
          <h2 className="text-2xl font-bold mb-2">Select Problem</h2>
          <p className="text-foreground/70 mb-4">
            Search for the problem you want to add progress for
          </p>

          {/* Selected Problem Display */}
          {problemId && (
            <div className="p-4 rounded-base border-2 border-main bg-main/10 flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-main">{problemTitle}</p>
                <p className="text-sm text-foreground/70">Problem ID: {problemId}</p>
              </div>
              <button
                type="button"
                onClick={clearProblem}
                className="text-red-600 hover:text-red-700 px-3 py-1 rounded-base hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                ✕ Clear
              </button>
            </div>
          )}

          {/* Search Bar */}
          {!problemId && (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search problems by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:border-main transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-6 py-2 rounded-base border-2 border-border bg-main text-main-foreground font-medium hover:translate-y-[-1px] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {showSearch && (
                <div className="border-2 border-border rounded-base overflow-hidden">
                  {searchResults.length === 0 ? (
                    <p className="p-4 text-center text-foreground/70">
                      No problems found. Try a different search term.
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((problem) => (
                        <button
                          key={problem.id}
                          type="button"
                          onClick={() => selectProblem(problem)}
                          className="w-full p-4 text-left hover:bg-main/10 border-b-2 border-border last:border-b-0 transition-colors"
                        >
                          <p className="font-semibold">{problem.title}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-base border-2 text-sm ${getDifficultyClass(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                            <span className="px-2 py-1 rounded-base border-2 border-border text-sm text-foreground/70">
                              {problem.topic}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Submission Details - Only show when problem is selected */}
        {problemId && (
          <>
            {/* Submission Details Card */}
            <div className="rounded-base border-2 border-border bg-background p-6 shadow-base">
              <h2 className="text-2xl font-bold mb-2">Submission Details</h2>
              <p className="text-foreground/70 mb-4">
                Enter the details of your submission
              </p>

              <div className="space-y-4">
                {/* Language */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium mb-2">
                    Programming Language *
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:border-main transition-colors"
                  >
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="csharp">C#</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="kotlin">Kotlin</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-2">
                    Submission Status *
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:border-main transition-colors"
                  >
                    <option value="ACCEPTED">✅ Accepted</option>
                    <option value="WRONG_ANSWER">❌ Wrong Answer</option>
                    <option value="TIME_LIMIT_EXCEEDED">⏱️ Time Limit Exceeded</option>
                    <option value="MEMORY_LIMIT_EXCEEDED">💾 Memory Limit Exceeded</option>
                    <option value="RUNTIME_ERROR">🔥 Runtime Error</option>
                    <option value="COMPILATION_ERROR">⚠️ Compilation Error</option>
                  </select>
                </div>

                {/* Runtime and Memory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="runtime" className="block text-sm font-medium mb-2">
                      Runtime (ms)
                    </label>
                    <input
                      id="runtime"
                      type="number"
                      placeholder="e.g., 45"
                      value={runtime}
                      onChange={(e) => setRuntime(e.target.value)}
                      min="0"
                      className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:border-main transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="memory" className="block text-sm font-medium mb-2">
                      Memory (MB)
                    </label>
                    <input
                      id="memory"
                      type="number"
                      placeholder="e.g., 38"
                      value={memory}
                      onChange={(e) => setMemory(e.target.value)}
                      min="0"
                      className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:border-main transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Code Card */}
            <div className="rounded-base border-2 border-border bg-background p-6 shadow-base">
              <h2 className="text-2xl font-bold mb-2">Your Code (Optional)</h2>
              <p className="text-foreground/70 mb-4">
                Paste your solution code for future reference
              </p>
              <textarea
                id="code"
                placeholder="Paste your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:border-main transition-colors resize-y"
              />
            </div>

            {/* Notes Card */}
            <div className="rounded-base border-2 border-border bg-background p-6 shadow-base">
              <h2 className="text-2xl font-bold mb-2">Notes (Optional)</h2>
              <p className="text-foreground/70 mb-4">
                Add any notes or observations about this submission
              </p>
              <textarea
                id="notes"
                placeholder="e.g., Used dynamic programming approach, optimized time complexity..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:border-main transition-colors resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/progress')}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-base border-2 border-border bg-background text-foreground font-medium hover:translate-y-[-1px] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !problemId}
                className="px-6 py-2 rounded-base border-2 border-border bg-main text-main-foreground font-medium hover:translate-y-[-1px] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Adding...' : '➕ Add Progress'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default AddProgressPage;
