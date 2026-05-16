"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

export default function HeroSection() {
  // Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 120,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 120,
    damping: 20,
  });

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    mouseX.set(e.clientX - window.innerWidth / 2);
    mouseY.set(e.clientY - window.innerHeight / 2);
  };

  // 3D movement transforms
  const rectX = useTransform(smoothX, [-500, 500], [-40, 40]);
  const rectY = useTransform(smoothY, [-500, 500], [-30, 30]);

  const circleX = useTransform(
    smoothX,
    [-500, 500],
    [30, -30]
  );

  const circleY = useTransform(
    smoothY,
    [-500, 500],
    [40, -40]
  );

  const squareRotate = useTransform(
    smoothX,
    [-500, 500],
    [-20, 20]
  );

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-black text-white"
    >
      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:45px_45px]" />

      {/* 3D FLOATING SHAPES */}

      {/* RECTANGLE */}
      <motion.div
        style={{
          x: rectX,
          y: rectY,
        }}
        animate={{
          rotateZ: [0, 6, -6, 0],
          rotateX: [0, 10, 0],
          rotateY: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-20 top-32 h-40 w-64 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
      />

      {/* CIRCLE */}
      <motion.div
        style={{
          x: circleX,
          y: circleY,
        }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute right-32 top-28 h-40 w-40 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl"
      />

      {/* SQUARE */}
      <motion.div
        style={{
          rotate: squareRotate,
        }}
        animate={{
          y: [0, 30, 0],
          rotateX: [0, 20, 0],
          rotateY: [0, -20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-32 left-32 h-32 w-32 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
      />

      {/* TRIANGLE */}
      <motion.div
        style={{
          x: rectX,
        }}
        animate={{
          rotate: [0, 360],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-24 right-40"
      >
        <div className="h-0 w-0 border-l-[70px] border-r-[70px] border-b-[120px] border-l-transparent border-r-transparent border-b-white/10" />
      </motion.div>

      {/* HERO CONTENT */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6">
        {/* BADGE */}
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mb-6 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 backdrop-blur-xl"
        >
          <p className="text-sm text-neutral-300">
            Modern Collaborative Drawing Platform
          </p>
        </motion.div>

        {/* HEADING */}
        <motion.h1
          initial={{
            opacity: 0,
            y: 60,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="max-w-5xl text-center text-6xl font-black leading-tight tracking-tight md:text-8xl"
        >
          Draw.
          <br />

          <span className="text-neutral-500">
            Create.
          </span>{" "}
          Collaborate.
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
          className="mt-8 max-w-2xl text-center text-lg leading-relaxed text-neutral-400"
        >
          Build diagrams, wireframes, brainstorms, and
          realtime collaborative ideas with a smooth infinite
          canvas experience.
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1.2,
          }}
          className="mt-10 flex flex-wrap items-center justify-center gap-5"
        >
          <Link href="/signup">
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="rounded-2xl bg-white px-8 py-4 font-semibold text-black transition-all duration-300 hover:bg-neutral-200"
            >
              Start Drawing
            </motion.button>
          </Link>

          <Link href="/signin">
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.06]"
            >
              Login
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}