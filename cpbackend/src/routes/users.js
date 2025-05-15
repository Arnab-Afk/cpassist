/**
 * Get current user information
 */
export async function getCurrentUser(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    const user = await db.prepare(
      'SELECT * FROM users WHERE user_id = ?'
    ).bind(userId).first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      id: user.user_id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePicture: user.profile_picture_url,
      joinDate: user.join_date,
      currentStreak: user.current_streak,
      longestStreak: user.longest_streak,
      rank: user.rank
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update current user information
 */
export async function updateCurrentUser(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    const updates = await request.json();
    
    // Only allow updating specific fields
    const allowedUpdates = ['name', 'username', 'profile_picture_url'];
    const updateData = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // If username is being updated, check it's not already taken
    if (updateData.username) {
      const existingUser = await db.prepare(
        'SELECT user_id FROM users WHERE username = ? AND user_id != ?'
      ).bind(updateData.username, userId).first();
      
      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Username already taken' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Construct SQL update statement
    const setStatements = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), userId];
    
    await db.prepare(
      `UPDATE users SET ${setStatements} WHERE user_id = ?`
    ).bind(...values).run();
    
    // Get updated user data
    const updatedUser = await db.prepare(
      'SELECT * FROM users WHERE user_id = ?'
    ).bind(userId).first();
    
    return new Response(JSON.stringify({
      id: updatedUser.user_id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      profilePicture: updatedUser.profile_picture_url,
      joinDate: updatedUser.join_date,
      currentStreak: updatedUser.current_streak,
      longestStreak: updatedUser.longest_streak,
      rank: updatedUser.rank
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get user by ID (admin or self only)
 */
export async function getUserById(request) {
  try {
    const requestedUserId = parseInt(request.params.id);
    const currentUserId = request.userId;
    
    // Only allow users to access their own data (could add admin check here)
    if (requestedUserId !== currentUserId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Use getCurrentUser since it's the same user
    return getCurrentUser(request);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get user's linked platform accounts
 */
export async function getUserPlatforms(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    const platforms = await db.prepare(
      'SELECT * FROM platform_accounts WHERE user_id = ?'
    ).bind(userId).all();
    
    return new Response(JSON.stringify(platforms.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve platforms' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Link a new platform account
 */
export async function linkPlatform(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    const { platform, username, profileUrl } = await request.json();
    
    if (!platform || !username) {
      return new Response(JSON.stringify({ error: 'Platform and username are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if platform already linked
    const existingPlatform = await db.prepare(
      'SELECT * FROM platform_accounts WHERE user_id = ? AND platform = ?'
    ).bind(userId, platform).first();
    
    if (existingPlatform) {
      // Update existing platform link
      await db.prepare(
        `UPDATE platform_accounts 
         SET username = ?, profile_url = ?, last_sync_date = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND platform = ?`
      ).bind(username, profileUrl, userId, platform).run();
    } else {
      // Create new platform link
      await db.prepare(
        `INSERT INTO platform_accounts (user_id, platform, username, profile_url, last_sync_date) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).bind(userId, platform, username, profileUrl).run();
    }
    
    const updatedPlatforms = await db.prepare(
      'SELECT * FROM platform_accounts WHERE user_id = ?'
    ).bind(userId).all();
    
    return new Response(JSON.stringify(updatedPlatforms.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to link platform' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Unlink a platform account
 */
export async function unlinkPlatform(request) {
  try {
    const userId = request.userId;
    const platform = request.params.platform;
    const db = request.env.DB;
    
    await db.prepare(
      'DELETE FROM platform_accounts WHERE user_id = ? AND platform = ?'
    ).bind(userId, platform).run();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to unlink platform' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get user notifications
 */
export async function getNotifications(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    const notifications = await db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).bind(userId).all();
    
    return new Response(JSON.stringify(notifications.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve notifications' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(request) {
  try {
    const userId = request.userId;
    const notificationId = parseInt(request.params.id);
    const db = request.env.DB;
    
    // Verify the notification belongs to the user
    const notification = await db.prepare(
      'SELECT * FROM notifications WHERE notification_id = ? AND user_id = ?'
    ).bind(notificationId, userId).first();
    
    if (!notification) {
      return new Response(JSON.stringify({ error: 'Notification not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await db.prepare(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ?'
    ).bind(notificationId).run();
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to mark notification as read' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}