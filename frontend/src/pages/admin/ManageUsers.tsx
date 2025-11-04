import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../lib/apiClient';

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  solvedProblems: string[];
}

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.users.getAll();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (userId: string, enabled: boolean) => {
    try {
      await adminAPI.users.toggleEnabled(userId, !enabled);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleToggleRole = async (userId: string, role: string) => {
    try {
      const user = users.find((u: User) => u.id === userId);
      if (!user) return;

      const newRoles = user.roles.includes(role)
        ? user.roles.filter((r: string) => r !== role)
        : [...user.roles, role];

      await adminAPI.users.updateRoles(userId, newRoles);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user roles:', error);
      alert('Failed to update user roles');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.users.delete(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.roles.includes(filterRole);
    
    return matchesSearch && matchesRole;
  });

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
          <h1 className="text-4xl font-bold mb-2">Manage Users</h1>
          <p className="text-foreground/70">View and manage all user accounts</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Users</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username, email, or name..."
              className="w-full p-2 border-2 border-border rounded-base bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-2 border-2 border-border rounded-base bg-background"
            >
              <option value="all">All Roles</option>
              <option value="ROLE_USER">User</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_MODERATOR">Moderator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="text-sm text-foreground/70">Total Users</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{users.length}</div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="text-sm text-foreground/70">Active Users</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.enabled).length}
          </div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="text-sm text-foreground/70">Admins</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter(u => u.roles.includes('ROLE_ADMIN')).length}
          </div>
        </div>
        <div className="border-2 border-border rounded-base p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <div className="text-sm text-foreground/70">Filtered</div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{filteredUsers.length}</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border-2 border-border rounded-base overflow-hidden shadow-[var(--shadow)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-main text-main-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Roles</th>
                <th className="px-4 py-3 text-left font-semibold">Problems Solved</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-t-2 border-border ${index % 2 === 0 ? 'bg-background' : 'bg-background/50'}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.username}</div>
                    {user.fullName && (
                      <div className="text-sm text-foreground/70">{user.fullName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span
                          key={role}
                          className={`px-2 py-1 text-xs rounded-base border ${
                            role === 'ROLE_ADMIN'
                              ? 'bg-purple-100 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300'
                              : role === 'ROLE_MODERATOR'
                              ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-800 border-gray-500 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {role.replace('ROLE_', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold">{user.solvedProblems?.length || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-base border ${
                        user.enabled
                          ? 'bg-green-100 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded-base hover:bg-blue-600"
                        title="View Details"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(user.id, user.enabled)}
                        className={`px-2 py-1 text-xs rounded-base ${
                          user.enabled
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        title={user.enabled ? 'Disable' : 'Enable'}
                      >
                        {user.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded-base hover:bg-red-600"
                        title="Delete User"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-foreground/70">
            <div className="text-4xl mb-2">🔍</div>
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-border rounded-base p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">User Details</h2>
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
                  <p className="font-semibold">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Email</label>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Full Name</label>
                  <p className="font-semibold">{selectedUser.fullName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Status</label>
                  <p className="font-semibold">{selectedUser.enabled ? 'Active' : 'Disabled'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 mb-2 block">Roles</label>
                <div className="space-y-2">
                  {['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN'].map(role => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedUser.roles.includes(role)}
                        onChange={() => handleToggleRole(selectedUser.id, role)}
                        className="w-4 h-4"
                      />
                      <span>{role.replace('ROLE_', '')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70">Problems Solved</label>
                <p className="font-semibold text-2xl text-main">{selectedUser.solvedProblems?.length || 0}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70">Joined</label>
                <p className="font-semibold">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
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

export default ManageUsers;
