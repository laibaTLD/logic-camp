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

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
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
