import type { PropsWithChildren } from 'react';

export function AnimatedPage({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};
