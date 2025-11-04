// CodeChef Submission Tracker
console.log('CPAssist: CodeChef tracker loaded');

// Track processed submissions to avoid duplicates
const processedSubmissions = new Set();

// Monitor for submission results
function monitorSubmissions() {
  console.log('CPAssist: Monitoring CodeChef submissions...');
  
  // Watch for submission result notifications/tables
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          // Method 1: Check for success notification elements
          const successElement = node.querySelector?.('[class*="success"]') ||
                                node.querySelector?.('[class*="accepted"]') ||
                                node.querySelector?.('[class*="Accepted"]');
          
          if (successElement) {
            const text = successElement.textContent?.toLowerCase() || '';
            if (text.includes('accepted') || text.includes('correct')) {
              console.log('CPAssist: CodeChef accepted notification detected!');
              handleAcceptedSubmission();
              return;
            }
          }
          
          // Method 2: Check for result table with "Correct" status
          const statusCells = node.querySelectorAll?.('td, .status') || [];
          for (const cell of statusCells) {
            const cellText = cell.textContent?.toLowerCase() || '';
            if ((cellText.includes('correct') || cellText.includes('accepted')) && 
                cellText.length < 50) { // Avoid false positives from long text
              console.log('CPAssist: CodeChef accepted status in table detected!');
              
              // Debounce - avoid processing same submission multiple times
              const submissionKey = `${window.location.href}_${Date.now()}`;
              if (!processedSubmissions.has(submissionKey)) {
                processedSubmissions.add(submissionKey);
                setTimeout(() => processedSubmissions.delete(submissionKey), 10000);
                handleAcceptedSubmission();
              }
              return;
            }
          }
          
          // Method 3: Check for subtask results (like your screenshot)
          if (node.querySelector?.('.status-table')) {
            console.log('CPAssist: Status table detected, checking for success...');
            const correctRows = node.querySelectorAll?.('tr.correct');
            const totalScore = node.textContent?.match(/Total Score = (\d+)%/);
            
            if ((correctRows && correctRows.length > 0) || 
                (totalScore && parseInt(totalScore[1]) === 100)) {
              console.log('CPAssist: CodeChef 100% solution detected!');
              const submissionKey = `${window.location.href}_${Date.now()}`;
              if (!processedSubmissions.has(submissionKey)) {
                processedSubmissions.add(submissionKey);
                setTimeout(() => processedSubmissions.delete(submissionKey), 10000);
                handleAcceptedSubmission();
              }
              return;
            }
          }
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also check if results already exist on page load
  setTimeout(() => {
    checkExistingResults();
  }, 3000);
}

// Check if submission results already exist on the page
function checkExistingResults() {
  console.log('CPAssist: Checking for existing submission results...');
  
  // Check for status table
  const statusTable = document.querySelector('.status-table');
  if (statusTable) {
    const totalScore = statusTable.textContent?.match(/Total Score = (\d+)%/);
    if (totalScore && parseInt(totalScore[1]) === 100) {
      console.log('CPAssist: Found 100% solution on page!');
      const submissionKey = `${window.location.href}_existing`;
      if (!processedSubmissions.has(submissionKey)) {
        processedSubmissions.add(submissionKey);
        handleAcceptedSubmission();
      }
    }
  }
  
  // Check for "Great job" message
  const successMessages = document.querySelectorAll('[class*="status"]');
  for (const msg of successMessages) {
    const text = msg.textContent?.toLowerCase() || '';
    if (text.includes('great job') || text.includes('correct')) {
      console.log('CPAssist: Found success message on page!');
      const submissionKey = `${window.location.href}_existing`;
      if (!processedSubmissions.has(submissionKey)) {
        processedSubmissions.add(submissionKey);
        handleAcceptedSubmission();
      }
      break;
    }
  }
}

// Extract problem information
function extractProblemInfo() {
  try {
    const titleElement = document.querySelector('.problem-title') ||
                        document.querySelector('h1') ||
                        document.querySelector('[class*="title"]');
    
    const problemTitle = titleElement?.textContent?.trim() || 'Unknown Problem';
    const problemUrl = window.location.href;
    
    // Try to get difficulty
    const difficultyElement = document.querySelector('[class*="difficulty"]') ||
                             document.querySelector('.rating');
    let difficulty = 'MEDIUM';
    
    const diffText = difficultyElement?.textContent?.toLowerCase() || '';
    if (diffText.includes('easy') || diffText.includes('simple')) difficulty = 'EASY';
    else if (diffText.includes('hard') || diffText.includes('challenge')) difficulty = 'HARD';
    
    return {
      title: problemTitle,
      difficulty: difficulty,
      url: problemUrl,
      platform: 'CODECHEF'
    };
  } catch (error) {
    console.error('CPAssist: Failed to extract problem info:', error);
    return null;
  }
}

// Extract language from editor
function extractLanguage() {
  try {
    const languageSelect = document.querySelector('select[name*="language"]') ||
                          document.querySelector('#edit_area_toggle_checkbox_list');
    
    if (languageSelect) {
      const selected = languageSelect.querySelector('option:checked') ||
                      languageSelect.querySelector('.selected');
      const lang = selected?.textContent?.toLowerCase() || 'unknown';
      
      if (lang.includes('python')) return 'python';
      if (lang.includes('java')) return 'java';
      if (lang.includes('c++')) return 'cpp';
      if (lang.includes('c#')) return 'csharp';
      if (lang.includes('javascript')) return 'javascript';
    }
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// Handle accepted submission
async function handleAcceptedSubmission() {
  const problemInfo = extractProblemInfo();
  
  if (!problemInfo) return;
  
  const language = extractLanguage();
  
  const submissionData = {
    problemTitle: problemInfo.title,
    problemUrl: problemInfo.url,
    difficulty: problemInfo.difficulty,
    platform: 'CODECHEF',
    code: 'Code not accessible (CodeChef limitation)',
    language: language,
    status: 'ACCEPTED',
    runtime: null,
    memory: null,
    submittedAt: new Date().toISOString()
  };
  
  console.log('CPAssist: Sending CodeChef submission to backend:', submissionData);
  
  // Send to background script
  chrome.runtime.sendMessage({
    type: 'SUBMISSION_DETECTED',
    data: submissionData
  }, (response) => {
    if (response?.success) {
      console.log('CPAssist: CodeChef submission synced successfully!');
    } else {
      console.error('CPAssist: Failed to sync submission:', response?.error);
    }
  });
}

// Initialize - start monitoring when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(monitorSubmissions, 2000);
  });
} else {
  // DOM already loaded
  setTimeout(monitorSubmissions, 2000);
}

console.log('CPAssist: CodeChef tracker initialized. Waiting for submissions...');
