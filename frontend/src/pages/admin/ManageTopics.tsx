import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../lib/apiClient';
import apiClient from '../../lib/apiClient';

interface Topic {
  id: string;
  name: string;
  description: string;
  icon?: string;
  problemCount: number;
  color?: string;
}

function ManageTopics() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await apiClient.get('/topics');
      const data = Array.isArray(response.data) ? response.data : response.data.content || [];
      setTopics(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      setTopics([]);
      setLoading(false);
    }
  };

  const handleCreateTopic = () => {
    setSelectedTopic({
      id: '',
      name: '',
      description: '',
      icon: '📚',
      problemCount: 0,
      color: 'blue',
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveTopic = async () => {
    if (!selectedTopic) return;

    try {
      if (selectedTopic.id) {
        await adminAPI.topics.update(selectedTopic.id, selectedTopic);
      } else {
        await adminAPI.topics.create(selectedTopic);
      }
      fetchTopics();
      setShowModal(false);
      setSelectedTopic(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save topic:', error);
      alert('Failed to save topic');
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? Associated problems will need to be reassigned.')) {
      return;
    }

    try {
      await adminAPI.topics.delete(topicId);
      fetchTopics();
    } catch (error) {
      console.error('Failed to delete topic:', error);
      alert('Failed to delete topic');
    }
  };

  const filteredTopics = topics.filter((topic: Topic) =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-4xl font-bold mb-2">Manage Topics</h1>
          <p className="text-foreground/70">Organize problem categories and topics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateTopic}
            className="px-4 py-2 bg-main text-main-foreground border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform shadow-[var(--shadow)]"
          >
            ➕ Add Topic
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="border-2 border-border rounded-base p-4 mb-6 bg-background">
        <label className="block text-sm font-medium mb-2">Search Topics</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or description..."
          className="w-full p-2 border-2 border-border rounded-base bg-background"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="text-sm text-foreground/70">Total Topics</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{topics.length}</div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="text-sm text-foreground/70">Total Problems</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {topics.reduce((sum, t) => sum + t.problemCount, 0)}
          </div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="text-sm text-foreground/70">Avg Problems/Topic</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {topics.length > 0 ? Math.round(topics.reduce((sum, t) => sum + t.problemCount, 0) / topics.length) : 0}
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const colorMap: { [key: string]: string } = {
            blue: 'from-blue-500/10 to-blue-500/5 border-blue-500',
            green: 'from-green-500/10 to-green-500/5 border-green-500',
            purple: 'from-purple-500/10 to-purple-500/5 border-purple-500',
            orange: 'from-orange-500/10 to-orange-500/5 border-orange-500',
            red: 'from-red-500/10 to-red-500/5 border-red-500',
            cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500',
          };

          return (
            <div
              key={topic.id}
              className={`border-2 rounded-base p-6 bg-gradient-to-br ${colorMap[topic.color || 'blue']} hover:translate-y-[-2px] transition-transform shadow-[var(--shadow)]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{topic.icon || '📚'}</div>
                <div className="text-2xl font-bold text-foreground/30">{topic.problemCount}</div>
              </div>
              
              <h3 className="font-bold text-xl mb-2">{topic.name}</h3>
              <p className="text-sm text-foreground/70 mb-4">{topic.description}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTopic(topic)}
                  className="flex-1 px-3 py-2 text-sm bg-yellow-500 text-white rounded-base hover:bg-yellow-600"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteTopic(topic.id)}
                  className="px-3 py-2 text-sm bg-red-500 text-white rounded-base hover:bg-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTopics.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-base p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-foreground/70 mb-4">No topics found</p>
          <button
            onClick={handleCreateTopic}
            className="px-4 py-2 bg-main text-main-foreground rounded-base hover:translate-y-[-2px] transition-transform"
          >
            Create First Topic
          </button>
        </div>
      )}

      {/* Topic Modal */}
      {showModal && selectedTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-border rounded-base p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {isEditing ? (selectedTopic.id ? 'Edit Topic' : 'Create Topic') : 'Topic Details'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTopic(null);
                  setIsEditing(false);
                }}
                className="px-3 py-1 border-2 border-border rounded-base hover:bg-red-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={selectedTopic.name}
                  onChange={(e) => setSelectedTopic({ ...selectedTopic, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60"
                  placeholder="e.g., Dynamic Programming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={selectedTopic.description}
                  onChange={(e) => setSelectedTopic({ ...selectedTopic, description: e.target.value })}
                  disabled={!isEditing}
                  className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60 resize-none"
                  rows={3}
                  placeholder="Brief description of the topic..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={selectedTopic.icon || ''}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, icon: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60"
                    placeholder="e.g., 🔄"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color Theme</label>
                  <select
                    value={selectedTopic.color || 'blue'}
                    onChange={(e) => setSelectedTopic({ ...selectedTopic, color: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-2 border-2 border-border rounded-base bg-background disabled:opacity-60"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                    <option value="red">Red</option>
                    <option value="cyan">Cyan</option>
                  </select>
                </div>
              </div>

              {selectedTopic.id && (
                <div>
                  <label className="block text-sm font-medium mb-2">Problem Count</label>
                  <p className="text-2xl font-bold text-main">{selectedTopic.problemCount}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTopic(null);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTopic}
                    className="px-4 py-2 bg-main text-main-foreground border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform shadow-[var(--shadow)]"
                  >
                    Save Topic
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTopic(null);
                  }}
                  className="px-4 py-2 border-2 border-border rounded-base hover:translate-y-[-2px] transition-transform"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTopics;
