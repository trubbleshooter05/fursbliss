"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type OwnerStoryVideoProps = {
  videoUrl: string;
  thumbnail: string;
  caption?: string;
  ownerName: string;
  dogName: string;
};

export function OwnerStoryVideo({
  videoUrl,
  thumbnail,
  caption,
  ownerName,
  dogName,
}: OwnerStoryVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-sm">
        {/* Video container */}
        <div className="relative aspect-[9/16] md:aspect-video bg-black">
          {!isPlaying ? (
            // Thumbnail with play button
            <div
              className="relative w-full h-full cursor-pointer group"
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={thumbnail}
                alt={`${ownerName}'s story with ${dogName}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center">
                  <Play className="w-10 h-10 text-black ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          ) : (
            // Video player
            <video
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
              poster={thumbnail}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Caption */}
        {caption && (
          <div className="p-4 md:p-6">
            <p className="text-sm md:text-base text-white/80 leading-relaxed">
              {caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
