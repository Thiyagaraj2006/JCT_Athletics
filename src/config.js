// In Vite, environment variables are prefixed with VITE_
// If VITE_API_URL is not set, we default to http://localhost:5000 for local development.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
