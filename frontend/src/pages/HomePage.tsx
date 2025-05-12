import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      
      <section className="mb-16">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Master DSA with CP Assist</h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            Track your progress, practice problems, and improve your competitive programming skills.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/topics" 
              className="px-6 py-3 rounded-base border-2 border-border bg-main text-main-foreground font-medium shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform"
            >
              Explore Topics
            </Link>
            <Link 
              to="/questions" 
              className="px-6 py-3 rounded-base border-2 border-border bg-background text-foreground font-medium shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform"
            >
              Practice Problems
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <FeatureCard 
          title="Track Progress" 
          description="Monitor your solving history and improvement over time with visual analytics."
          link="/progress"
          linkText="View Progress"
        />
        <FeatureCard 
          title="Learn by Topic" 
          description="Master one topic at a time with organized problem sets and resources."
          link="/topics"
          linkText="Browse Topics"
        />
        <FeatureCard 
          title="Challenge Yourself" 
          description="Solve increasingly difficult problems to build your competitive edge."
          link="/questions"
          linkText="Start Practicing"
        />
      </section>

      <section className="border-2 border-border rounded-base p-6 bg-main text-main-foreground dark:bg-gray-800 dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Browse the topics and select one you want to master</li>
          <li>Solve problems from easy to hard difficulty</li>
          <li>Track your progress in the Progress Tracker</li>
          <li>Review previously solved problems to reinforce learning</li>
        </ol>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, link, linkText }: { 
  title: string; 
  description: string;
  link: string;
  linkText: string;
}) {
  return (
    <div className="border-2 border-border rounded-base bg-background p-6 shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform dark:bg-gray-800">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="mb-4">{description}</p>
      <Link 
        to={link} 
        className="inline-flex items-center font-medium text-main"
      >
        {linkText} →
      </Link>
    </div>
  );
}

export default HomePage;
