import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Settings, Maximize } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import poster from "@/assets/video-placeholder.jpg";

const formatTime = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const VideoPlayer = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(109);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration || 109);
    const onEnd = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const seek = (val: number[]) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = (val[0] / 100) * duration;
  };

  const onVol = (val: number[]) => {
    const v = ref.current;
    const nv = val[0] / 100;
    setVolume(nv);
    setMuted(nv === 0);
    if (v) {
      v.volume = nv;
      v.muted = nv === 0;
    }
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
        poster={poster}
        className="w-full h-full object-contain bg-black"
        onClick={toggle}
        playsInline
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>

      {!playing && (
        <button
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 grid place-items-center"
        >
          <span className="h-20 w-20 rounded-full bg-gradient-purple grid place-items-center btn-glow">
            <Play className="h-9 w-9 text-white fill-white ml-1" />
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