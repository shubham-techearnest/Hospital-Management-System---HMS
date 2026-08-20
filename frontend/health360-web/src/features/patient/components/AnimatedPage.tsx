import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/shared/motion/usePrefersReducedMotion';
import { fadeInUp, motionEase, staggerContainer } from '@/shared/motion/transitions';

export { fadeInUp, staggerContainer };

export function AnimatedPage({ children }: PropsWithChildren) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: motionEase }}
    >
      {children}
    </motion.div>
  );
}
