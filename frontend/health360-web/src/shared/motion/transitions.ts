export const motionEase = [0.22, 1, 0.36, 1] as const;

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: motionEase },
};
