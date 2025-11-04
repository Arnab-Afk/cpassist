import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Importing sample pages
import HomePage from './pages/HomePage';
import TopicsPage from './pages/TopicsPage';
import QuestionsPage from './pages/QuestionsPage';
import ProgressTrackerPage from './pages/ProgressTrackerPage';
import AddProgressPage from './pages/AddProgressPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthCallback from './pages/AuthCallback';
import BackgroundSquares from './components/BackgroundSquares';

// Import admin pages
import { 
  AdminDashboard, 
  ManageUsers, 
  ManageProblems, 
  ManageTopics, 
  ViewSubmissions 
} from './pages/admin';

// Import navigation menu and theme components
import MainNavigationMenu from './components/NavigationMenu';
import MobileMenu from './components/MobileMenu';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './lib/ThemeContext';
import { MobileMenuProvider } from './lib/MobileMenuContext';
import { isAuthenticated } from './lib/apiClient';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
    };
    
    checkAuth();
    
    // Listen for storage events (logout from another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <ThemeProvider>
      <MobileMenuProvider>
        <Router>
          {/* Background Squares */}
          <BackgroundSquares />
          
          <div className="min-h-screen flex flex-col bg-transparent dark:bg-gray-900/90 text-black dark:text-white relative z-1">
            <header className="py-4 px-6 border-b-2 border-border backdrop-blur-sm z-50 relative">
              <div className="container mx-auto flex justify-between items-center">
                <a href="/" className="text-xl font-bold">CP Assist</a>
                <div className="flex items-center gap-4">
                  <MainNavigationMenu />
                  {!isLoggedIn && (
                    <div className="hidden md:flex items-center gap-2">
                      <Link
                        to="/login"
                        className="px-4 py-2 rounded-base border-2 border-border bg-background text-foreground font-medium hover:translate-y-[-1px] transition-transform"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="px-4 py-2 rounded-base border-2 border-border bg-main text-main-foreground font-medium hover:translate-y-[-1px] transition-transform"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                  <ThemeToggle />
                </div>
              </div>
            </header>
            
            {/* Mobile Menu (outside header) */}
            <MobileMenu />
            
            {/* Rest of your app */}
            <main className="flex-grow py-4 z-10">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/topics" element={<TopicsPage />} />
                <Route path="/topics/:topicId" element={<TopicsPage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/questions/:difficulty" element={<QuestionsPage />} />
                <Route path="/progress" element={<ProgressTrackerPage />} />
                <Route path="/progress/add" element={<AddProgressPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/problems" element={<ManageProblems />} />
                <Route path="/admin/topics" element={<ManageTopics />} />
                <Route path="/admin/submissions" element={<ViewSubmissions />} />
              </Routes>
            </main>
          
          <footer className="py-4 px-6 border-t-2 border-border backdrop-blur-sm">
            <div className="container mx-auto text-center text-sm">
              <p>© {new Date().getFullYear()} CP Assist Platform. All rights reserved.</p>
              <p className="text-foreground/70">A platform for competitive programmers to practice and track DSA problems.</p>
            </div>
          </footer>
        </div>
        </Router>
      </MobileMenuProvider>
    </ThemeProvider>
  );
}

export default App;