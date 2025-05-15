/**
 * Get all available badges
 */
export async function getAllBadges(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    // Get all badges with user's earned status
    const badges = await db.prepare(`
      SELECT 
        b.*,
        CASE WHEN ub.user_badge_id IS NOT NULL THEN 1 ELSE 0 END as earned,
        ub.earned_date
      FROM badges b
      LEFT JOIN user_badges ub ON b.badge_id = ub.badge_id AND ub.user_id = ?
      ORDER BY b.requirement_type, b.requirement_value
    `).bind(userId).all();
    
    return new Response(JSON.stringify(badges.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve badges', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    // Get all badges that the user has earned
    const badges = await db.prepare(`
      SELECT 
        b.*,
        ub.earned_date
      FROM badges b
      JOIN user_badges ub ON b.badge_id = ub.badge_id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_date DESC
    `).bind(userId).all();
    
    // Get count by category
    const badgeCounts = await db.prepare(`
      SELECT 
        b.requirement_type, 
        COUNT(*) as count
      FROM badges b
      JOIN user_badges ub ON b.badge_id = ub.badge_id
      WHERE ub.user_id = ?
      GROUP BY b.requirement_type
    `).bind(userId).all();
    
    return new Response(JSON.stringify({
      badges: badges.results,
      counts: badgeCounts.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve user badges', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get all available milestones
 */
export async function getAllMilestones(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    // Get all milestones with user's progress
    const milestones = await db.prepare(`
      SELECT 
        m.*,
        COALESCE(ump.current_count, 0) as current_count,
        COALESCE(ump.completed, 0) as completed,
        ump.completion_date
      FROM milestones m
      LEFT JOIN user_milestone_progress ump 
        ON m.milestone_id = ump.milestone_id AND ump.user_id = ?
      ORDER BY m.target_count
    `).bind(userId).all();
    
    return new Response(JSON.stringify(milestones.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve milestones', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get user's milestone progress
 */
export async function getUserMilestones(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    // Get user's milestone progress
    const milestones = await db.prepare(`
      SELECT 
        m.*,
        ump.current_count,
        ump.completed,
        ump.completion_date,
        (m.target_count - ump.current_count) as remaining,
        ROUND((ump.current_count * 100.0 / m.target_count), 1) as percentage
      FROM milestones m
      JOIN user_milestone_progress ump 
        ON m.milestone_id = ump.milestone_id
      WHERE ump.user_id = ?
      ORDER BY ump.completed, ump.percentage DESC
    `).bind(userId).all();
    
    // Get completed vs total counts
    const counts = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ump.completed = 1 THEN 1 ELSE 0 END) as completed
      FROM milestones m
      LEFT JOIN user_milestone_progress ump 
        ON m.milestone_id = ump.milestone_id AND ump.user_id = ?
    `).bind(userId).first();
    
    return new Response(JSON.stringify({
      milestones: milestones.results,
      stats: {
        total: counts.total,
        completed: counts.completed,
        percentage: counts.total > 0 ? Math.round((counts.completed * 100) / counts.total) : 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve user milestones', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Check and update milestone progress
 * This would typically be called from other endpoints when relevant actions occur
 */
export async function checkAndUpdateMilestones(db, userId, actionType, value = 1) {
  try {
    // Get all applicable milestones for this action type
    const milestones = await db.prepare(`
      SELECT * FROM milestones 
      WHERE name LIKE ?
    `).bind(`%${actionType}%`).all();
    
    for (const milestone of milestones.results) {
      // Check if user has this milestone progress
      const progress = await db.prepare(`
        SELECT * FROM user_milestone_progress
        WHERE user_id = ? AND milestone_id = ?
      `).bind(userId, milestone.milestone_id).first();
      
      if (progress) {
        // Skip if already completed
        if (progress.completed) continue;
        
        // Update progress
        const newCount = progress.current_count + value;
        const completed = newCount >= milestone.target_count;
        
        await db.prepare(`
          UPDATE user_milestone_progress
          SET 
            current_count = ?,
            completed = ?,
            completion_date = CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END
          WHERE user_id = ? AND milestone_id = ?
        `).bind(
          newCount,
          completed ? 1 : 0,
          completed ? 1 : 0,
          userId,
          milestone.milestone_id
        ).run();
        
        // Notify user if milestone completed
        if (completed) {
          await db.prepare(`
            INSERT INTO notifications (
              user_id, 
              message, 
              type
            ) VALUES (?, ?, ?)
          `).bind(
            userId,
            `You've completed the "${milestone.name}" milestone!`,
            'milestone'
          ).run();
        }
      } else {
        // Create new progress record
        const count = value;
        const completed = count >= milestone.target_count;
        
        await db.prepare(`
          INSERT INTO user_milestone_progress (
            user_id,
            milestone_id,
            current_count,
            completed,
            completion_date
          ) VALUES (?, ?, ?, ?, CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END)
        `).bind(
          userId,
          milestone.milestone_id,
          count,
          completed ? 1 : 0,
          completed ? 1 : 0
        ).run();
        
        // Notify user if milestone completed
        if (completed) {
          await db.prepare(`
            INSERT INTO notifications (
              user_id, 
              message, 
              type
            ) VALUES (?, ?, ?)
          `).bind(
            userId,
            `You've completed the "${milestone.name}" milestone!`,
            'milestone'
          ).run();
        }
      }
    }
  } catch (error) {
    console.error('Error updating milestones:', error);
  }
}