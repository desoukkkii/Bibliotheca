import { useEffect, useRef, useState } from "react";

const MAX_FRAMES = 80;
const EASING = 0.15;

export function useCounter(target: number): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    frameRef.current = 0;
    setValue(0);

    const tick = () => {
      frameRef.current++;
      setValue((prev) => {
        if (prev === target) return target;
        const next = Math.round(prev + (target - prev) * EASING);
        return Math.abs(target - next) < 1 ? target : next;
      });
      if (frameRef.current < MAX_FRAMES) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return value;
}
