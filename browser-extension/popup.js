// Popup script for CPAssist Extension

document.addEventListener('DOMContentLoaded', () => {
  loadSavedSettings();
  
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
});

// Load saved settings from storage
function loadSavedSettings() {
  chrome.storage.sync.get(['authToken', 'backendUrl', 'syncedCount', 'lastSync'], (result) => {
    if (result.authToken) {
      document.getElementById('authToken').value = result.authToken;
      updateStatus(true);
    }
    
    if (result.backendUrl) {
      document.getElementById('backendUrl').value = result.backendUrl;
    }
    
    if (result.syncedCount) {
      document.getElementById('syncedCount').textContent = result.syncedCount;
      document.getElementById('stats').style.display = 'block';
    }
    
    if (result.lastSync) {
      const lastSyncDate = new Date(result.lastSync);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastSyncDate) / 60000);
      
      let timeAgo;
      if (diffMinutes < 1) timeAgo = 'Just now';
      else if (diffMinutes < 60) timeAgo = `${diffMinutes}m ago`;
      else if (diffMinutes < 1440) timeAgo = `${Math.floor(diffMinutes / 60)}h ago`;
      else timeAgo = `${Math.floor(diffMinutes / 1440)}d ago`;
      
      document.getElementById('lastSync').textContent = timeAgo;
    }
  });
}

// Save settings to storage
async function saveSettings() {
  let authToken = document.getElementById('authToken').value.trim();
  const backendUrl = document.getElementById('backendUrl').value.trim();
  
  if (!authToken) {
    showMessage('Please enter your auth token', 'error');
    return;
  }
  
  if (!backendUrl) {
    showMessage('Please enter backend URL', 'error');
    return;
  }
  
  // Clean token: remove any non-ASCII characters, quotes, and whitespace
  authToken = authToken
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/["'`]/g, '')         // Remove quotes
    .replace(/\s/g, '')            // Remove all whitespace
    .trim();
  
  // Validate JWT token format (should have 3 parts separated by dots)
  const tokenParts = authToken.split('.');
  if (tokenParts.length !== 3) {
    showMessage('Invalid token format. JWT should have 3 parts separated by dots.', 'error');
    return;
  }
  
  // Check for common issues
  if (authToken.includes('•')) {
    showMessage('Token contains bullet points. Please copy the actual token, not the masked version.', 'error');
    return;
  }
  
  // Validate token by making a test request
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Connecting...';
  
  try {
    // Ensure backend URL ends with /api
    let apiUrl = backendUrl.replace(/\/$/, ''); // Remove trailing slash
    if (!apiUrl.endsWith('/api')) {
      apiUrl += '/api';
    }
    
    const response = await fetch(`${apiUrl}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + authToken,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      // Save to storage
      chrome.storage.sync.set({
        authToken: authToken,
        backendUrl: backendUrl,
        username: userData.username || 'User'
      }, () => {
        showMessage('Connected successfully! 🎉', 'success');
        updateStatus(true);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save & Connect';
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || `Backend returned ${response.status}`;
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Connection error:', error);
    let errorMessage = 'Failed to connect: ';
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage += 'Backend not reachable. Make sure backend is running on ' + backendUrl;
    } else if (error.message.includes('401') || error.message.includes('403')) {
      errorMessage += 'Invalid JWT token. Please copy a fresh token from your profile page.';
    } else {
      errorMessage += error.message;
    }
    
    showMessage(errorMessage, 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save & Connect';
  }
}

// Update connection status
function updateStatus(connected) {
  const statusEl = document.getElementById('status');
  
  if (connected) {
    statusEl.textContent = '✓ Connected to CPAssist';
    statusEl.className = 'status connected';
  } else {
    statusEl.textContent = '✗ Not Connected';
    statusEl.className = 'status disconnected';
  }
}

// Show message
function showMessage(text, type) {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';
  
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

// Listen for sync updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_UPDATE') {
    chrome.storage.sync.get(['syncedCount'], (result) => {
      const count = (result.syncedCount || 0) + 1;
      chrome.storage.sync.set({
        syncedCount: count,
        lastSync: new Date().toISOString()
      });
      
      document.getElementById('syncedCount').textContent = count;
      document.getElementById('lastSync').textContent = 'Just now';
      document.getElementById('stats').style.display = 'block';
    });
  }
});
