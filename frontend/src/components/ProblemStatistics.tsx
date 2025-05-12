import { useMemo } from 'react';

interface ProblemStatisticsProps {
  totalCompleted: number;
  totalAvailable: number;
  byDifficulty?: {
    easy: { completed: number; total: number };
    medium: { completed: number; total: number };
    hard: { completed: number; total: number };
  };
  className?: string;
}

export default function ProblemStatistics({ 
  totalCompleted, 
  totalAvailable,
  byDifficulty,
  className = "" 
}: ProblemStatisticsProps) {
  const percentage = useMemo(() => 
    Math.round((totalCompleted / totalAvailable) * 100), 
    [totalCompleted, totalAvailable]
  );

  return (
    <div className={`rounded-base border-2 border-border p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Problem Statistics</h3>
        <span className="text-xl font-bold">{percentage}%</span>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div 
            className="bg-main h-2.5 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="text-sm text-right">
          {totalCompleted} of {totalAvailable} problems solved
        </div>
      </div>
      
      {byDifficulty && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-green-800">Easy</span>
              <span className="text-sm text-green-800">
                {byDifficulty.easy.completed} / {byDifficulty.easy.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${(byDifficulty.easy.completed / byDifficulty.easy.total) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-yellow-800">Medium</span>
              <span className="text-sm text-yellow-800">
                {byDifficulty.medium.completed} / {byDifficulty.medium.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-yellow-500 h-1.5 rounded-full" 
                style={{ width: `${(byDifficulty.medium.completed / byDifficulty.medium.total) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-red-800">Hard</span>
              <span className="text-sm text-red-800">
                {byDifficulty.hard.completed} / {byDifficulty.hard.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-red-500 h-1.5 rounded-full" 
                style={{ width: `${(byDifficulty.hard.completed / byDifficulty.hard.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
