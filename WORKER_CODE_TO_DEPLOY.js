// Copy this ENTIRE code and paste into your Cloudflare Worker Editor
// This worker accepts any redirect_url and forwards OAuth tokens to it

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/google/auth') {
      // Get the redirect_url parameter (where to send the user after OAuth)
      const redirectUrl = url.searchParams.get('redirect_url');
      
      // Get OAuth parameters from Google's callback
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      const accessToken = url.searchParams.get('access_token');
      const idToken = url.searchParams.get('id_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const userInfo = url.searchParams.get('user_info');
      
      // Check if redirect_url is provided
      if (!redirectUrl) {
        return new Response('Missing redirect_url parameter', { status: 400 });
      }
      
      // If there's an error from Google, forward it
      if (error) {
        return Response.redirect(`${redirectUrl}?error=${encodeURIComponent(error)}`, 302);
      }
      
      // Build the redirect URL with all tokens and parameters
      const finalRedirectUrl = new URL(redirectUrl);
      
      // Add all available parameters to the redirect URL
      if (accessToken) finalRedirectUrl.searchParams.set('access_token', accessToken);
      if (idToken) finalRedirectUrl.searchParams.set('id_token', idToken);
      if (refreshToken && refreshToken !== 'undefined') finalRedirectUrl.searchParams.set('refresh_token', refreshToken);
      if (userInfo) finalRedirectUrl.searchParams.set('user_info', userInfo);
      if (code) finalRedirectUrl.searchParams.set('code', code);
      if (state) finalRedirectUrl.searchParams.set('state', state);
      
      // Redirect to the specified URL with all parameters
      return Response.redirect(finalRedirectUrl.toString(), 302);
    }
    
    return new Response('Worker is running. Use /google/auth?redirect_url=YOUR_URL for OAuth callback.', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
