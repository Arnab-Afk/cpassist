import { useParams, Link } from 'react-router-dom';

// Detailed topic data
const topicsData = [
  {
    id: "arrays-strings",
    title: "Arrays & Strings",
    description: "Basic data structures for storing and manipulating collections of elements.",
    longDescription: "Arrays and strings are fundamental data structures used in nearly every program. Arrays store collections of items, while strings are sequences of characters. Mastering arrays includes understanding operations like searching, sorting, and manipulating elements efficiently.",
    subTopics: ["Two Pointers", "Sliding Window", "Prefix Sums", "String Manipulation"],
    easyQuestions: 15,
    mediumQuestions: 20,
    hardQuestions: 10,
    recommendations: [
      { id: 1, title: "Two Sum", difficulty: "easy" },
      { id: 2, title: "Valid Anagram", difficulty: "easy" },
      { id: 7, title: "Trapping Rain Water", difficulty: "hard" }
    ]
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    description: "A linear data structure consisting of nodes where each node points to the next node.",
    longDescription: "Linked lists consist of nodes connected by pointers. They allow dynamic memory allocation and efficient insertions/deletions. Types include singly linked lists, doubly linked lists, and circular linked lists. Key operations include traversal, insertion, deletion, and reversal.",
    subTopics: ["Singly Linked Lists", "Doubly Linked Lists", "Fast & Slow Pointers", "List Manipulation"],
    easyQuestions: 8,
    mediumQuestions: 12,
    hardQuestions: 6,
    recommendations: [
      { id: 3, title: "Merge Two Sorted Lists", difficulty: "easy" },
      { id: 4, title: "LRU Cache", difficulty: "medium" },
      { id: 8, title: "Merge k Sorted Lists", difficulty: "hard" }
    ]
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    description: "Abstract data types with specialized methods for insertion and removal of elements.",
    longDescription: "Stacks follow the Last-In-First-Out (LIFO) principle with push and pop operations. Queues follow the First-In-First-Out (FIFO) principle with enqueue and dequeue operations. Both are used in algorithm implementation, memory management, and parsing.",
    subTopics: ["Stack Implementation", "Queue Implementation", "Deque", "Monotonic Stack/Queue"],
    easyQuestions: 5,
    mediumQuestions: 10,
    hardQuestions: 5,
    recommendations: [
      { id: 2, title: "Valid Parentheses", difficulty: "easy" },
      { id: 10, title: "Min Stack", difficulty: "medium" },
      { id: 11, title: "Sliding Window Maximum", difficulty: "hard" }
    ]
  },
  {
    id: "trees-graphs",
    title: "Trees & Graphs",
    description: "Hierarchical data structures for representing relationships between nodes.",
    longDescription: "Trees are hierarchical structures with a root node and children. Graphs consist of vertices connected by edges, representing relationships between objects. Mastering these structures involves understanding traversal algorithms (BFS, DFS), shortest path algorithms, and minimum spanning trees.",
    subTopics: ["Binary Trees", "Binary Search Trees", "Graph Traversal", "Shortest Path", "Union Find"],
    easyQuestions: 6,
    mediumQuestions: 15,
    hardQuestions: 12,
    recommendations: [
      { id: 12, title: "Maximum Depth of Binary Tree", difficulty: "easy" },
      { id: 5, title: "Course Schedule", difficulty: "medium" },
      { id: 9, title: "Word Search II", difficulty: "hard" }
    ]
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    description: "Optimization technique that breaks down complex problems into simpler subproblems.",
    longDescription: "Dynamic Programming solves complex problems by breaking them down into simpler subproblems, solving each subproblem once, and storing the solutions. It is applicable to problems with overlapping subproblems and optimal substructure properties.",
    subTopics: ["1D DP", "2D DP", "State Compression", "Decision Making"],
    easyQuestions: 3,
    mediumQuestions: 12,
    hardQuestions: 15,
    recommendations: [
      { id: 13, title: "Climbing Stairs", difficulty: "easy" },
      { id: 6, title: "Longest Increasing Subsequence", difficulty: "medium" },
      { id: 14, title: "Regular Expression Matching", difficulty: "hard" }
    ]
  },
  {
    id: "sorting-searching",
    title: "Sorting & Searching",
    description: "Algorithms for arranging elements in a specific order and efficiently finding elements.",
    longDescription: "Sorting arranges elements in a specific order (ascending/descending), while searching finds the position of a target value. Popular sorting algorithms include Merge Sort, Quick Sort, and Heap Sort. Binary Search is a fundamental searching algorithm for sorted data.",
    subTopics: ["Merge Sort", "Quick Sort", "Binary Search", "Heap Sort"],
    easyQuestions: 4,
    mediumQuestions: 8,
    hardQuestions: 7,
    recommendations: [
      { id: 15, title: "First Bad Version", difficulty: "easy" },
      { id: 16, title: "Search in Rotated Sorted Array", difficulty: "medium" },
      { id: 17, title: "Median of Two Sorted Arrays", difficulty: "hard" }
    ]
  }
];

function TopicsPage() {
  const { topicId } = useParams();
  
  // Find the topic if topicId is provided
  const selectedTopic = topicId 
    ? topicsData.find(topic => topic.id === topicId) 
    : null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {selectedTopic ? (
        // Detailed view of a specific topic
        <div>
          <div className="mb-4">
            <Link to="/topics" className="text-main hover:underline">← Back to Topics</Link>
          </div>
          
          <div className="border-2 border-border rounded-base p-6 mb-8 bg-main text-main-foreground">
            <h1 className="text-3xl font-bold mb-2">{selectedTopic.title}</h1>
            <p className="text-lg">{selectedTopic.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border-2 border-border rounded-base p-4">
              <h3 className="text-xl font-bold mb-3">Questions</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Easy</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-base text-sm">
                    {selectedTopic.easyQuestions} Questions
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Medium</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-base text-sm">
                    {selectedTopic.mediumQuestions} Questions
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hard</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-base text-sm">
                    {selectedTopic.hardQuestions} Questions
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  to={`/questions?topic=${selectedTopic.id}`}
                  className="block w-full text-center px-4 py-2 bg-main text-main-foreground rounded-base"
                >
                  View All Questions
                </Link>
              </div>
            </div>
            
            <div className="border-2 border-border rounded-base p-4 md:col-span-2">
              <h3 className="text-xl font-bold mb-3">Description</h3>
              <p className="mb-4">{selectedTopic.longDescription}</p>
              
              <h4 className="font-semibold mb-2">Sub-topics:</h4>
              <ul className="list-disc list-inside mb-4 ml-4 space-y-1">
                {selectedTopic.subTopics.map((subTopic, index) => (
                  <li key={index}>{subTopic}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-2 border-border rounded-base p-4">
            <h3 className="text-xl font-bold mb-4">Recommended Problems</h3>
            <div className="space-y-3">
              {selectedTopic.recommendations.map(problem => (
                <div key={problem.id} className="flex justify-between items-center border-b border-border pb-3">
                  <span>{problem.title}</span>
                  <span className={`px-2 py-1 text-xs rounded-base ${
                    problem.difficulty === 'easy' 
                      ? 'bg-green-100 text-green-800' 
                      : problem.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <Link 
                to="/questions"
                className="px-4 py-2 bg-main text-main-foreground rounded-base inline-block"
              >
                View All Problems
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // List of all topics
        <div>
          <h1 className="text-3xl font-bold mb-6">DSA Topics</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicsData.map(topic => (
              <div 
                key={topic.id} 
                className="border-2 border-border rounded-base p-6 shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform"
              >
                <h3 className="text-xl font-bold mb-2">{topic.title}</h3>
                <p className="mb-4">{topic.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-base text-xs">
                    {topic.easyQuestions} Easy
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-base text-xs">
                    {topic.mediumQuestions} Medium
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-base text-xs">
                    {topic.hardQuestions} Hard
                  </span>
                </div>
                <Link 
                  to={`/topics/${topic.id}`}
                  className="inline-flex items-center font-medium text-main"
                >
                  Explore Topic →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicsPage;
