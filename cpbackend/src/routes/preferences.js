/**
 * Get user preferences
 */
export async function getUserPreferences(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    const preferences = await db.prepare(
      'SELECT * FROM user_preferences WHERE user_id = ?'
    ).bind(userId).first();
    
    if (!preferences) {
      // Create default preferences if not found
      await db.prepare(
        'INSERT INTO user_preferences (user_id) VALUES (?)'
      ).bind(userId).run();
      
      // Fetch newly created preferences
      const newPreferences = await db.prepare(
        'SELECT * FROM user_preferences WHERE user_id = ?'
      ).bind(userId).first();
      
      return new Response(JSON.stringify(newPreferences), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(preferences), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve preferences' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    const updates = await request.json();
    
    // Only allow updating specific fields
    const allowedUpdates = [
      'theme', 
      'email_notifications', 
      'daily_reminders',
      'achievement_notifications',
      'default_problem_view'
    ];
    
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
    
    // Check if preferences exist
    const existingPreferences = await db.prepare(
      'SELECT * FROM user_preferences WHERE user_id = ?'
    ).bind(userId).first();
    
    if (!existingPreferences) {
      // Create preferences with updates
      const fields = ['user_id', ...Object.keys(updateData)];
      const values = [userId, ...Object.values(updateData)];
      const placeholders = Array(fields.length).fill('?').join(', ');
      
      await db.prepare(`
        INSERT INTO user_preferences (${fields.join(', ')}) 
        VALUES (${placeholders})
      `).bind(...values).run();
    } else {
      // Update existing preferences
      const setStatements = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), userId];
      
      await db.prepare(`
        UPDATE user_preferences 
        SET ${setStatements} 
        WHERE user_id = ?
      `).bind(...values).run();
    }
    
    // Get updated preferences
    const updatedPreferences = await db.prepare(
      'SELECT * FROM user_preferences WHERE user_id = ?'
    ).bind(userId).first();
    
    return new Response(JSON.stringify(updatedPreferences), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update preferences' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}