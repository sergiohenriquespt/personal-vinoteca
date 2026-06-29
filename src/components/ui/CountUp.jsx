import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

export default function CountUp({ to, from = 0, delay = 0, duration = 2, startWhen = true, separator = '' }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(from);
  const springValue = useSpring(motionValue, { damping: 20 + 40 * (1 / duration), stiffness: 100 * (1 / duration) });
  const isInView = useInView(ref, { once: true, margin: '0px' });

  const formatValue = useCallback(latest => {
    const options = { useGrouping: !!separator, minimumFractionDigits: 0, maximumFractionDigits: 0 };
    const n = Intl.NumberFormat('en-US', options).format(latest);
    return separator ? n.replace(/,/g, separator) : n;
  }, [separator]);

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(from);
  }, [from, to, formatValue]);

  useEffect(() => {
    if (isInView && startWhen) {
      const id = setTimeout(() => motionValue.set(to), delay * 1000);
      return () => clearTimeout(id);
    }
  }, [isInView, startWhen, motionValue, from, to, delay]);

  useEffect(() => {
    const unsub = springValue.on('change', latest => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return unsub;
  }, [springValue, formatValue]);

  return <span ref={ref} />;
}
