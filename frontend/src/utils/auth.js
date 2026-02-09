/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
    localStorage.removeItem('authToken');
};
