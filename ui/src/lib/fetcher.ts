// Custom mutator: orval's react-query client defaults to axios.
// This thin wrapper uses native fetch to avoid the extra dependency.
export const fetcher = async <T>(
  url: string,
  init: RequestInit
): Promise<T> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export default fetcher;
