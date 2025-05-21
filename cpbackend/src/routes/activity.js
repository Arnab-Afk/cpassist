/**
 * Get user's activity histor
 */
export async function getUserActivity(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    const url = new URL(request.url);
    
    // Parse query parameters
    const days = parseInt(url.searchParams.get('days') || '30');
    const limit = Math.min(Math.max(days, 1), 365); // Limit between 1 and 365 days
    
    // Get activity data for the specified time period
    const activityData = await db.prepare(`
      SELECT * FROM daily_activity 
      WHERE user_id = ? 
      ORDER BY date DESC
      LIMIT ?
    `).bind(userId, limit).all();
    
    // Get activity summary stats
    const activityStats = await db.prepare(`
      SELECT 
        SUM(problems_solved) as total_solved,
        SUM(problems_attempted) as total_attempted,
        SUM(active_minutes) as total_minutes,
        AVG(problems_solved) as avg_daily_solved,
        MAX(problems_solved) as max_daily_solved
      FROM daily_activity
      WHERE user_id = ?
      AND date >= date('now', '-${limit} days')
    `).bind(userId).first();
    
    // Get current streak data
    const user = await db.prepare(
      'SELECT current_streak, longest_streak FROM users WHERE user_id = ?'
    ).bind(userId).first();
    
    return new Response(JSON.stringify({
      activity: activityData.results,
      stats: activityStats,
      streak: {
        current: user.current_streak,
        longest: user.longest_streak
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve activity data', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update today's activity data
 */
export async function updateTodayActivity(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    const { problemsSolved, problemsAttempted, activeMinutes } = await request.json();
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already a record for today
    const existingActivity = await db.prepare(
      'SELECT * FROM daily_activity WHERE user_id = ? AND date = ?'
    ).bind(userId, today).first();
    
    if (existingActivity) {
      // Update existing record
      let sql = 'UPDATE daily_activity SET ';
      const updates = [];
      const values = [];
      
      if (problemsSolved !== undefined) {
        updates.push('problems_solved = problems_solved + ?');
        values.push(problemsSolved);
      }
      
      if (problemsAttempted !== undefined) {
        updates.push('problems_attempted = problems_attempted + ?');
        values.push(problemsAttempted);
      }
      
      if (activeMinutes !== undefined) {
        updates.push('active_minutes = active_minutes + ?');
        values.push(activeMinutes);
      }
      
      if (updates.length === 0) {
        return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      sql += updates.join(', ');
      sql += ' WHERE user_id = ? AND date = ?';
      values.push(userId, today);
      
      await db.prepare(sql).bind(...values).run();
    } else {
      // Create new record
      await db.prepare(`
        INSERT INTO daily_activity (
          user_id, 
          date, 
          problems_solved,
          problems_attempted,
          active_minutes
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        userId,
        today,
        problemsSolved || 0,
        problemsAttempted || 0,
        activeMinutes || 0
      ).run();
    }
    
    // Check if this activity affects streak
    if (problemsSolved > 0) {
      await updateUserStreak(db, userId);
    }
    
    // Get the updated activity record
    const updatedActivity = await db.prepare(
      'SELECT * FROM daily_activity WHERE user_id = ? AND date = ?'
    ).bind(userId, today).first();
    
    return new Response(JSON.stringify(updatedActivity), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update activity', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Helper function to update user streak
 */
async function updateUserStreak(db, userId) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Get user's current streak info
  const user = await db.prepare(
    'SELECT current_streak, longest_streak FROM users WHERE user_id = ?'
  ).bind(userId).first();
  
  // Check if user was active yesterday
  const yesterdayActivity = await db.prepare(
    'SELECT * FROM daily_activity WHERE user_id = ? AND date = ? AND problems_solved > 0'
  ).bind(userId, yesterday).first();
  
  // Check if user already has activity recorded for today
  const todayActivity = await db.prepare(
    'SELECT * FROM daily_activity WHERE user_id = ? AND date = ? AND problems_solved > 0'
  ).bind(userId, today).first();
  
  // If user already has activity for today, no need to update streak again
  if (todayActivity && todayActivity.problems_solved > 0) {
    return;
  }
  
  let newStreak = 1; // Start with 1 for today
  
  if (yesterdayActivity && yesterdayActivity.problems_solved > 0) {
    // Continuing streak
    newStreak = user.current_streak + 1;
  } else {
    // New streak starting today
    newStreak = 1;
  }
  
  // Update user streak
  const longestStreak = Math.max(newStreak, user.longest_streak);
  
  await db.prepare(`
    UPDATE users 
    SET current_streak = ?, longest_streak = ? 
    WHERE user_id = ?
  `).bind(newStreak, longestStreak, userId).run();
  
  // Check if user has reached a milestone streak
  checkAndAwardStreakBadges(db, userId, newStreak);
  
  // If user has reached a new longest streak, add notification
  if (newStreak > user.longest_streak && newStreak >= 3) {
    await db.prepare(`
      INSERT INTO notifications (
        user_id, 
        message, 
        type
      ) VALUES (?, ?, ?)
    `).bind(
      userId,
      `Congratulations! You've reached a ${newStreak} day streak!`,
      'streak'
    ).run();
  }
}

/**
 * Check and award streak-based badges
 */
async function checkAndAwardStreakBadges(db, userId, currentStreak) {
  // Get streak badges that the user doesn't have yet
  const badges = await db.prepare(`
    SELECT b.* FROM badges b
    LEFT JOIN user_badges ub ON b.badge_id = ub.badge_id AND ub.user_id = ?
    WHERE b.requirement_type = 'streak'
    AND b.requirement_value <= ?
    AND ub.user_badge_id IS NULL
  `).bind(userId, currentStreak).all();
  
  // Award new badges
  for (const badge of badges.results) {
    await db.prepare(`
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (?, ?)
    `).bind(userId, badge.badge_id).run();
    
    // Add notification for new badge
    await db.prepare(`
      INSERT INTO notifications (
        user_id, 
        message, 
        type
      ) VALUES (?, ?, ?)
    `).bind(
      userId,
      `You've earned the "${badge.name}" badge!`,
      'badge'
    ).run();
  }
}