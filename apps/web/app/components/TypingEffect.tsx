"use client"
 
import * as React from 'react';
import { motion, useInView } from 'framer-motion';
 
export function TypingEffect({ text = 'Typing Effect' }: { text: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <h2
      ref={ref}
      className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tighter leading-[1.05] mb-6"
    >
      {text.split('').map((letter, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.2, delay: index * 0.1 }}
        >
          {letter}
        </motion.span>
      ))}
    </h2>
  );
}