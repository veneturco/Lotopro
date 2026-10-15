import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/40"></div>
          <div className="space-y-1.5">
            <div className="w-24 h-4 bg-white/50 rounded-md"></div>
            <div className="w-32 h-3 bg-white/30 rounded-md"></div>
          </div>
        </div>
        <div className="w-20 h-7 bg-white/40 rounded-full"></div>
      </div>

      {/* Hero Card Skeleton */}
      <div className="rounded-3xl bg-neutral-900/80 p-5 space-y-4 shadow-xl border border-white/20">
        <div className="flex justify-between items-center">
          <div className="w-28 h-3 bg-neutral-700 rounded-md"></div>
          <div className="w-16 h-4 bg-neutral-700 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-neutral-800"></div>
            <div className="space-y-2">
              <div className="w-16 h-3 bg-neutral-700 rounded-md"></div>
              <div className="w-28 h-6 bg-neutral-700 rounded-md"></div>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-neutral-800"></div>
        </div>
      </div>

      {/* Prediction Card Skeleton */}
      <div className="rounded-3xl bg-white/50 p-4 space-y-3">
        <div className="w-36 h-4 bg-white/60 rounded-md"></div>
        <div className="space-y-2">
          <div className="w-full h-12 bg-white/60 rounded-xl"></div>
          <div className="w-full h-12 bg-white/60 rounded-xl"></div>
          <div className="w-full h-12 bg-white/60 rounded-xl"></div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3.5 pt-2">
        <div className="h-44 rounded-3xl bg-yellow-500/70"></div>
        <div className="h-44 rounded-3xl bg-yellow-500/70"></div>
      </div>
    </div>
  );
}
