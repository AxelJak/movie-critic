/**
 * Utility functions to check PocketBase connection health
 */

/**
 * Check if PocketBase server is reachable
 * 
 * @returns Promise<boolean> - true if PocketBase is accessible, false otherwise
 */
export async function checkPocketBaseHealth(): Promise<boolean> {
  try {
    const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
    
    if (!pocketbaseUrl) {
      console.error('PocketBase URL is not defined in environment variables');
      return false;
    }
    
    // Make a simple HEAD request to check if the server is responding
    const response = await fetch(pocketbaseUrl, {
      method: 'HEAD',
      headers: {
        'Accept': 'application/json'
      },
      // Skip caching to ensure we're checking the current state
      cache: 'no-store'
    });
    
    return response.ok;
  } catch (error) {
    console.error('PocketBase health check failed:', error);
    return false;
  }
}

/**
 * Validate that the PocketBase connection can perform the specific operation
 * 
 * @param operation - Function that tests a specific PocketBase operation
 * @returns Promise<boolean> - true if operation succeeds, false otherwise
 */
export async function validatePocketBaseOperation<T>(
  operation: () => Promise<T>
): Promise<boolean> {
  try {
    await operation();
    return true;
  } catch (error) {
    console.error('PocketBase operation validation failed:', error);
    return false;
  }
}
