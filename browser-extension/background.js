// Background Service Worker for CPAssist Extension

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SUBMISSION_DETECTED') {
    handleSubmission(message.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
  
  if (message.type === 'GET_AUTH_TOKEN') {
    chrome.storage.sync.get(['authToken'], (result) => {
      sendResponse({ token: result.authToken || null });
    });
    return true;
  }
  
  if (message.type === 'SAVE_AUTH_TOKEN') {
    chrome.storage.sync.set({ authToken: message.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle submission and send to CPAssist backend
async function handleSubmission(submissionData) {
  try {
    // Get auth token from storage
    const result = await chrome.storage.sync.get(['authToken', 'backendUrl']);
    const authToken = result.authToken;
    const backendUrl = result.backendUrl || 'http://localhost:8080';
    
    if (!authToken) {
      throw new Error('Not logged in. Please configure CPAssist extension.');
    }
    
    // Send submission to backend
    const response = await fetch(`${backendUrl}/api/submissions/external`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(submissionData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to sync: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'CPAssist - Problem Synced! 🎉',
      message: `${submissionData.problemTitle} synced successfully!`,
      priority: 2
    });
    
    return data;
  } catch (error) {
    console.error('Failed to sync submission:', error);
    
    // Show error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'CPAssist - Sync Failed',
      message: error.message,
      priority: 2
    });
    
    throw error;
  }
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('CPAssist Extension installed!');
    // Open setup page
    chrome.tabs.create({ url: 'popup.html' });
  }
});
