import { useEffect, useState } from 'react';

type FetchState<T> = {
  data: T | undefined;
  error: Error | undefined;
};

export function useRetryFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  retryDelay = 3000,
  maxRetries = 3
): FetchState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let isMounted = true;
    let retries = 0;

    const fetchData = async () => {
      while (retries <= maxRetries && isMounted) {
        try {
          const response = await fetch(url, options);

          if (response.status != 200) {
            retries++;
            console.warn(
              `Received ${response.status}. Retrying in ${retryDelay}ms... (Attempt ${retries}/${maxRetries})`
            );
            await new Promise((res) => setTimeout(res, retryDelay));
            continue;
          }

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const result: T = await response.json();
          if (isMounted) setData(result);
          return;

        } catch (err) {
          retries++;
          if (retries > maxRetries) {
            if (isMounted) {
              setError(err instanceof Error ? err : new Error('Unknown error'));
            }
            return;
          }

          console.warn(
            `Fetch failed: ${(err as Error).message}. Retrying in ${retryDelay}ms... (Attempt ${retries}/${maxRetries})`
          );
          await new Promise((res) => setTimeout(res, retryDelay));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(options), retryDelay, maxRetries]);

  return { data, error };
}
