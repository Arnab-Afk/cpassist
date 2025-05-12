import { Link } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { useMobileMenu } from '@/lib/MobileMenuContext';
import './MobileMenu.css';

// Re-using the topics from NavigationMenu
const dsaTopics: { title: string; href: string; description: string }[] = [
  {
    title: "Arrays & Strings",
    href: "/topics/arrays-strings",
    description:
      "Basic data structures for storing and manipulating collections of elements.",
  },
  {
    title: "Linked Lists",
    href: "/topics/linked-lists",
    description:
      "A linear data structure consisting of nodes where each node points to the next node.",
  },
  {
    title: "Stacks & Queues",
    href: "/topics/stacks-queues",
    description:
      "Abstract data types with specialized methods for insertion and removal of elements.",
  },
  {
    title: "Trees & Graphs",
    href: "/topics/trees-graphs",
    description: 
      "Hierarchical data structures for representing relationships between nodes.",
  },
  {
    title: "Dynamic Programming",
    href: "/topics/dynamic-programming",
    description:
      "Optimization technique that breaks down complex problems into simpler subproblems.",
  },
  {
    title: "Sorting & Searching",
    href: "/topics/sorting-searching",
    description:
      "Algorithms for arranging elements in a specific order and efficiently finding elements.",
  },
];

export default function MobileMenu() {
  const { mobileMenuOpen, toggleMobileMenu } = useMobileMenu();

  if (!mobileMenuOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 md:hidden mobile-menu-overlay"
        onClick={toggleMobileMenu} // Close when clicking outside
        aria-hidden="true"
      />
      
      {/* Menu Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-background dark:bg-gray-900 shadow-xl z-50 md:hidden mobile-menu-panel">
        <div className="h-full flex flex-col overflow-y-auto p-6">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-border dark:border-gray-700">
            <h2 className="text-xl font-bold">CP Assist</h2>
            <button 
              onClick={toggleMobileMenu} 
              className="p-2 rounded-md hover:bg-accent/30 transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-6">
            {/* Topics Section */}
            <div className="border-b border-border dark:border-gray-700 pb-4">
              <h3 className="text-lg font-medium mb-3">DSA Topics</h3>
              <div className="grid grid-cols-1 gap-3 pl-2">
                {dsaTopics.map((topic) => (
                  <Link 
                    key={topic.title}
                    to={topic.href} 
                    className="flex items-center text-base py-2 hover:text-primary dark:hover:text-primary transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    <ChevronRight size={16} className="mr-2 flex-shrink-0 text-muted-foreground" />
                    <span>{topic.title}</span>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Practice Section */}
            <div className="border-b border-border dark:border-gray-700 pb-4">
              <h3 className="text-lg font-medium mb-3">Practice</h3>
              <div className="grid grid-cols-1 gap-3 pl-2">
                <Link 
                  to="/questions" 
                  className="flex items-center text-base py-2 hover:text-primary dark:hover:text-primary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  <ChevronRight size={16} className="mr-2 flex-shrink-0 text-muted-foreground" />
                  <span>All Problems</span>
                </Link>
                <Link 
                  to="/questions/easy" 
                  className="flex items-center text-base py-2 hover:text-primary dark:hover:text-primary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  <ChevronRight size={16} className="mr-2 flex-shrink-0 text-muted-foreground" />
                  <span>Easy Problems</span>
                </Link>
                <Link 
                  to="/questions/medium" 
                  className="flex items-center text-base py-2 hover:text-primary dark:hover:text-primary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  <ChevronRight size={16} className="mr-2 flex-shrink-0 text-muted-foreground" />
                  <span>Medium Problems</span>
                </Link>
                <Link 
                  to="/questions/hard" 
                  className="flex items-center text-base py-2 hover:text-primary dark:hover:text-primary transition-colors"
                  onClick={toggleMobileMenu}
                >
                  <ChevronRight size={16} className="mr-2 flex-shrink-0 text-muted-foreground" />
                  <span>Hard Problems</span>
                </Link>
              </div>
            </div>
            
            {/* Other Main Links */}
            <div>
              <Link 
                to="/progress" 
                className="flex items-center text-lg font-medium py-3 hover:text-primary dark:hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
              >
                Progress Tracker
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center text-lg font-medium py-3 hover:text-primary dark:hover:text-primary transition-colors"
                onClick={toggleMobileMenu}
              >
                Profile
              </Link>
            </div>
          </div>
          
          {/* Extra space at the bottom */}
          <div className="py-6 mt-auto text-center text-sm text-foreground/70 border-t border-border dark:border-gray-700 pt-4">
            <p>© {new Date().getFullYear()} CP Assist</p>
            <p className="text-xs mt-1">A platform for competitive programmers</p>
          </div>
        </div>
      </div>
    </>
  );
}
