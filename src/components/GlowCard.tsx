'use client';

import { motion } from 'framer-motion';
import React from 'react';

// Importera från den lokala komponenten som motion-primitives skapade
import { GlowEffect } from '@/components/motion-primitives/glow-effect';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowCard({ children, className = '' }: GlowCardProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className='pointer-events-none absolute inset-0'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        <GlowEffect
          colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']} // Purple colors to match theme
          mode='colorShift'
          blur='medium'
          duration={5}
        />
      </motion.div>
      <div className='relative h-full w-full rounded-md border border-zinc-300/40 bg-white p-4 dark:border-zinc-700/40'>
        {children}
      </div>
    </div>
  );
}