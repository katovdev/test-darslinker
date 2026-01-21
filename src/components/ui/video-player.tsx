"use client";

import * as React from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  type MediaPlayerInstance,
  isHLSProvider,
  type MediaProviderAdapter,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import type Hls from "hls.js";
import type { HlsConfig } from "hls.js";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { cn } from "@/lib/utils";

export interface SubtitleTrack {
  src: string;
  label: string;
  language: string;
  kind?: "subtitles" | "captions";
  default?: boolean;
}

export interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  aspectRatio?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  thumbnails?: string;
  subtitles?: SubtitleTrack[];
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
  hlsConfig?: Partial<HlsConfig>;
}

export function VideoPlayer({
  src,
  title,
  poster,
  aspectRatio = "16/9",
  autoPlay = false,
  muted = false,
  loop = false,
  className,
  thumbnails,
  subtitles = [],
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  onReady,
  onError,
  hlsConfig,
}: VideoPlayerProps) {
  const playerRef = React.useRef<MediaPlayerInstance>(null);

  const onProviderChange = React.useCallback(
    (provider: MediaProviderAdapter | null) => {
      if (isHLSProvider(provider)) {
        provider.library = () => import("hls.js");

        provider.onInstance((hls: Hls) => {
          if (hlsConfig) {
            Object.assign(hls.config, hlsConfig);
          }
        });
      }
    },
    [hlsConfig]
  );

  return (
    <MediaPlayer
      ref={playerRef}
      src={src}
      title={title}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      crossOrigin
      playsInline
      className={cn("w-full overflow-hidden rounded-lg", className)}
      style={{ aspectRatio }}
      onProviderChange={onProviderChange}
      onTimeUpdate={(detail) => {
        const duration = playerRef.current?.state.duration ?? 0;
        onTimeUpdate?.(detail.currentTime, duration);
      }}
      onEnded={onEnded}
      onPlay={onPlay}
      onPause={onPause}
      onCanPlay={onReady}
      onError={(detail) => {
        onError?.(new Error(detail.message));
      }}
    >
      <MediaProvider>
        <Poster className="vds-poster" />
        {subtitles.map((track) => (
          <Track
            key={track.src}
            src={track.src}
            label={track.label}
            language={track.language}
            kind={track.kind || "subtitles"}
            default={track.default}
          />
        ))}
      </MediaProvider>

      <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={thumbnails} />
    </MediaPlayer>
  );
}

export interface SecureVideoPlayerProps extends Omit<
  VideoPlayerProps,
  "hlsConfig"
> {
  authToken?: string;
  authHeader?: string;
  keyServerUrl?: string;
  customHeaders?: Record<string, string>;
  onKeyLoad?: () => void;
  onKeyLoadError?: (error: Error) => void;
}

export function SecureVideoPlayer({
  authToken,
  authHeader = "Authorization",
  keyServerUrl,
  customHeaders,
  onKeyLoad,
  onKeyLoadError,
  onReady,
  onError,
  ...props
}: SecureVideoPlayerProps) {
  const hlsConfig: Partial<HlsConfig> = React.useMemo(
    () => ({
      xhrSetup: (xhr: XMLHttpRequest, _url: string) => {
        if (authToken) {
          xhr.setRequestHeader(authHeader, `Bearer ${authToken}`);
        }

        if (customHeaders) {
          Object.entries(customHeaders).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }
      },

      licenseXhrSetup: keyServerUrl
        ? (xhr: XMLHttpRequest, _url: string) => {
            xhr.open("GET", keyServerUrl, true);

            if (authToken) {
              xhr.setRequestHeader(authHeader, `Bearer ${authToken}`);
            }

            if (customHeaders) {
              Object.entries(customHeaders).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
              });
            }
          }
        : undefined,
    }),
    [authToken, authHeader, keyServerUrl, customHeaders]
  );

  const handleReady = React.useCallback(() => {
    onKeyLoad?.();
    onReady?.();
  }, [onKeyLoad, onReady]);

  const handleError = React.useCallback(
    (error: Error) => {
      if (error.message.includes("key") || error.message.includes("decrypt")) {
        onKeyLoadError?.(error);
      }
      onError?.(error);
    },
    [onKeyLoadError, onError]
  );

  return (
    <VideoPlayer
      {...props}
      hlsConfig={hlsConfig}
      onReady={handleReady}
      onError={handleError}
    />
  );
}

export { type MediaPlayerInstance };
