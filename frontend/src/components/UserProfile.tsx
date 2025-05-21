import React from 'react';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { CalendarIcon, TrophyIcon, StarIcon, UserIcon } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [userProfilePic ]= useState(user?.profilePicture);
  if (!user) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-border overflow-hidden">
      {/* Header with profile picture and name */}
      <div className="relative bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-8">
        <div className="flex items-center">
          {user.profilePicture ? (
            <img 
              src={userProfilePic}
              alt={`${user.name}'s profile`} 
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center">
              <UserIcon size={32} className="text-gray-500" />
            </div>
          )}
          
          <div className="ml-6">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-white/80">@{user.username}</p>
            <div className="flex items-center mt-2">
              <CalendarIcon size={14} className="mr-1" />
              <span className="text-sm">Joined {new Date(user.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* User stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-border/50">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <TrophyIcon size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
              <p className="text-2xl font-bold">{user.currentStreak} days</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-border/50">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
              <StarIcon size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Longest Streak</h3>
              <p className="text-2xl font-bold">{user.longestStreak} days</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-border/50">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
              <UserIcon size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Current Rank</h3>
              <p className="text-2xl font-bold">{user.rank || 'Beginner'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional profile information can be added here */}
    </div>
  );
};

export default UserProfile;
