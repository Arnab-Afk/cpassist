/**
 * UPDATED Cloudflare Worker for Google OAuth Redirect
 * Deploy this version to fix the "Missing redirect_uri parameter" error
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle /google/auth path
    if (url.pathname === '/google/auth') {
      // Get parameters from Google's callback
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state'); // Frontend callback URL
      const error = url.searchParams.get('error');
      
      // Log for debugging (visible in Cloudflare dashboard)
      console.log('Worker received:', {
        path: url.pathname,
        code: code ? 'YES' : 'NO',
        state: state || 'MISSING',
        error: error || 'NONE',
        allParams: Object.fromEntries(url.searchParams)
      });
      
      // Handle error from Google
      if (error) {
        const frontendUrl = state || 'http://localhost:5173/auth/callback';
        return Response.redirect(`${frontendUrl}?error=${encodeURIComponent(error)}`, 302);
      }
      
      // Validate required parameters
      if (!code) {
        return new Response(JSON.stringify({
          error: 'Missing authorization code',
          received_params: Object.fromEntries(url.searchParams)
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (!state) {
        return new Response(JSON.stringify({
          error: 'Missing state parameter (frontend redirect URL)',
          received_params: Object.fromEntries(url.searchParams)
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Build backend callback URL
      // IMPORTANT: Change this to your production backend URL when deploying to production
      const backendUrl = env.BACKEND_URL || 'http://localhost:8080/api';
      const backendCallback = new URL(`${backendUrl}/auth/google/callback`);
      
      // Add parameters
      backendCallback.searchParams.set('code', code);
      backendCallback.searchParams.set('state', state);
      
      console.log('Redirecting to backend:', backendCallback.toString());
      
      // Redirect to backend
      return Response.redirect(backendCallback.toString(), 302);
    }
    
    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'ok',
        worker: 'google-oauth-proxy',
        timestamp: new Date().toISOString(),
        env: {
          BACKEND_URL: env.BACKEND_URL || 'not set (using default)'
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 404 for other paths
    return new Response('Not Found', { status: 404 });
  },
};
