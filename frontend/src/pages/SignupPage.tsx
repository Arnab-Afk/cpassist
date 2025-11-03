import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { authAPI } from '../lib/apiClient';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signup(
        formData.username,
        formData.email,
        formData.password
      );
      
      // Store tokens and user info
      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('refresh_token', response.data.refreshToken);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('email', response.data.email);
      
      // Redirect to profile
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="border-2 border-border rounded-base bg-background p-8 shadow-[var(--shadow)] dark:bg-gray-800">
          <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>
          
          {error && (
            <div className="mb-4 p-3 rounded-base border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-main dark:bg-gray-700"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-main dark:bg-gray-700"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-main dark:bg-gray-700"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-base border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-main dark:bg-gray-700"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-base border-2 border-border bg-main text-main-foreground font-medium shadow-[var(--shadow)] hover:translate-y-[-2px] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background dark:bg-gray-800 text-foreground/70">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleLoginButton
            callbackUrl={import.meta.env.VITE_OAUTH_CALLBACK_URL || 'http://localhost:5173/auth/callback'}
            onError={handleGoogleError}
          />

          <div className="mt-6 text-center text-sm">
            <span className="text-foreground/70">Already have an account? </span>
            <Link to="/login" className="font-medium text-main hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
