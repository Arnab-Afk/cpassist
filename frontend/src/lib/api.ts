/**
 * Utility functions for making authenticated API requests
 */

/**
 * Make an authenticated API request with the provided token
 * 
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @param token - Authentication token
 * @returns The API response
 * @throws Error if the request fails or returns unauthorized
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  token: string
): Promise<Response> {
  // Prepare headers with authentication token
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Make the authenticated request
  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized errors
  if (response.status === 401) {
    // Token might be expired - could implement token refresh here
    // For now, throw an error that will trigger a logout
    throw new Error('Your session has expired. Please log in again.');
  }

  // Return the response for further processing
  return response;
}

/**
 * Shorthand for making an authenticated GET request
 */
export async function getWithAuth<T>(url: string, token: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'GET' }, token);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to fetch data: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Shorthand for making an authenticated POST request
 */
export async function postWithAuth<T>(url: string, data: any, token: string): Promise<T> {
  try {
    console.log(`Making POST request to ${url}`);
    
    const response = await fetchWithAuth(
      url, 
      { 
        method: 'POST',
        body: JSON.stringify(data)
      }, 
      token
    );
    
    console.log(`POST response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Could not parse error response'
      }));
      
      console.error('Error response data:', errorData);
      throw new Error(errorData.message || errorData.error || `Failed to post data: ${response.status}`);
    }
    
    const result = await response.json();
    return result as T;
  } catch (error) {
    console.error('Error in postWithAuth:', error);
    throw error;
  }
}

/**
 * Shorthand for making an authenticated PUT request
 */
export async function putWithAuth<T>(url: string, data: any, token: string): Promise<T> {
  try {
    console.log(`Making PUT request to ${url}`);
    
    const response = await fetchWithAuth(
      url, 
      { 
        method: 'PUT',
        body: JSON.stringify(data)
      }, 
      token
    );
    
    console.log(`PUT response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Could not parse error response'
      }));
      
      console.error('Error response data:', errorData);
      throw new Error(errorData.message || errorData.error || `Failed to put data: ${response.status}`);
    }
    
    const result = await response.json();
    return result as T;
  } catch (error) {
    console.error('Error in putWithAuth:', error);
    throw error;
  }
}
