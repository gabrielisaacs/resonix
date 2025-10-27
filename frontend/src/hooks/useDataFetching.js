import { useState, useEffect } from "react";
import { dataCache } from "../utils/cache";
import { CACHE_DEFAULTS } from "../constants/config";

const CURRENT_DATE = "2025-01-23 15:02:45";
const CURRENT_USER = "gabrielisaacs";

export const useDataFetching = (
  fetchFunction,
  cacheKey,
  dependencies = [],
  options = {
    retries: CACHE_DEFAULTS.max_retries,
    delay: CACHE_DEFAULTS.delay,
    cacheKeyPrefix: CACHE_DEFAULTS.key_prefix,
  }
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fullCacheKey = `${options.cacheKeyPrefix}${cacheKey}`;

  const fetchData = async (retryAttempt = 0) => {
    setLoading(true);
    try {
      // Check cache first
      const cachedData = dataCache.get(fullCacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${fullCacheKey}`);
        setData(cachedData);
        setLoading(false);
        return;
      }

      const response = await fetchFunction();
      if (!response || !response.data) {
        throw new Error("Invalid response format");
      }

      // Cache the successful response
      dataCache.set(fullCacheKey, response.data);
      setData(response.data);
      if (error) {
        setError(null);
      }
      setRetryCount(0);
      console.log(`Data successfully fetched and cached for ${fullCacheKey}`);
    } catch (err) {
      console.error(
        `Fetch attempt ${retryAttempt + 1} failed for ${fullCacheKey}:`,
        err
      );

      if (retryAttempt < options.retries) {
        const nextRetryDelay = options.delay * Math.pow(2, retryAttempt); // Exponential backoff
        console.log(`Retrying in ${nextRetryDelay}ms...`);
        setTimeout(() => {
          setRetryCount(retryAttempt + 1);
          fetchData(retryAttempt + 1);
        }, nextRetryDelay);
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const executeFetch = async () => {
      setLoading(true);
      await fetchData();
    };

    executeFetch();

    return () => {
      isActive = false;
    };
  }, [...dependencies]);

  const retry = async () => {
    console.log(`Manual retry initiated for ${fullCacheKey}`);
    setRetryCount(0);
    setError(null);
    await fetchData(0);
  };

  return {
    data,
    loading,
    error,
    retryCount,
    retry,
    isStale: dataCache.isStale(fullCacheKey),
  };
};
