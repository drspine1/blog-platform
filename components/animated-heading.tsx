'use client';

import { motion, fadeUp, viewport } from '@/components/motion';

interface AnimatedHeadingProps {
  title: string;
  subtitle?: string;
  animate?: boolean; // true = whileInView, false = animate on mount
}

export default function AnimatedHeading({ title, subtitle, animate = false }: AnimatedHeadingProps) {
  const props = animate
    ? { variants: fadeUp, initial: 'hidden' as const, whileInView: 'visible' as const, viewport }
    : { variants: fadeUp, initial: 'hidden' as const, animate: 'visible' as const };

  return (
    <>
      <motion.h1 className="text-4xl font-bold text-foreground sm:text-5xl" {...props}>
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          className="mt-4 text-lg text-muted-foreground"
          variants={fadeUp}
          initial="hidden"
          {...(animate ? { whileInView: 'visible', viewport } : { animate: 'visible' })}
          transition={{ delay: 0.15 }}
        >
          {subtitle}
        </motion.p>
      )}
    </>
  );
}
