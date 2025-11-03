# Cloudflare Worker for Google OAuth Redirect

This Cloudflare Worker acts as a proxy for Google OAuth callbacks, forwarding them to your backend.

## Worker Code

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Only handle the /google/auth path
  if (url.pathname === '/google/auth') {
    // Get query parameters from Google's callback
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    
    // Build the backend callback URL
    const backendUrl = 'http://localhost:8080/api/auth/google/callback'
    const backendCallbackUrl = new URL(backendUrl)
    
    // Forward all query parameters
    if (code) backendCallbackUrl.searchParams.set('code', code)
    if (state) backendCallbackUrl.searchParams.set('state', state)
    if (error) backendCallbackUrl.searchParams.set('error', error)
    
    // Redirect to backend
    return Response.redirect(backendCallbackUrl.toString(), 302)
  }
  
  // Return 404 for other paths
  return new Response('Not Found', { status: 404 })
}
```

## Deployment Steps

### Option 1: Using Wrangler CLI

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create a new Worker**:
   ```bash
   wrangler init google-oauth-proxy
   cd google-oauth-proxy
   ```

4. **Edit `wrangler.toml`**:
   ```toml
   name = "google-oauth-proxy"
   main = "src/worker.js"
   compatibility_date = "2025-11-03"
   
   [env.production]
   name = "google-oauth-proxy"
   route = "small-mouse-2759.arnabbhowmik019.workers.dev/google/auth"
   ```

5. **Create `src/worker.js`** with the code above

6. **Deploy**:
   ```bash
   wrangler deploy
   ```

### Option 2: Using Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Click on "Workers & Pages"
3. Click "Create Application" > "Create Worker"
4. Name it "google-oauth-proxy"
5. Paste the worker code above
6. Click "Save and Deploy"
7. Your worker will be available at: `https://google-oauth-proxy.YOUR_SUBDOMAIN.workers.dev`

## Important Notes

1. **Update Backend URL**: Once you deploy to production, update the `backendUrl` in the worker code from `localhost` to your production backend URL.

2. **CORS**: Make sure your backend allows requests from the Cloudflare Worker domain.

3. **Security**: The worker simply forwards the OAuth callback. All security validation happens in your backend.

## Testing

After deployment, test the flow:

1. Go to your frontend and click "Sign in with Google"
2. Authorize with Google
3. Google redirects to: `https://small-mouse-2759.arnabbhowmik019.workers.dev/google/auth?code=...&state=...`
4. Worker redirects to: `http://localhost:8080/api/auth/google/callback?code=...&state=...`
5. Backend processes the callback and redirects to frontend with tokens

## Current Status

⚠️ **The Cloudflare Worker is not yet deployed.** You need to deploy it before testing the complete OAuth flow.

Your worker should be available at:
- **Development**: Can use localhost backend directly for testing
- **Production**: Update worker code with production backend URL
