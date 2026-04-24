import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Settings, Maximize } from "lucide-react";
import Hls from "hls.js";
import { Slider } from "@/components/ui/slider";

const formatTime = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

interface VideoPlayerProps {
  videoUrl?: string | null;
  posterUrl?: string | null;
  onFirstPlay?: () => void;
}

const VideoPlayer = ({ videoUrl, posterUrl, onFirstPlay }: VideoPlayerProps) => {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const firstPlayFiredRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  // Reload video when URL changes (HLS-aware)
  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    setPlaying(false);
    setStarted(false);
    setCurrent(0);
    setDuration(0);
    firstPlayFiredRef.current = false;

    // Cleanup any prior hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!videoUrl) {
      v.removeAttribute("src");
      v.load();
      return;
    }

    const isHls = /\.m3u8(\?|$)/i.test(videoUrl);

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(v);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            hlsRef.current = null;
        }
      });
    } else if (isHls && v.canPlayType("application/vnd.apple.mpeg-url")) {
      v.src = videoUrl;
    } else {
      // Legacy mp4 / other: rely on <source> child
      v.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
      if (!firstPlayFiredRef.current) {
        firstPlayFiredRef.current = true;
        onFirstPlay?.();
      }
    };
    const onPause = () => setPlaying(false);
    const onEnd = () => { setPlaying(false); setStarted(false); };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnd);
    };
  }, [onFirstPlay]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const seek = (val: number[]) => {
    const v = ref.current;
    if (!v || !duration) return;
    v.currentTime = (val[0] / 100) * duration;
  };

  const onVol = (val: number[]) => {
    const v = ref.current;
    const nv = val[0] / 100;
    setVolume(nv);
    setMuted(nv === 0);
    if (v) { v.volume = nv; v.muted = nv === 0; }
  };

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    const c = containerRef.current;
    if (!c) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else c.requestFullscreen?.();
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group btn-glow-soft">
      <video
        ref={ref}
        poster={started ? "" : (posterUrl ?? undefined)}
        className="w-full h-full object-contain bg-black"
        onClick={toggle}
        playsInline
        controls={false}
        preload="metadata"
      >
        {videoUrl && !/\.m3u8(\?|$)/i.test(videoUrl) ? (
          <source src={videoUrl} type="video/mp4" />
        ) : null}
      </video>

      {!playing && (
        <button
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 grid place-items-center"
        >
          {!started && posterUrl && (
            <img
              src={posterUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <span className="relative z-10 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-gradient-purple grid place-items-center btn-glow">
            <Play className="h-5 w-5 sm:h-7 sm:w-7 md:h-9 md:w-9 text-white fill-white ml-1" />
          </span>
        </button>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-4">
        <Slider
          value={[progress]}
          onValueChange={seek}
          max={100}
          step={0.1}
          className="mb-2"
        />
        <div className="flex items-center gap-2 sm:gap-3 text-white text-xs sm:text-sm">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="hover:text-primary transition-colors">
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <span className="font-mono whitespace-nowrap">
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button onClick={toggleMute} aria-label="Mute" className="hover:text-primary transition-colors">
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <div className="hidden sm:block w-20">
              <Slider value={[muted ? 0 : volume * 100]} onValueChange={onVol} max={100} step={1} />
            </div>
            <button aria-label="Settings" className="hover:text-primary transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <button onClick={fullscreen} aria-label="Fullscreen" className="hover:text-primary transition-colors">
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;