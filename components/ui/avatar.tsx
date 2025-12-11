"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  showStatus?: boolean;
  className?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    { src, name, size = "md", isOnline, showStatus = false, className },
    ref
  ) => {
    const sizes = {
      xs: "w-6 h-6 text-[10px]",
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
      xl: "w-16 h-16 text-lg",
    };

    const statusSizes = {
      xs: "w-2 h-2 border",
      sm: "w-2.5 h-2.5 border",
      md: "w-3 h-3 border-2",
      lg: "w-3.5 h-3.5 border-2",
      xl: "w-4 h-4 border-2",
    };

    const initials = getInitials(name);

    // Generate consistent color from name
    const colors = [
      "bg-orbit-blue",
      "bg-stellar-violet",
      "bg-signal-teal",
      "bg-aurora-green",
      "bg-solar-amber",
    ];
    const colorIndex =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    const bgColor = colors[colorIndex];

    return (
      <div ref={ref} className={cn("relative inline-flex shrink-0", className)}>
        <div
          className={cn(
            "relative rounded-full overflow-hidden",
            "flex items-center justify-center font-semibold text-star-white",
            "ring-2 ring-orbital-navy",
            sizes[size],
            !src && bgColor
          )}
        >
          {src ? (
            <Image
              src={src}
              alt={name}
              fill
              className="object-cover"
              sizes={size === "xl" ? "64px" : size === "lg" ? "48px" : "40px"}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        {showStatus && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-orbital-navy",
              statusSizes[size],
              isOnline ? "status-online" : "status-offline"
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
