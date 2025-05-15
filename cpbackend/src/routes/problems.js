/**
 * Get all problems with optional filtering
 */
export async function getAllProblems(request) {
  try {
    const db = request.env.DB;
    const url = new URL(request.url);
    
    // Parse query parameters for filtering
    const topic = url.searchParams.get('topic');
    const difficulty = url.searchParams.get('difficulty');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Construct SQL query based on filters
    let sql = `
      SELECT p.*, t.name as topic_name, t.slug as topic_slug 
      FROM problems p
      JOIN topics t ON p.topic_id = t.topic_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (topic) {
      sql += ' AND t.slug = ?';
      params.push(topic);
    }
    
    if (difficulty) {
      sql += ' AND p.difficulty = ?';
      params.push(difficulty);
    }
    
    sql += ' ORDER BY p.problem_id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const problems = await db.prepare(sql).bind(...params).all();
    
    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM problems p
      JOIN topics t ON p.topic_id = t.topic_id
      WHERE 1=1
    `;
    
    const countParams = [];
    
    if (topic) {
      countSql += ' AND t.slug = ?';
      countParams.push(topic);
    }
    
    if (difficulty) {
      countSql += ' AND p.difficulty = ?';
      countParams.push(difficulty);
    }
    
    const count = await db.prepare(countSql).bind(...countParams).first();
    
    return new Response(JSON.stringify({
      problems: problems.results,
      pagination: {
        total: count.total,
        limit,
        offset
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve problems' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get problem by ID
 */
export async function getProblemById(request) {
  try {
    const problemId = parseInt(request.params.id);
    const userId = request.userId;
    const db = request.env.DB;
    
    // Get problem details
    const problem = await db.prepare(`
      SELECT p.*, t.name as topic_name, t.slug as topic_slug 
      FROM problems p
      JOIN topics t ON p.topic_id = t.topic_id
      WHERE p.problem_id = ?
    `).bind(problemId).first();
    
    if (!problem) {
      return new Response(JSON.stringify({ error: 'Problem not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user's progress on this problem, if any
    const progress = await db.prepare(`
      SELECT * FROM user_problem_progress 
      WHERE user_id = ? AND problem_id = ?
    `).bind(userId, problemId).first();
    
    return new Response(JSON.stringify({
      ...problem,
      userProgress: progress || null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve problem' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get all topics
 */
export async function getAllTopics(request) {
  try {
    const db = request.env.DB;
    
    const topics = await db.prepare(`
      SELECT t.*, COUNT(p.problem_id) as problem_count
      FROM topics t
      LEFT JOIN problems p ON t.topic_id = p.topic_id
      GROUP BY t.topic_id
      ORDER BY t.name
    `).all();
    
    return new Response(JSON.stringify(topics.results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve topics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get problems by topic
 */
export async function getProblemsByTopic(request) {
  try {
    const topicId = parseInt(request.params.id);
    const db = request.env.DB;
    
    // Verify topic exists
    const topic = await db.prepare(
      'SELECT * FROM topics WHERE topic_id = ?'
    ).bind(topicId).first();
    
    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get problems for this topic
    const problems = await db.prepare(`
      SELECT * FROM problems WHERE topic_id = ? ORDER BY difficulty, title
    `).bind(topicId).all();
    
    return new Response(JSON.stringify({
      topic,
      problems: problems.results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve problems' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}