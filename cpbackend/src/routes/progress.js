/**
 * Get user's progress across all problems
 */
export async function getUserProgress(request) {
  try {
    const userId = request.userId;
    const db = request.env.DB;
    
    // Get user progress with problem details
    const progress = await db.prepare(`
      SELECT 
        upp.*, 
        p.title as problem_title, 
        p.difficulty as problem_difficulty,
        t.name as topic_name,
        t.slug as topic_slug
      FROM user_problem_progress upp
      JOIN problems p ON upp.problem_id = p.problem_id
      JOIN topics t ON p.topic_id = t.topic_id
      WHERE upp.user_id = ?
      ORDER BY upp.last_attempt_date DESC
    `).bind(userId).all();
    
    // Get stats
    const stats = await db.prepare(`
      SELECT 
        COUNT(*) as total_attempted,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'attempted' THEN 1 ELSE 0 END) as attempted
      FROM user_problem_progress
      WHERE user_id = ?
    `).bind(userId).first();
    
    // Get difficulty breakdown
    const difficultyStats = await db.prepare(`
      SELECT 
        p.difficulty,
        COUNT(*) as total,
        SUM(CASE WHEN upp.status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM problems p
      LEFT JOIN user_problem_progress upp 
        ON p.problem_id = upp.problem_id AND upp.user_id = ?
      GROUP BY p.difficulty
    `).bind(userId).all();
    
    return new Response(JSON.stringify({
      progress: progress.results,
      stats,
      difficultyBreakdown: difficultyStats.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve progress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Update progress for a specific problem
 */
export async function updateProgress(request) {
  try {
    const userId = request.userId;
    const problemId = parseInt(request.params.problemId);
    const db = request.env.DB;
    const { status, solutionCode, notes } = await request.json();
    
    // Verify problem exists
    const problem = await db.prepare(
      'SELECT * FROM problems WHERE problem_id = ?'
    ).bind(problemId).first();
    
    if (!problem) {
      return new Response(JSON.stringify({ error: 'Problem not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if progress record already exists
    const existingProgress = await db.prepare(
      'SELECT * FROM user_problem_progress WHERE user_id = ? AND problem_id = ?'
    ).bind(userId, problemId).first();
    
    const now = new Date().toISOString();
    
    if (existingProgress) {
      // Update existing progress
      const updateValues = [status, now];
      let sql = `
        UPDATE user_problem_progress 
        SET status = ?, last_attempt_date = ?
      `;
      
      if (solutionCode !== undefined) {
        sql += ', solution_code = ?';
        updateValues.push(solutionCode);
      }
      
      if (notes !== undefined) {
        sql += ', notes = ?';
        updateValues.push(notes);
      }
      
      // Set completion date if status is 'completed'
      if (status === 'completed' && existingProgress.status !== 'completed') {
        sql += ', completion_date = ?';
        updateValues.push(now);
      } else if (status !== 'completed') {
        sql += ', completion_date = NULL';
      }
      
      sql += ' WHERE user_id = ? AND problem_id = ?';
      updateValues.push(userId, problemId);
      
      await db.prepare(sql).bind(...updateValues).run();
    } else {
      // Create new progress record
      const insertValues = [userId, problemId, status, now];
      let sql = `
        INSERT INTO user_problem_progress 
        (user_id, problem_id, status, last_attempt_date
      `;
      
      if (solutionCode !== undefined) {
        sql += ', solution_code';
        insertValues.push(solutionCode);
      }
      
      if (notes !== undefined) {
        sql += ', notes';
        insertValues.push(notes);
      }
      
      // Set completion date if status is 'completed'
      if (status === 'completed') {
        sql += ', completion_date';
        insertValues.push(now);
      }
      
      sql += ') VALUES (' + '?'.repeat(insertValues.length).split('').join(',') + ')';
      
      await db.prepare(sql).bind(...insertValues).run();
    }
    
    // Update daily activity
    await updateDailyActivity(db, userId, status);
    
    // Update user streak if problem is completed
    if (status === 'completed' && (!existingProgress || existingProgress.status !== 'completed')) {
      await updateUserStreak(db, userId);
    }
    
    // Get updated progress
    const updatedProgress = await db.prepare(
      'SELECT * FROM user_problem_progress WHERE user_id = ? AND problem_id = ?'
    ).bind(userId, problemId).first();
    
    return new Response(JSON.stringify(updatedProgress), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update progress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get progress for a specific problem
 */
export async function getProgressForProblem(request) {
  try {
    const userId = request.userId;
    const problemId = parseInt(request.params.problemId);
    const db = request.env.DB;
    
    // Get user progress for this problem
    const progress = await db.prepare(`
      SELECT upp.* 
      FROM user_problem_progress upp
      WHERE upp.user_id = ? AND upp.problem_id = ?
    `).bind(userId, problemId).first();
    
    if (!progress) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(progress), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve progress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Helper function to update daily activity
 */
async function updateDailyActivity(db, userId, status) {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if there's already a record for today
  const existingActivity = await db.prepare(
    'SELECT * FROM daily_activity WHERE user_id = ? AND date = ?'
  ).bind(userId, today).first();
  
  if (existingActivity) {
    // Update existing record
    let sql = `
      UPDATE daily_activity SET 
        problems_attempted = problems_attempted + 1
    `;
    
    if (status === 'completed') {
      sql += ', problems_solved = problems_solved + 1';
    }
    
    sql += ' WHERE user_id = ? AND date = ?';
    
    await db.prepare(sql).bind(userId, today).run();
  } else {
    // Create new record
    await db.prepare(`
      INSERT INTO daily_activity (
        user_id, 
        date, 
        problems_attempted,
        problems_solved,
        active_minutes
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      userId,
      today,
      1,
      status === 'completed' ? 1 : 0,
      10 // Default active minutes
    ).run();
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
  
  let newStreak = 1; // Start with 1 for today
  
  if (yesterdayActivity || user.current_streak === 0) {
    // Either continuing streak or starting a new one
    newStreak = yesterdayActivity ? user.current_streak + 1 : 1;
  } else {
    // Streak broken
    newStreak = 1;
  }
  
  // Update user streak
  const longestStreak = Math.max(newStreak, user.longest_streak);
  
  await db.prepare(`
    UPDATE users 
    SET current_streak = ?, longest_streak = ? 
    WHERE user_id = ?
  `).bind(newStreak, longestStreak, userId).run();
  
  // Check if user has reached a new longest streak milestone
  if (newStreak > user.longest_streak) {
    // Add streak notification
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