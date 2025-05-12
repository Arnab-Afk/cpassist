import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importing sample pages
import HomePage from './pages/HomePage';
import TopicsPage from './pages/TopicsPage';
import QuestionsPage from './pages/QuestionsPage';
import ProgressTrackerPage from './pages/ProgressTrackerPage';
import ProfilePage from './pages/ProfilePage';
import BackgroundSquares from './components/BackgroundSquares';

// Import navigation menu and theme components
import MainNavigationMenu from './components/NavigationMenu';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './lib/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Background Squares */}
        <BackgroundSquares />
        
        <div className="min-h-screen flex flex-col bg-transparent dark:bg-gray-900/90 text-black dark:text-white">
          <header className="py-4 px-6 border-b-2 border-border backdrop-blur-sm">
            <div className="container mx-auto flex justify-between items-center">
              <a href="/" className="text-xl font-bold">CP Assist</a>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <MainNavigationMenu />
              </div>
            </div>
          </header>
          
          {/* Rest of your app */}
          <main className="flex-grow py-4 z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/topics" element={<TopicsPage />} />
              <Route path="/topics/:topicId" element={<TopicsPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/questions/:difficulty" element={<QuestionsPage />} />
              <Route path="/progress" element={<ProgressTrackerPage />} />
              <Route path="/profile" element={<ProfilePage />} />
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
    </ThemeProvider>
  );
}

export default App;