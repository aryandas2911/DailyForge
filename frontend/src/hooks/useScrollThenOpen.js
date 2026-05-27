import { useCallback, useRef } from "react";

/*----------------useScrollThenOpen--------------------*/
export function useScrollThenOpen(
  onScrollComplete,
  targetY = 0,
  settlePx = 8
) {
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  const scrollThenOpen = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (Math.abs(window.scrollY - targetY) <= settlePx) {
      onScrollComplete();
      return;
    }

    window.scrollTo({ top: targetY, behavior: "smooth" });

    let resolved = false;

    const resolve = () => {
      if (resolved) return;
      resolved = true;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      onScrollComplete();
    };

    const poll = () => {
      if (Math.abs(window.scrollY - targetY) <= settlePx) {
        resolve();
      } else {
        rafRef.current = requestAnimationFrame(poll);
      }
    };
    rafRef.current = requestAnimationFrame(poll);

    timerRef.current = setTimeout(resolve, 1200);
  }, [onScrollComplete, targetY, settlePx]);

  return scrollThenOpen;
}
