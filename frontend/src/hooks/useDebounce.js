import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms have
 * passed without a change. Used to avoid recomputing/refetching on every
 * keystroke (issue #11).
 *
 * @param {*} value value to debounce
 * @param {number} delay debounce delay in ms (default 300)
 */
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
