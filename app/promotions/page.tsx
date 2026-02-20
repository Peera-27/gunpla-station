"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,150,255,0.2)_0%,black_70%)]" />

      {/* Scanline Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_3px] opacity-20" />

      <div className="relative z-10 text-center">
        {/* 404 Text */}
        <h1 className="text-[120px] font-extrabold tracking-widest text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)] animate-pulse">
          501
        </h1>

        <p className="mb-6 text-xl tracking-wide text-gray-300">
          Not Implement Yet
        </p>

        {/* Mecha Silhouette */}
        <div className="mx-auto mb-8 h-40 w-40 bg-gradient-to-b from-cyan-400 to-blue-700 opacity-70 blur-xl rounded-full animate-ping" />

        <p className="mb-8 text-gray-400">
          The unit you are searching for has been destroyed or relocated.
        </p>

        <Link
          href="/"
          className="rounded-lg border border-cyan-400 px-6 py-3 text-lg font-semibold text-cyan-400 transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.8)]"
        >
          RETURN TO BASE
        </Link>
      </div>
    </div>
  );
}
