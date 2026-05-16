"use client";

import Image from "next/image";
import { motion } from "motion/react";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Welcome() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
      >
        <Image
          src="/logo-porthole.png"
          alt="Nautilus"
          width={72}
          height={72}
          priority
          className="size-16 rounded-full"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
        className="mt-6 max-w-[20ch] text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl"
      >
        Welcome to your next website.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.22, ease: easeOut }}
        className="mt-5 max-w-[52ch] text-base text-muted-foreground text-pretty sm:text-lg"
      >
        This is the starting point for something new. Take your time, look
        around, and when you&apos;re ready, we will help you bring your ideas
        to life.
      </motion.p>
    </div>
  );
}
