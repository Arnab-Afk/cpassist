import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient, { problemsAPI } from '../lib/apiClient';

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
}

function TopicsPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicsRes = await apiClient.get('/topics');
        const problemsRes = await problemsAPI.getAll({ page: 0, size: 1000 });
        setTopics(topicsRes.data || []);
        setProblems(problemsRes.content || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedTopic = topics.find(t => t.id === topicId);
  const getStats = (id: string) => {
    const probs = problems.filter(p => p.topic === id);
    return {
      easy: probs.filter(p => p.difficulty === 'EASY').length,
      medium: probs.filter(p => p.difficulty === 'MEDIUM').length,
      hard: probs.filter(p => p.difficulty === 'HARD').length,
      total: probs.length
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mb-4"></div>
          <p className="text-lg">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedTopic ? (
        <div>
          <Link to="/topics" className="text-main hover:underline mb-4 inline-block">← Back</Link>
          <div className="border-2 border-border rounded-base p-6 mb-6 bg-main/10">
            <h1 className="text-3xl font-bold mb-2">{selectedTopic.name}</h1>
            <p>{selectedTopic.description}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-2 border-border rounded-base p-4">
              <h3 className="font-bold mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-green-100 dark:bg-green-900/30 rounded">
                  <span>Easy</span><span>{getStats(selectedTopic.id).easy}</span>
                </div>
                <div className="flex justify-between p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <span>Medium</span><span>{getStats(selectedTopic.id).medium}</span>
                </div>
                <div className="flex justify-between p-2 bg-red-100 dark:bg-red-900/30 rounded">
                  <span>Hard</span><span>{getStats(selectedTopic.id).hard}</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 border-2 border-border rounded-base p-4">
              <h3 className="font-bold mb-3">Problems</h3>
              {problems.filter(p => p.topic === selectedTopic.id).slice(0, 10).map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 mb-2 border rounded">
                  <span>{p.title}</span>
                  <button onClick={() => navigate('/progress/add')} className="px-3 py-1 bg-main text-main-foreground rounded">Solve</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-6">DSA Topics</h1>
          {topics.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {topics.map(topic => {
                const stats = getStats(topic.id);
                return (
                  <div key={topic.id} className="border-2 border-border rounded-base p-6 cursor-pointer hover:shadow-lg transition" onClick={() => navigate(`/topics/${topic.id}`)}>
                    <h3 className="text-xl font-bold mb-2">{topic.name}</h3>
                    <p className="text-sm mb-4">{topic.description}</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs">{stats.easy} Easy</span>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">{stats.medium} Med</span>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-xs">{stats.hard} Hard</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl">No topics available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TopicsPage;
