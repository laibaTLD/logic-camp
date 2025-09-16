import { useState, useEffect } from "react";

interface UseFetchProps<T> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: HeadersInit;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useFetch = <T>({ url, method = "GET", body, headers }: UseFetchProps<T>): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const contentType = res.headers.get('content-type') || '';

        // Attempt to parse JSON when appropriate; otherwise read as text
        const parseResponse = async () => {
          if (contentType.includes('application/json')) {
            return await res.json();
          }
          const text = await res.text();
          // When HTML comes back, surface a clearer error message
          throw new Error(
            `Unexpected ${res.status} ${res.statusText}. Expected JSON but received ${contentType || 'unknown type'}.` +
            (text?.startsWith('<!DOCTYPE') ? ' HTML was returned (likely an error page or redirect).' : '')
          );
        };

        if (!res.ok) {
          // Try to pull structured error if possible; otherwise use generic text
          try {
            const maybeJson = contentType.includes('application/json') ? await res.json() : null;
            const message = maybeJson?.error || maybeJson?.message || `Request failed with status ${res.status}`;
            throw new Error(message);
          } catch {
            const text = await res.text();
            throw new Error(text || `Request failed with status ${res.status}`);
          }
        }

        const payload = await parseResponse();
        setData(payload);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, method, body, headers]);

  return { data, loading, error };
};
