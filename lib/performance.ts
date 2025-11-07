/**
 * Performance Optimization Utilities
 * Provides tools for improving app performance and user experience
 */

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Debounce function to limit function call frequency
 * Useful for search inputs, resize handlers, etc.
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure function is called at most once per interval
 * Useful for scroll handlers, mousemove events, etc.
 * @param func - Function to throttle
 * @param limit - Minimum time between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Hook for debouncing values
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for lazy loading images
 * Uses Intersection Observer API for efficient lazy loading
 * @param ref - Ref to the image element
 * @returns Whether the image should be loaded
 */
export function useLazyLoad(ref: React.RefObject<HTMLElement>): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before element is visible
      }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref]);

  return isVisible;
}

/**
 * Memoize expensive computations
 * @param fn - Function to memoize
 * @param deps - Dependencies array
 * @returns Memoized result
 */
export function useMemoized<T>(fn: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ value: T; deps: React.DependencyList } | null>(null);

  if (
    !ref.current ||
    !deps.every((dep, i) => dep === ref.current!.deps[i])
  ) {
    ref.current = { value: fn(), deps };
  }

  return ref.current.value;
}

/**
 * Optimized event listener hook
 * Automatically cleans up event listeners
 * @param event - Event name
 * @param handler - Event handler
 * @param element - Element to attach listener to (defaults to window)
 */
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement = window
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) =>
      savedHandler.current(event as WindowEventMap[K]);

    element.addEventListener(event, eventListener);

    return () => {
      element.removeEventListener(event, eventListener);
    };
  }, [event, element]);
}

/**
 * Measure component render performance
 * Logs render time to console in development mode
 * @param name - Component name for identification
 */
export function useRenderPerformance(name: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Performance] ${name} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`
      );
    }

    startTime.current = performance.now();
  });
}

/**
 * Optimize images for different screen sizes
 * Generates srcSet for responsive images
 * @param src - Base image URL
 * @param widths - Array of widths to generate
 * @returns srcSet string
 */
export function generateSrcSet(src: string, widths: number[]): string {
  if (!src || !src.includes("cloudinary")) {
    return src;
  }

  return widths
    .map((width) => {
      const url = src.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Prefetch resources for faster navigation
 * @param urls - Array of URLs to prefetch
 */
export function prefetchResources(urls: string[]) {
  if (typeof window === "undefined") return;

  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Check if user prefers reduced motion
 * Useful for disabling animations for accessibility
 * @returns Whether user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Detect slow network connection
 * @returns Whether connection is slow
 */
export function useSlowConnection(): boolean {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const updateConnectionStatus = () => {
        const slow =
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.saveData;
        setIsSlowConnection(slow);
      };

      updateConnectionStatus();
      connection.addEventListener("change", updateConnectionStatus);

      return () => {
        connection.removeEventListener("change", updateConnectionStatus);
      };
    }
  }, []);

  return isSlowConnection;
}

/**
 * Batch state updates for better performance
 * @param updates - Array of state update functions
 */
export function batchUpdates(updates: Array<() => void>) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    requestIdleCallback(() => {
      updates.forEach((update) => update());
    });
  } else {
    updates.forEach((update) => update());
  }
}
