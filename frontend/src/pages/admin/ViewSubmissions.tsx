import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/apiClient';

interface Submission {
  id: string;
  userId: string;
  username: string;
  problemId: string;
  problemTitle: string;
  language: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';
  submittedAt: string;
  executionTime?: number;
  memoryUsed?: number;
}

function ViewSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await apiClient.get('/admin/submissions');
      setSubmissions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      // Mock data for development
      setSubmissions([
        {
          id: '1',
          userId: 'user1',
          username: 'john_doe',
          problemId: 'prob1',
          problemTitle: 'Two Sum',
          language: 'Java',
          status: 'ACCEPTED',
          submittedAt: new Date().toISOString(),
          executionTime: 45,
          memoryUsed: 42.3,
        },
        {
          id: '2',
          userId: 'user2',
          username: 'jane_admin',
          problemId: 'prob2',
          problemTitle: 'Reverse String',
          language: 'Python',
          status: 'WRONG_ANSWER',
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
          executionTime: 32,
          memoryUsed: 38.1,
        },
      ]);
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.problemTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesLanguage = filterLanguage === 'all' || submission.language === filterLanguage;
    
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300';
      case 'WRONG_ANSWER':
        return 'bg-red-100 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300';
      case 'TIME_LIMIT_EXCEEDED':
        return 'bg-orange-100 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-300';
      case 'RUNTIME_ERROR':
        return 'bg-purple-100 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300';
      case 'COMPILATION_ERROR':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-500 text-gray-700 dark:text-gray-300';
    }
  };

  const uniqueLanguages = Array.from(new Set(submissions.map(s => s.language)));

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
          <h1 className="text-4xl font-bold mb-2">View Submissions</h1>
          <p className="text-foreground/70">Monitor all code submissions</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="border-2 border-border rounded-base p-4 mb-6 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username or problem..."
              className="w-full p-2 border-2 border-border rounded-base bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border-2 border-border rounded-base bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WRONG_ANSWER">Wrong Answer</option>
              <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
              <option value="RUNTIME_ERROR">Runtime Error</option>
              <option value="COMPILATION_ERROR">Compilation Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Language</label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full p-2 border-2 border-border rounded-base bg-background"
            >
              <option value="all">All Languages</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="text-xs text-foreground/70">Total</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{submissions.length}</div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="text-xs text-foreground/70">Accepted</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {submissions.filter(s => s.status === 'ACCEPTED').length}
          </div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-red-500/10 to-red-500/5">
          <div className="text-xs text-foreground/70">Wrong Answer</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {submissions.filter(s => s.status === 'WRONG_ANSWER').length}
          </div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <div className="text-xs text-foreground/70">TLE</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {submissions.filter(s => s.status === 'TIME_LIMIT_EXCEEDED').length}
          </div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="text-xs text-foreground/70">Errors</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {submissions.filter(s => s.status === 'RUNTIME_ERROR' || s.status === 'COMPILATION_ERROR').length}
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="border-2 border-border rounded-base overflow-hidden shadow-[var(--shadow)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-main text-main-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Problem</th>
                <th className="px-4 py-3 text-left font-semibold">Language</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">Memory</th>
                <th className="px-4 py-3 text-left font-semibold">Submitted</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission, index) => (
                <tr
                  key={submission.id}
                  className={`border-t-2 border-border ${index % 2 === 0 ? 'bg-background' : 'bg-background/50'}`}
                >
                  <td className="px-4 py-3 font-medium">{submission.username}</td>
                  <td className="px-4 py-3">{submission.problemTitle}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 border border-blue-500 text-blue-700 dark:text-blue-300 rounded-base">
                      {submission.language}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-base border ${getStatusColor(submission.status)}`}>
                      {submission.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {submission.executionTime ? `${submission.executionTime}ms` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {submission.memoryUsed ? `${submission.memoryUsed}MB` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground/70">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowModal(true);
                      }}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded-base hover:bg-blue-600"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSubmissions.length === 0 && (
          <div className="p-8 text-center text-foreground/70">
            <div className="text-4xl mb-2">📊</div>
            <p>No submissions found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Submission Details Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-border rounded-base p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Submission Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border-2 border-border rounded-base hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70">Username</label>
                  <p className="font-semibold">{selectedSubmission.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Problem</label>
                  <p className="font-semibold">{selectedSubmission.problemTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Language</label>
                  <p className="font-semibold">{selectedSubmission.language}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs rounded-base border ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {(selectedSubmission.executionTime || selectedSubmission.memoryUsed) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedSubmission.executionTime && (
                    <div>
                      <label className="text-sm font-medium text-foreground/70">Execution Time</label>
                      <p className="font-semibold text-lg">{selectedSubmission.executionTime}ms</p>
                    </div>
                  )}
                  {selectedSubmission.memoryUsed && (
                    <div>
                      <label className="text-sm font-medium text-foreground/70">Memory Used</label>
                      <p className="font-semibold text-lg">{selectedSubmission.memoryUsed}MB</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground/70">Submitted At</label>
                <p className="font-semibold">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 mb-2 block">Submission ID</label>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{selectedSubmission.id}</code>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewSubmissions;
