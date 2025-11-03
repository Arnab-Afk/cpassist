/**
 * Cloudflare Worker for Google OAuth Redirect
 * 
 * This worker receives the OAuth callback from Google and forwards it to your backend.
 * Deploy this to: small-mouse-2759.arnabbhowmik019.workers.dev
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only handle /google/auth path
    if (url.pathname === '/google/auth') {
      // Get the authorization code and state from Google's callback
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state'); // This contains the frontend redirect URL
      const error = url.searchParams.get('error');
      
      // Log for debugging
      console.log('Received callback:', { code: code ? 'present' : 'missing', state, error });
      
      // If there's an error from Google, redirect to frontend with error
      if (error) {
        const frontendUrl = state || 'http://localhost:5173/auth/callback';
        return Response.redirect(`${frontendUrl}?error=${encodeURIComponent(error)}`, 302);
      }
      
      // If code is missing, return error
      if (!code) {
        return new Response('Missing authorization code', { status: 400 });
      }
      
      // If state is missing, return error
      if (!state) {
        return new Response('Missing state parameter (frontend redirect URL)', { status: 400 });
      }
      
      // Forward to backend callback endpoint
      // Change this URL to your production backend URL when deploying
      const backendUrl = env.BACKEND_URL || 'http://localhost:8080/api';
      const backendCallbackUrl = `${backendUrl}/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      
      console.log('Forwarding to backend:', backendCallbackUrl);
      
      // Redirect to backend, which will process and redirect to frontend
      return Response.redirect(backendCallbackUrl, 302);
    }
    
    // For any other path, return 404
    return new Response('Not Found', { status: 404 });
  },
};
