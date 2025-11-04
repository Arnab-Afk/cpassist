// LeetCode Submission Tracker
console.log('CPAssist: LeetCode tracker loaded');

// Track the current problem being viewed
let currentProblem = null;
let isTracking = false;

// Extract problem information from the page
function extractProblemInfo() {
  try {
    // Get problem title
    const titleElement = document.querySelector('[data-cy="question-title"]') ||
                        document.querySelector('div[class*="text-title"]') ||
                        document.querySelector('a[class*="text-title"]');
    
    const problemTitle = titleElement?.textContent?.trim() || 'Unknown Problem';
    
    // Get difficulty
    const difficultyElement = document.querySelector('div[diff]') ||
                             document.querySelector('[class*="difficulty"]');
    const difficulty = difficultyElement?.textContent?.trim() || 'MEDIUM';
    
    // Get problem URL and number
    const problemUrl = window.location.href;
    const problemSlug = problemUrl.split('/problems/')[1]?.split('/')[0] || '';
    
    // Get description (first paragraph)
    const descriptionElement = document.querySelector('[class*="elfjS"]') ||
                               document.querySelector('[class*="content__u"]');
    const description = descriptionElement?.textContent?.substring(0, 500) || '';
    
    return {
      title: problemTitle,
      difficulty: difficulty.toUpperCase(),
      url: problemUrl,
      slug: problemSlug,
      description: description,
      platform: 'LEETCODE'
    };
  } catch (error) {
    console.error('CPAssist: Failed to extract problem info:', error);
    return null;
  }
}

// Monitor for submission results
function monitorSubmissions() {
  if (isTracking) return;
  isTracking = true;
  
  console.log('CPAssist: Monitoring for submissions...');
  
  // Watch for submission result modal or notification
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) { // Element node
          // Check for success message
          const successElement = node.querySelector?.('[class*="success"]') ||
                                (node.textContent?.includes('Accepted') && node);
          
          if (successElement && successElement.textContent?.includes('Accepted')) {
            console.log('CPAssist: Accepted submission detected!');
            handleAcceptedSubmission();
            break;
          }
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also listen for GraphQL responses (LeetCode API)
  interceptGraphQLRequests();
}

// Intercept LeetCode's GraphQL API calls
function interceptGraphQLRequests() {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Clone response to read it
    const clonedResponse = response.clone();
    
    try {
      const url = args[0];
      if (typeof url === 'string' && url.includes('graphql')) {
        const data = await clonedResponse.json();
        
        // Check if this is a submission result
        if (data?.data?.submitCode || data?.data?.interpretSolution) {
          const result = data.data.submitCode || data.data.interpretSolution;
          
          if (result?.status_msg === 'Accepted') {
            console.log('CPAssist: Accepted submission detected via API!');
            handleAcceptedSubmission(result);
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
    
    return response;
  };
}

// Handle accepted submission
async function handleAcceptedSubmission(apiResult = null) {
  const problemInfo = extractProblemInfo();
  
  if (!problemInfo) {
    console.error('CPAssist: Could not extract problem info');
    return;
  }
  
  // Get code from editor
  const code = extractSubmittedCode();
  const language = extractLanguage();
  
  // Get runtime and memory if available
  let runtime = null;
  let memory = null;
  
  if (apiResult) {
    runtime = apiResult.runtime || apiResult.status_runtime;
    memory = apiResult.memory || apiResult.status_memory;
  } else {
    // Try to extract from UI
    const runtimeElement = document.querySelector('[class*="runtime"]');
    const memoryElement = document.querySelector('[class*="memory"]');
    
    if (runtimeElement) {
      const runtimeText = runtimeElement.textContent;
      runtime = parseInt(runtimeText.match(/\d+/)?.[0]) || null;
    }
    
    if (memoryElement) {
      const memoryText = memoryElement.textContent;
      memory = parseFloat(memoryText.match(/[\d.]+/)?.[0]) || null;
    }
  }
  
  const submissionData = {
    problemTitle: problemInfo.title,
    problemUrl: problemInfo.url,
    problemSlug: problemInfo.slug,
    difficulty: problemInfo.difficulty,
    description: problemInfo.description,
    platform: 'LEETCODE',
    code: code,
    language: language,
    status: 'ACCEPTED',
    runtime: runtime,
    memory: memory,
    submittedAt: new Date().toISOString()
  };
  
  console.log('CPAssist: Sending submission to backend:', submissionData);
  
  // Send to background script
  chrome.runtime.sendMessage({
    type: 'SUBMISSION_DETECTED',
    data: submissionData
  }, (response) => {
    if (response?.success) {
      console.log('CPAssist: Submission synced successfully!');
    } else {
      console.error('CPAssist: Failed to sync submission:', response?.error);
    }
  });
}

// Extract code from Monaco editor
function extractSubmittedCode() {
  try {
    // Try to get from Monaco editor
    const editor = document.querySelector('.monaco-editor');
    if (editor) {
      const lines = editor.querySelectorAll('.view-line');
      const code = Array.from(lines)
        .map(line => line.textContent)
        .join('\n');
      return code || 'Code not captured';
    }
    
    // Fallback: try textarea
    const textarea = document.querySelector('textarea[class*="code"]');
    if (textarea) {
      return textarea.value;
    }
    
    return 'Code not captured';
  } catch (error) {
    console.error('CPAssist: Failed to extract code:', error);
    return 'Code not captured';
  }
}

// Extract programming language
function extractLanguage() {
  try {
    const languageButton = document.querySelector('button[id*="headlessui-listbox-button"]') ||
                          document.querySelector('[class*="lang"]');
    
    if (languageButton) {
      const langText = languageButton.textContent.toLowerCase();
      
      if (langText.includes('python')) return 'python';
      if (langText.includes('java')) return 'java';
      if (langText.includes('javascript')) return 'javascript';
      if (langText.includes('typescript')) return 'typescript';
      if (langText.includes('c++')) return 'cpp';
      if (langText.includes('c#')) return 'csharp';
      if (langText.includes('go')) return 'go';
      if (langText.includes('rust')) return 'rust';
      if (langText.includes('kotlin')) return 'kotlin';
      if (langText.includes('swift')) return 'swift';
    }
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// Initialize tracking when on a problem page
function init() {
  const isProblemPage = window.location.href.includes('/problems/');
  
  if (isProblemPage) {
    console.log('CPAssist: Problem page detected');
    currentProblem = extractProblemInfo();
    monitorSubmissions();
  }
}

// Start tracking
init();

// Re-initialize on page navigation (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    isTracking = false;
    init();
  }
}).observe(document, { subtree: true, childList: true });
