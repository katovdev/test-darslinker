"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseAsyncDataOptions<T> {
  /** Initial data value before first fetch */
  initialData?: T;
  /** Whether to fetch data automatically on mount (default: true) */
  fetchOnMount?: boolean;
  /** Dependencies that trigger a refetch when changed */
  deps?: unknown[];
  /** Callback when fetch succeeds */
  onSuccess?: (data: T) => void;
  /** Callback when fetch fails */
  onError?: (error: Error) => void;
}

export interface UseAsyncDataReturn<T> {
  /** The fetched data */
  data: T | undefined;
  /** Whether the fetch is in progress */
  isLoading: boolean;
  /** Error from the last fetch attempt */
  error: Error | null;
  /** Manually trigger a refetch */
  refresh: () => Promise<void>;
  /** Reset to initial state */
  reset: () => void;
  /** Update data manually without fetching */
  setData: (
    data: T | undefined | ((prev: T | undefined) => T | undefined)
  ) => void;
}

/**
 * A hook that handles async data fetching with loading, error, and refresh states.
 *
 * @example
 * // Basic usage
 * const { data, isLoading, error, refresh } = useAsyncData(
 *   () => api.fetchUsers(),
 *   { fetchOnMount: true }
 * );
 *
 * @example
 * // With dependencies (refetch when page or search changes)
 * const { data, isLoading, refresh } = useAsyncData(
 *   () => api.fetchUsers({ page, search }),
 *   { deps: [page, search] }
 * );
 *
 * @example
 * // Manual fetch control
 * const { data, isLoading, refresh } = useAsyncData(
 *   () => api.fetchUserDetails(userId),
 *   { fetchOnMount: false }
 * );
 * // Later: refresh();
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const {
    initialData,
    fetchOnMount = true,
    deps = [],
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(fetchOnMount);
  const [error, setError] = useState<Error | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track if initial fetch has happened
  const hasFetchedRef = useRef(false);
  // Store the latest fetchFn to avoid stale closures
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  // Store callbacks in refs to avoid triggering useEffect
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFnRef.current();
      if (isMountedRef.current) {
        setData(result);
        onSuccessRef.current?.(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
    hasFetchedRef.current = false;
  }, [initialData]);

  // Handle mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-fetch on mount and when deps change
  useEffect(() => {
    if (fetchOnMount || hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount, fetchData, ...deps]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    reset,
    setData,
  };
}

/**
 * A variant of useAsyncData that supports pagination
 */
export interface UsePaginatedDataOptions<T> extends Omit<
  UseAsyncDataOptions<T[]>,
  "initialData"
> {
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Items per page (default: 10) */
  pageSize?: number;
}

export interface UsePaginatedDataReturn<T> extends Omit<
  UseAsyncDataReturn<T[]>,
  "data"
> {
  /** The fetched items */
  items: T[];
  /** Current page number */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Go to a specific page */
  setPage: (page: number) => void;
  /** Go to the next page */
  nextPage: () => void;
  /** Go to the previous page */
  prevPage: () => void;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

/**
 * A hook for paginated data fetching
 *
 * @example
 * const {
 *   items,
 *   isLoading,
 *   page,
 *   totalPages,
 *   setPage,
 *   nextPage,
 *   prevPage,
 *   hasNextPage,
 *   hasPrevPage,
 *   refresh
 * } = usePaginatedData(
 *   (page, pageSize) => api.fetchUsers({ page, limit: pageSize, search }),
 *   { deps: [search], pageSize: 12 }
 * );
 */
export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataReturn<T> {
  const { initialPage = 1, pageSize = 10, deps = [], ...restOptions } = options;

  const [page, setPageState] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Store fetchFn in ref to avoid stale closure
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const wrappedFetchFn = useCallback(async () => {
    const response = await fetchFnRef.current(page, pageSize);
    setTotalPages(response.pagination.totalPages);
    setTotalItems(response.pagination.totalItems);
    return response.items;
  }, [page, pageSize]);

  const asyncData = useAsyncData(wrappedFetchFn, {
    ...restOptions,
    deps: [page, pageSize, ...deps],
  });

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(Math.max(1, Math.min(newPage, totalPages || 1)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setPageState((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPageState((p) => Math.max(p - 1, 1));
  }, []);

  // Reset to page 1 when deps change (except page itself)
  useEffect(() => {
    setPageState(initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    items: asyncData.data ?? [],
    isLoading: asyncData.isLoading,
    error: asyncData.error,
    refresh: asyncData.refresh,
    reset: asyncData.reset,
    setData: asyncData.setData,
    page,
    totalPages,
    totalItems,
    setPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export default useAsyncData;
