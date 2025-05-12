import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// Mock data for our questions
const mockQuestions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "easy",
    topic: "arrays-strings",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    solved: true
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "easy",
    topic: "stacks-queues",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    solved: true
  },
  {
    id: 3,
    title: "Merge Two Sorted Lists",
    difficulty: "easy",
    topic: "linked-lists",
    description: "Merge two sorted linked lists and return it as a sorted list.",
    solved: false
  },
  {
    id: 4,
    title: "LRU Cache",
    difficulty: "medium",
    topic: "linked-lists",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
    solved: false
  },
  {
    id: 5,
    title: "Course Schedule",
    difficulty: "medium",
    topic: "trees-graphs",
    description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.",
    solved: false
  },
  {
    id: 6,
    title: "Longest Increasing Subsequence",
    difficulty: "medium",
    topic: "dynamic-programming",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    solved: true
  },
  {
    id: 7,
    title: "Trapping Rain Water",
    difficulty: "hard",
    topic: "arrays-strings",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    solved: false
  },
  {
    id: 8,
    title: "Merge k Sorted Lists",
    difficulty: "hard",
    topic: "linked-lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    solved: false
  },
  {
    id: 9,
    title: "Word Search II",
    difficulty: "hard",
    topic: "trees-graphs",
    description: "Given an m x n board of characters and a list of strings words, return all words on the board.",
    solved: false
  }
];

function QuestionsPage() {
  const { difficulty } = useParams();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter questions based on difficulty, topic, and search query
  const filteredQuestions = mockQuestions.filter(question => {
    // Filter by difficulty if provided
    if (difficulty && question.difficulty !== difficulty) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {difficulty 
          ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} DSA Problems` 
          : "DSA Problems"}
      </h1>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/4">
          <div className="border-2 border-border rounded-base p-4 mb-6">
            <h2 className="text-xl font-semibold mb-3">Filter by Topic</h2>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedTopic(null)}
                className={`w-full text-left px-3 py-2 rounded-base ${!selectedTopic ? 'bg-main text-main-foreground' : ''}`}
              >
                All Topics
              </button>
              <button 
                onClick={() => setSelectedTopic('arrays-strings')}
                className={`w-full text-left px-3 py-2 rounded-base ${selectedTopic === 'arrays-strings' ? 'bg-main text-main-foreground' : ''}`}
              >
                Arrays & Strings
              </button>
              <button 
                onClick={() => setSelectedTopic('linked-lists')}
                className={`w-full text-left px-3 py-2 rounded-base ${selectedTopic === 'linked-lists' ? 'bg-main text-main-foreground' : ''}`}
              >
                Linked Lists
              </button>
              <button 
                onClick={() => setSelectedTopic('stacks-queues')}
                className={`w-full text-left px-3 py-2 rounded-base ${selectedTopic === 'stacks-queues' ? 'bg-main text-main-foreground' : ''}`}
              >
                Stacks & Queues
              </button>
              <button 
                onClick={() => setSelectedTopic('trees-graphs')}
                className={`w-full text-left px-3 py-2 rounded-base ${selectedTopic === 'trees-graphs' ? 'bg-main text-main-foreground' : ''}`}
              >
                Trees & Graphs
              </button>
              <button 
                onClick={() => setSelectedTopic('dynamic-programming')}
                className={`w-full text-left px-3 py-2 rounded-base ${selectedTopic === 'dynamic-programming' ? 'bg-main text-main-foreground' : ''}`}
              >
                Dynamic Programming
              </button>
            </div>
          </div>
          
          <div className="border-2 border-border rounded-base p-4">
            <h2 className="text-xl font-semibold mb-3">Filter by Difficulty</h2>
            <div className="space-y-2">
              <Link 
                to="/questions"
                className={`block px-3 py-2 rounded-base ${!difficulty ? 'bg-main text-main-foreground' : ''}`}
              >
                All Difficulties
              </Link>
              <Link 
                to="/questions/easy"
                className={`block px-3 py-2 rounded-base ${difficulty === 'easy' ? 'bg-main text-main-foreground' : ''}`}
              >
                Easy
              </Link>
              <Link 
                to="/questions/medium"
                className={`block px-3 py-2 rounded-base ${difficulty === 'medium' ? 'bg-main text-main-foreground' : ''}`}
              >
                Medium
              </Link>
              <Link 
                to="/questions/hard"
                className={`block px-3 py-2 rounded-base ${difficulty === 'hard' ? 'bg-main text-main-foreground' : ''}`}
              >
                Hard
              </Link>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-3/4">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search problems..."
              className="w-full px-4 py-2 border-2 border-border rounded-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(question => (
                <div 
                  key={question.id}
                  className="border-2 border-border rounded-base p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{question.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-base ${
                        question.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-800' 
                          : question.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                      </span>
                      {question.solved && (
                        <span className="px-2 py-1 text-xs bg-main text-main-foreground rounded-base">
                          Solved
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mb-3">{question.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70">
                      Topic: {question.topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <button className="px-3 py-1 bg-main text-main-foreground rounded-base text-sm">
                      {question.solved ? 'Revisit' : 'Solve'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-border rounded-base">
                <p>No questions found matching your filters.</p>
                <button 
                  onClick={() => {
                    setSelectedTopic(null);
                    setSearchQuery("");
                  }}
                  className="mt-2 px-4 py-2 bg-main text-main-foreground rounded-base"
                >
                  Clear Filters
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
