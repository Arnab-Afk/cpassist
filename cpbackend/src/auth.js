/**
 * Simple token implementation without jos
 * Note: In production, you should use a proper JWT library
 */

// Secret key for token signing - in production, use env.JWT_SECRET
const TOKEN_SECRET = 'cpassist'; 

/**
 * Handle Google Authentication
 */
export async function handleAuth(request) {
  try {
    const { accessToken } = await request.json();
    
    if (!accessToken) {
      return { 
        error: 'Access token is required',
        status: 400
      };
    }
    
    // Verify the Google token by making a request to Google's API
    const googleResponse = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );
    
    if (!googleResponse.ok) {
      return {
        error: 'Invalid Google token',
        status: 401
      };
    }
    
    const googleUser = await googleResponse.json();
    
    // Check if user exists in our database
    const db = request.env.DB;
    let user = await db.prepare(
      'SELECT * FROM users WHERE google_id = ?'
    ).bind(googleUser.sub).first();
    
    // If user doesn't exist, create a new user
    if (!user) {
      // Generate a unique username based on email or name
      let username = googleUser.email.split('@')[0];
      
      // Check if username already exists
      const existingUsername = await db.prepare(
        'SELECT username FROM users WHERE username = ?'
      ).bind(username).first();
      
      // If username exists, append a random number
      if (existingUsername) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
      }
      
      // Insert new user
      await db.prepare(
        `INSERT INTO users 
         (google_id, name, email, username, profile_picture_url) 
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        googleUser.sub,
        googleUser.name,
        googleUser.email,
        username,
        googleUser.picture
      ).run();
      
      // Get the newly created user
      user = await db.prepare(
        'SELECT * FROM users WHERE google_id = ?'
      ).bind(googleUser.sub).first();
      
      // Create default preferences for the new user
      await db.prepare(
        `INSERT INTO user_preferences (user_id) VALUES (?)`
      ).bind(user.user_id).run();
    } else {
      // Update the user's last login date
      await db.prepare(
        `UPDATE users 
         SET last_login_date = CURRENT_TIMESTAMP 
         WHERE user_id = ?`
      ).bind(user.user_id).run();
    }
    
    // Generate simple token with expiration
    const token = generateToken({
      sub: user.user_id.toString(),
      name: user.name,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    });
    
    return { 
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        username: user.username,
        profilePicture: user.profile_picture_url,
        joinDate: user.join_date,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
        rank: user.rank
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      error: 'Authentication failed',
      details: error.message,
      status: 500
    };
  }
}

/**
 * Validate token middleware
 */
export async function validateToken(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        error: 'Authorization header required',
        status: 401
      };
    }
    
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload) {
      return { 
        error: 'Invalid or expired token',
        status: 401
      };
    }
    
    // Check token expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { 
        error: 'Token expired',
        status: 401
      };
    }
    
    // Attach user ID to request for use in route handlers
    request.userId = parseInt(payload.sub);
    
    // Token is valid
    return {};
  } catch (error) {
    console.error('Token validation error:', error);
    return { 
      error: 'Invalid token',
      details: error.message,
      status: 401
    };
  }
}

/**
 * Generate a simple token
 * Note: This is a simplified implementation. In production, use proper JWT libraries
 */
function generateToken(payload) {
  const base64Payload = btoa(JSON.stringify(payload));
  const signature = btoa(hmacSign(base64Payload, TOKEN_SECRET));
  return `${base64Payload}.${signature}`;
}

/**
 * Verify a token
 */
function verifyToken(token) {
  try {
    const [base64Payload, signature] = token.split('.');
    const expectedSignature = btoa(hmacSign(base64Payload, TOKEN_SECRET));
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    return JSON.parse(atob(base64Payload));
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Simple HMAC-like function for signing
 * Note: This is for demonstration. In production, use crypto libraries
 */
function hmacSign(message, secret) {
  let signature = '';
  for (let i = 0; i < message.length; i++) {
    signature += String.fromCharCode(message.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
  }
  return signature;
}