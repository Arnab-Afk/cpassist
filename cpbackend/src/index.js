import { handleAuth, validateToken } from './auth.js';
import { handleCors, errorHandler } from './middleware.js';
import * as userRoutes from './routes/users.js';
import * as problemRoutes from './routes/problems.js';
import * as progressRoutes from './routes/progress.js';
import * as badgeRoutes from './routes/badges.js';
import * as activityRoutes from './routes/activity.js';
import * as preferenceRoutes from './routes/preferences.js';

// Path-to-handler mapping for GET requests
const getRoutes = {
  '/users/me': userRoutes.getCurrentUser,
  '/users': userRoutes.getUserById,
  '/problems': problemRoutes.getAllProblems,
  '/problems/': problemRoutes.getProblemById,
  '/topics': problemRoutes.getAllTopics,
  '/topics/problems': problemRoutes.getProblemsByTopic,
  '/progress': progressRoutes.getUserProgress,
  '/progress/': progressRoutes.getProgressForProblem,
  '/badges': badgeRoutes.getAllBadges,
  '/badges/user': badgeRoutes.getUserBadges,
  '/milestones': badgeRoutes.getAllMilestones,
  '/milestones/user': badgeRoutes.getUserMilestones,
  '/activity': activityRoutes.getUserActivity,
  '/platforms': userRoutes.getUserPlatforms,
  '/notifications': userRoutes.getNotifications,
  '/preferences': preferenceRoutes.getUserPreferences,
  '/debug': () => ({ status: 'ok', message: 'Worker is functioning correctly', time: new Date().toISOString() }),
  '/health': () => ({ status: 'ok' })
};

// Path-to-handler mapping for POST requests
const postRoutes = {
  '/auth/google': handleAuth,
  '/progress/': progressRoutes.updateProgress,
  '/activity/today': activityRoutes.updateTodayActivity,
  '/platforms': userRoutes.linkPlatform
};

// Path-to-handler mapping for PUT requests
const putRoutes = {
  '/users/me': userRoutes.updateCurrentUser,
  '/preferences': preferenceRoutes.updateUserPreferences,
  '/notifications/read': userRoutes.markNotificationRead
};

// Path-to-handler mapping for DELETE requests
const deleteRoutes = {
  '/platforms/': userRoutes.unlinkPlatform
};

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCors(request);
    }

    // Attach env to request for database access
    request.env = env;

    try {
      // Check if database binding exists
      if (!env.DB) {
        throw new Error('Database binding not configured. Please check your wrangler.toml file.');
      }

      const url = new URL(request.url);
      const path = url.pathname;
      
      // Debug endpoint - no auth required
      if (path === '/debug' || path === '/health') {
        const handler = getRoutes[path];
        const result = handler ? await handler(request) : { error: 'Not Found', status: 404 };
        return createJsonResponse(result, result.status || 200);
      }

      // Auth endpoint - no auth required
      if (path === '/auth/google' && request.method === 'POST') {
        const result = await handleAuth(request);
        return createJsonResponse(result);
      }

      // All other routes require authentication
      const authResult = await validateToken(request);
      if (authResult.error) {
        return createJsonResponse(authResult, authResult.status || 401);
      }

      // Find the appropriate route handler based on method and path
      let handler = null;
      let params = {};
      
      if (request.method === 'GET') {
        [handler, params] = findHandler(getRoutes, path);
      } else if (request.method === 'POST') {
        [handler, params] = findHandler(postRoutes, path);
      } else if (request.method === 'PUT') {
        [handler, params] = findHandler(putRoutes, path);
      } else if (request.method === 'DELETE') {
        [handler, params] = findHandler(deleteRoutes, path);
      }

      // 404 if no handler is found
      if (!handler) {
        return createJsonResponse({ error: 'Not Found' }, 404);
      }

      // Add params to request
      request.params = params;

      // Execute the handler
      const result = await handler(request);
      return createJsonResponse(result);
    } catch (error) {
      console.error('Worker error:', error.message, error.stack);
      return createJsonResponse({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        code: 1101,
      }, 500);
    }
  }
};

/**
 * Find a handler that matches the given path
 */
function findHandler(routeMap, path) {
  // First check for exact matches
  if (routeMap[path]) {
    return [routeMap[path], {}];
  }
  
  // Check for parameterized routes
  const pathParts = path.split('/').filter(Boolean);
  
  for (const [route, handler] of Object.entries(routeMap)) {
    const routeParts = route.split('/').filter(Boolean);
    
    // Skip if different number of parts (except for trailing slash routes)
    if (!route.endsWith('/') && routeParts.length !== pathParts.length) {
      continue;
    }
    
    // For trailing slash routes, we expect one more parameter
    if (route.endsWith('/') && routeParts.length !== pathParts.length - 1) {
      continue;
    }
    
    // Check if route matches
    let matches = true;
    const params = {};
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i] !== pathParts[i]) {
        matches = false;
        break;
      }
    }
    
    if (matches && route.endsWith('/')) {
      // Capture the last part as a parameter
      const paramName = route.split('/').filter(Boolean).pop();
      params[paramName] = pathParts[routeParts.length];
      return [handler, params];
    }
    
    if (matches) {
      return [handler, params];
    }
  }
  
  return [null, {}];
}

/**
 * Create a JSON response with CORS headers
 */
function createJsonResponse(data, status = 200) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  // Handle response objects
  if (data instanceof Response) {
    const newHeaders = new Headers(data.headers);
    for (const [key, value] of Object.entries(headers)) {
      newHeaders.set(key, value);
    }
    return new Response(data.body, {
      status: data.status,
      headers: newHeaders
    });
  }
  
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}