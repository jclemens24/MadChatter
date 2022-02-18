import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

export const useHttp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = 'GET', headers = {}, body = null) => {
      try {
        const controller = new AbortController();
        activeHttpRequests.current.push(controller);
        setLoading(true);
        const res = await axios({
          method: method,
          signal: controller.signal,
          url: url,
          headers: headers,
          data: body,
        });
        activeHttpRequests.current = activeHttpRequests.current.filter(
          signal => signal !== controller
        );

        const data = await res.data;
        if (res.data.status === 'fail' || res.data.status === 'error') {
          throw new Error(
            res.data.message ||
              'Something went wrong. Please try your request again'
          );
        }
        setLoading(false);
        return data;
      } catch (err) {
        setError(err.response.data.message);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach(signal => signal.abort());
    };
  }, []);
  return { loading, error, sendRequest, clearError };
};
