import { useState, useEffect } from 'react';
import { dataCache } from '../utils/cache';

const CURRENT_DATE = '2025-01-23 15:02:45';
const CURRENT_USER = 'gabrielisaacs';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const DEFAULT_CACHE_KEY_PREFIX = 'jamendo_';

export const useDataFetching = (
  fetchFunction,
  cacheKey,
  dependencies = [],
  options = { 
    retries: MAX_RETRIES, 
    delay: RETRY_DELAY,
    cacheKeyPrefix: DEFAULT_CACHE_KEY_PREFIX
  }
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fullCacheKey = `${options.cacheKeyPrefix}${cacheKey}`;

  const fetchData = async (retryAttempt = 0) => {
    try {
      // Check cache first
      const cachedData = dataCache.get(fullCacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${fullCacheKey}`);
        setData(cachedData);
        setLoading(false);
        return;
      }

      console.log(`Cache miss for ${fullCacheKey}, fetching data...`);
      const response = await fetchFunction();
      
      if (!response || !response.data) {
        throw new Error('Invalid response format');
      }

      // Cache the successful response
      dataCache.set(fullCacheKey, response.data);
      
      setData(response.data);
      setError(null);
      setRetryCount(0);

      console.log(`Data successfully fetched and cached for ${fullCacheKey}`);
    } catch (err) {
      console.error(`Fetch attempt ${retryAttempt + 1} failed for ${fullCacheKey}:`, err);
      
      if (retryAttempt < options.retries) {
        const nextRetryDelay = options.delay * Math.pow(2, retryAttempt); // Exponential backoff
        console.log(`Retrying in ${nextRetryDelay}ms...`);

        setTimeout(() => {
          setRetryCount(retryAttempt + 1);
          fetchData(retryAttempt + 1);
        }, nextRetryDelay);
      } else {
        setError(err);
        // Use cached data as fallback if available
        const cachedData = dataCache.get(fullCacheKey);
        if (cachedData) {
          console.log(`Using cached data as fallback for ${fullCacheKey}`);
          setData(cachedData);
        } else {
          console.log(`No cached data available for ${fullCacheKey}`);
        }
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
    setLoading(true);
    await fetchData(0);
  };

  return { 
    data, 
    loading, 
    error, 
    retryCount, 
    retry,
    isStale: dataCache.isStale(fullCacheKey)
  };
};