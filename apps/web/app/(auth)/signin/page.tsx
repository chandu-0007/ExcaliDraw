"use client";

import axios from "axios";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [user, SetUser] = useState({
    username: "",
    password: "",
  });

  const [error, SetError] = useState<string | null>(null);

  const router = useRouter();

  // Mouse Animation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 100,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 100,
    damping: 20,
  });

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    mouseX.set(e.clientX -200 );
    mouseY.set(e.clientY -200);
  };

  const SetOnchange = (
    target: React.ChangeEvent<HTMLInputElement>
  ) => {
    SetUser({
      ...user,
      [target.target.name]: target.target.value,
    });
  };

  const OnSubmit = async () => {
    try {
      const response = await axios.post("/api/signin", user);

      if (response.status === 200) {
        router.push("/dashboard");
      } else {
        SetError(response.data.message);
      }
    } catch (err: any) {
      SetError(
        err.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Mouse Glow */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl"
      />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Login Card */}
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative z-10 w-[92%] max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl">
            ✏️
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              Excalidraw
            </h1>

            <p className="text-sm text-neutral-400">
              Collaborative Workspace
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h2 className="text-3xl font-bold">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-neutral-400">
            Sign in to continue drawing ideas.
          </p>
        </div>

        {/* Username */}
        <div className="mb-5">
          <label className="mb-2 block text-sm text-neutral-300">
            Username
          </label>

          <input
            type="text"
            value={user.username}
            name="username"
            placeholder="Enter username"
            onChange={SetOnchange}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/[0.05]"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-neutral-300">
            Password
          </label>

          <input
            type="password"
            value={user.password}
            name="password"
            placeholder="Enter password"
            onChange={SetOnchange}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-neutral-600 focus:border-white/30 focus:bg-white/[0.05]"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={OnSubmit}
          className="w-full rounded-xl border border-white/10 bg-white py-3 font-semibold text-black transition-all duration-300 hover:bg-neutral-200"
        >
          Sign In
        </motion.button>

        {/* Register */}
        <div className="mt-5 text-center">
          <p className="text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-white transition hover:text-neutral-300"
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}