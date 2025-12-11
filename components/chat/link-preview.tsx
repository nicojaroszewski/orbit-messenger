"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Globe, X } from "lucide-react";
import { Skeleton } from "@/components/ui";

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

interface LinkPreviewProps {
  url: string;
  isOwn?: boolean;
  className?: string;
}

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  return matches ? [...new Set(matches)] : [];
}

export function LinkPreview({ url, isOwn = false, className }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      setError(false);

      try {
        // Use a simple client-side approach to extract metadata
        // In production, you'd want a server-side API for this
        const metadata = await fetchMetadata(url);
        if (metadata) {
          setPreview(metadata);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (dismissed || error) return null;

  if (loading) {
    return (
      <div className={`mt-2 rounded-lg overflow-hidden border border-white/10 ${className}`}>
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-2 block rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors group ${
        isOwn ? "bg-white/5" : "bg-lunar-graphite/30"
      } ${className}`}
    >
      <div className="relative">
        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDismissed(true);
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Preview Image */}
        {preview.image && (
          <div className="h-32 overflow-hidden">
            <img
              src={preview.image}
              alt={preview.title || "Preview"}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-3">
          {/* Site name */}
          <div className="flex items-center gap-2 mb-1">
            {preview.favicon ? (
              <img
                src={preview.favicon}
                alt=""
                className="w-4 h-4 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Globe className="w-4 h-4 text-nebula-gray" />
            )}
            <span className="text-xs text-nebula-gray truncate">
              {preview.siteName || new URL(url).hostname}
            </span>
            <ExternalLink className="w-3 h-3 text-nebula-gray ml-auto shrink-0" />
          </div>

          {/* Title */}
          {preview.title && (
            <h4 className="text-sm font-medium text-star-white line-clamp-2 mb-1">
              {preview.title}
            </h4>
          )}

          {/* Description */}
          {preview.description && (
            <p className="text-xs text-nebula-gray line-clamp-2">
              {preview.description}
            </p>
          )}
        </div>
      </div>
    </motion.a>
  );
}

// Client-side metadata fetching (limited but works for many sites)
async function fetchMetadata(url: string): Promise<LinkPreviewData | null> {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // For known sites, we can construct preview data
    // YouTube
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        return {
          url,
          title: "YouTube Video",
          image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          siteName: "YouTube",
          favicon: "https://www.youtube.com/favicon.ico",
        };
      }
    }

    // Twitter/X
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      return {
        url,
        title: "Twitter Post",
        siteName: "X (Twitter)",
        favicon: "https://abs.twimg.com/favicons/twitter.2.ico",
      };
    }

    // GitHub
    if (hostname.includes("github.com")) {
      const parts = urlObj.pathname.split("/").filter(Boolean);
      return {
        url,
        title: parts.length >= 2 ? `${parts[0]}/${parts[1]}` : "GitHub",
        description: "View on GitHub",
        siteName: "GitHub",
        favicon: "https://github.com/favicon.ico",
      };
    }

    // Default: just show the domain
    return {
      url,
      title: hostname.replace("www.", ""),
      siteName: hostname.replace("www.", ""),
    };
  } catch {
    return null;
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Component to render message content with link previews
export function MessageWithLinkPreviews({
  content,
  isOwn,
}: {
  content: string;
  isOwn: boolean;
}) {
  const urls = extractUrls(content);
  const firstUrl = urls[0];

  return (
    <>
      <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      {firstUrl && <LinkPreview url={firstUrl} isOwn={isOwn} />}
    </>
  );
}
