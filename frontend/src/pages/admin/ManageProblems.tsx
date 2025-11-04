import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemsAPI } from '../../lib/apiClient';

interface Problem {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  description: string;
  constraints?: string;
  examples?: string;
  tags?: string[];
  companies?: string[];
  acceptanceRate?: number;
  submissionCount?: number;
}

function ManageProblems() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const data = await problemsAPI.getAll();
      setProblems(Array.isArray(data) ? data : data.content || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
      setLoading(false);
    }
  };

  const handleCreateProblem = () => {
    setSelectedProblem({
      id: '',
      title: '',
      difficulty: 'EASY',
      topic: '',
      description: '',
      tags: [],
      companies: [],
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleEditProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveProblem = async () => {
    if (!selectedProblem) return;

    try {
      if (selectedProblem.id) {
        await problemsAPI.update(selectedProblem.id, selectedProblem);
      } else {
        await problemsAPI.create(selectedProblem);
      }
      fetchProblems();
      setShowModal(false);
      setSelectedProblem(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save problem:', error);
      alert('Failed to save problem');
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      return;
    }

    try {
      await problemsAPI.delete(problemId);
      fetchProblems();
    } catch (error) {
      console.error('Failed to delete problem:', error);
      alert('Failed to delete problem');
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = filterDifficulty === 'all' || problem.difficulty === filterDifficulty;
    const matchesTopic = filterTopic === 'all' || problem.topic === filterTopic;
    
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const uniqueTopics = Array.from(new Set(problems.map(p => p.topic)));

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Problems</h1>
          <p className="text-foreground/70">Add, edit, and delete coding problems</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateProblem}
            className="px-4 py-2 bg-main text-main-foreground border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform shadow-[var(--shadow)]"
          >
            ➕ Add Problem
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-2 border-border rounded-base p-4 mb-6 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Problems</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or topic..."
              className="w-full p-2 border-2 border-border rounded-base bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full p-2 border-2 border-border rounded-base bg-background"
            >
              <option value="all">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Topic</label>
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="w-full p-2 border-2 border-border rounded-base bg-background"
            >
              <option value="all">All Topics</option>
              {uniqueTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="text-sm text-foreground/70">Total Problems</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{problems.length}</div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="text-sm text-foreground/70">Easy</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {problems.filter(p => p.difficulty === 'EASY').length}
          </div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <div className="text-sm text-foreground/70">Medium</div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {problems.filter(p => p.difficulty === 'MEDIUM').length}
          </div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-red-500/10 to-red-500/5">
          <div className="text-sm text-foreground/70">Hard</div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {problems.filter(p => p.difficulty === 'HARD').length}
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            className="border-2 border-border rounded-base p-4 bg-background hover:translate-y-[-2px] transition-transform shadow-[var(--shadow)]"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg flex-1">{problem.title}</h3>
              <span
                className={`px-2 py-1 text-xs rounded-base border ${
                  problem.difficulty === 'EASY'
                    ? 'bg-green-100 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                    : problem.difficulty === 'MEDIUM'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300'
                    : 'bg-red-100 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                }`}
              >
                {problem.difficulty}
              </span>
            </div>
            
            <div className="mb-3">
              <span className="text-sm text-foreground/70">Topic: </span>
              <span className="text-sm font-medium">{problem.topic}</span>
            </div>

            {problem.tags && problem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {problem.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-main/10 border border-main rounded-base"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {problem.acceptanceRate && (
              <div className="text-sm text-foreground/70 mb-3">
                Acceptance: <span className="font-semibold">{problem.acceptanceRate}%</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedProblem(problem);
                  setIsEditing(false);
                  setShowModal(true);
                }}
                className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-base hover:bg-blue-600"
              >
                View
              </button>
              <button
                onClick={() => handleEditProblem(problem)}
                className="flex-1 px-3 py-1 text-sm bg-yellow-500 text-white rounded-base hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteProblem(problem.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-base hover:bg-red-600"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-base p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-foreground/70 mb-4">No problems found</p>
          <button
            onClick={handleCreateProblem}
            className="px-4 py-2 bg-main text-main-foreground rounded-base hover:translate-y-[-2px] transition-transform"
          >
            Create First Problem
          </button>
        </div>
      )}

      {/* Problem Modal */}
      {showModal && selectedProblem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-border rounded-base p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {isEditing ? (selectedProblem.id ? 'Edit Problem' : 'Create Problem') : 'Problem Details'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedProblem(null);
                  setIsEditing(false);
                }}
                className="px-3 py-1 border-2 border-border rounded-base hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={selectedProblem.title}
                  onChange={(e) => setSelectedProblem({ ...selectedProblem, title: e.target.value })}
                  disabled={!isEditing}
                  className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60"
                  placeholder="e.g., Two Sum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty *</label>
                  <select
                    value={selectedProblem.difficulty}
                    onChange={(e) => setSelectedProblem({ ...selectedProblem, difficulty: e.target.value as any })}
                    disabled={!isEditing}
                    className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Topic *</label>
                  <input
                    type="text"
                    value={selectedProblem.topic}
                    onChange={(e) => setSelectedProblem({ ...selectedProblem, topic: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60"
                    placeholder="e.g., Arrays"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={selectedProblem.description}
                  onChange={(e) => setSelectedProblem({ ...selectedProblem, description: e.target.value })}
                  disabled={!isEditing}
                  className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60 resize-none"
                  rows={6}
                  placeholder="Problem description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Constraints</label>
                <textarea
                  value={selectedProblem.constraints || ''}
                  onChange={(e) => setSelectedProblem({ ...selectedProblem, constraints: e.target.value })}
                  disabled={!isEditing}
                  className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60 resize-none"
                  rows={3}
                  placeholder="Problem constraints..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Examples</label>
                <textarea
                  value={selectedProblem.examples || ''}
                  onChange={(e) => setSelectedProblem({ ...selectedProblem, examples: e.target.value })}
                  disabled={!isEditing}
                  className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60 resize-none"
                  rows={4}
                  placeholder="Example test cases..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={selectedProblem.tags?.join(', ') || ''}
                  onChange={(e) => setSelectedProblem({ 
                    ...selectedProblem, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  })}
                  disabled={!isEditing}
                  className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60"
                  placeholder="e.g., hash-table, two-pointer"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProblem(null);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProblem}
                    className="px-4 py-2 bg-main text-main-foreground border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform shadow-[var(--shadow)]"
                  >
                    Save Problem
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-yellow-500 text-white border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedProblem(null);
                    }}
                    className="px-4 py-2 border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageProblems;
