import { useState, useEffect } from 'react';

/**
 * Generic hook để fetch public API data.
 * @param {() => Promise<any>} fetcher - hàm fetch từ publicApi
 * @returns {{ data: any, loading: boolean, error: string | null }}
 */
export function usePublicData(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Không thể tải dữ liệu.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}
