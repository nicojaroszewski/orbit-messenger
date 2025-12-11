"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-lunar-graphite/50",
        className
      )}
    />
  );
}

export function SkeletonText({ className, lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className, size = "md" }: SkeletonProps & { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <Skeleton className={cn("rounded-full", sizes[size], className)} />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-lunar-graphite/30 border border-white/5",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

// Chat-specific skeletons
export function SkeletonMessage({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && <SkeletonAvatar size="sm" />}
      <div className={cn("space-y-1", isOwn ? "items-end" : "items-start")}>
        <Skeleton
          className={cn(
            "h-10 rounded-2xl",
            isOwn ? "w-32" : "w-48"
          )}
        />
        <Skeleton className="h-2 w-12" />
      </div>
    </div>
  );
}

export function SkeletonChatList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonMessageList() {
  return (
    <div className="space-y-4 p-4">
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={true} />
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={true} />
      <SkeletonMessage isOwn={false} />
    </div>
  );
}

export function SkeletonUserCard() {
  return (
    <div className="p-4 rounded-xl bg-lunar-graphite/30 border border-white/5">
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-6">
        <SkeletonAvatar size="xl" className="w-24 h-24" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1 p-4 rounded-xl bg-lunar-graphite/30 text-center">
            <Skeleton className="h-6 w-12 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Bio */}
      <div className="p-4 rounded-xl bg-lunar-graphite/30">
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}
