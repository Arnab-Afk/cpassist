// Codeforces Submission Tracker
console.log('CPAssist: Codeforces tracker loaded');

// Monitor for submission results on Codeforces
function monitorSubmissions() {
  console.log('CPAssist: Monitoring Codeforces submissions...');
  
  // Check if we're on a problem page
  const isProblemPage = window.location.href.includes('/problem/') ||
                       window.location.href.includes('/problemset/problem/');
  
  if (!isProblemPage) return;
  
  // Watch for submission table updates
  const submissionTable = document.querySelector('.status-frame-datatable');
  
  if (submissionTable) {
    const observer = new MutationObserver((mutations) => {
      checkForAcceptedSubmissions();
    });
    
    observer.observe(submissionTable, {
      childList: true,
      subtree: true
    });
  }
  
  // Also check existing submissions
  checkForAcceptedSubmissions();
}

// Check for accepted submissions
function checkForAcceptedSubmissions() {
  const rows = document.querySelectorAll('.status-frame-datatable tr');
  
  rows.forEach((row) => {
    const verdictCell = row.querySelector('.status-verdict-cell');
    const verdict = verdictCell?.textContent?.trim();
    
    if (verdict === 'Accepted' || verdict?.includes('Accepted')) {
      // Check if we already processed this submission
      const submissionId = row.querySelector('[data-submission-id]')?.dataset?.submissionId;
      
      if (submissionId && !processedSubmissions.has(submissionId)) {
        processedSubmissions.add(submissionId);
        handleAcceptedSubmission(row);
      }
    }
  });
}

// Track processed submissions to avoid duplicates
const processedSubmissions = new Set();

// Extract problem information
function extractProblemInfo() {
  try {
    const titleElement = document.querySelector('.title');
    const problemTitle = titleElement?.textContent?.trim() || 'Unknown Problem';
    
    const problemUrl = window.location.href;
    
    // Get problem rating (difficulty)
    const ratingElement = document.querySelector('.tag-box[title*="Difficulty"]');
    const rating = ratingElement?.textContent?.trim() || '';
    
    let difficulty = 'MEDIUM';
    const ratingNum = parseInt(rating);
    if (ratingNum < 1400) difficulty = 'EASY';
    else if (ratingNum >= 2000) difficulty = 'HARD';
    
    return {
      title: problemTitle,
      difficulty: difficulty,
      url: problemUrl,
      rating: rating,
      platform: 'CODEFORCES'
    };
  } catch (error) {
    console.error('CPAssist: Failed to extract problem info:', error);
    return null;
  }
}

// Handle accepted submission
async function handleAcceptedSubmission(row) {
  const problemInfo = extractProblemInfo();
  
  if (!problemInfo) return;
  
  // Extract submission details from row
  const timeCell = row.querySelector('.time-consumed-cell');
  const memoryCell = row.querySelector('.memory-consumed-cell');
  const languageCell = row.querySelector('[data-problemId]');
  
  const runtime = timeCell ? parseInt(timeCell.textContent.match(/\d+/)?.[0]) : null;
  const memory = memoryCell ? parseFloat(memoryCell.textContent.match(/[\d.]+/)?.[0]) : null;
  const language = languageCell?.textContent?.trim()?.toLowerCase() || 'unknown';
  
  const submissionData = {
    problemTitle: problemInfo.title,
    problemUrl: problemInfo.url,
    difficulty: problemInfo.difficulty,
    platform: 'CODEFORCES',
    code: 'Code not accessible (Codeforces limitation)',
    language: normalizeLanguage(language),
    status: 'ACCEPTED',
    runtime: runtime,
    memory: memory,
    submittedAt: new Date().toISOString()
  };
  
  console.log('CPAssist: Sending Codeforces submission to backend:', submissionData);
  
  // Send to background script
  chrome.runtime.sendMessage({
    type: 'SUBMISSION_DETECTED',
    data: submissionData
  }, (response) => {
    if (response?.success) {
      console.log('CPAssist: Codeforces submission synced successfully!');
    } else {
      console.error('CPAssist: Failed to sync submission:', response?.error);
    }
  });
}

// Normalize language names
function normalizeLanguage(lang) {
  const lower = lang.toLowerCase();
  if (lower.includes('python')) return 'python';
  if (lower.includes('java')) return 'java';
  if (lower.includes('c++')) return 'cpp';
  if (lower.includes('c#')) return 'csharp';
  if (lower.includes('javascript')) return 'javascript';
  if (lower.includes('go')) return 'go';
  if (lower.includes('rust')) return 'rust';
  if (lower.includes('kotlin')) return 'kotlin';
  return 'unknown';
}

// Initialize
setTimeout(() => {
  monitorSubmissions();
}, 2000);
