import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import { stickyTop } from '../layout/stickyTop';

const cssPx = (name: string): number =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

/** Column that sticks under the header, or once its bottom edge is visible if it is taller than the viewport. */
export const StickyColumn = ({ style, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const gutter = cssPx('--space-5');
      setTop(stickyTop(cssPx('--header-height') + gutter, window.innerHeight, element.offsetHeight, gutter));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return <div ref={ref} style={{ ...style, top }} {...props} />;
};
