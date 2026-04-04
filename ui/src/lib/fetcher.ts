/**
 * Get the API base URL from environment or default to current origin.
 * Adjust this based on your deployment configuration.
 */
const getBaseUrl = (): string => {
  // In development, you might use a different API URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // In production, API is typically on the same origin
  return "";
};

// Custom mutator: orval's react-query client defaults to axios.
// This thin wrapper uses native fetch to avoid the extra dependency.
export const fetcher = async <T>(
  url: string,
  init: RequestInit
): Promise<T> => {
  const baseUrl = getBaseUrl();
  const fullUrl = `${baseUrl}${url}`;
  const response = await fetch(fullUrl, init);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export default fetcher;
