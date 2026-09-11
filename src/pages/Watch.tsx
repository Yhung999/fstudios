import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { useNavigate } from "react-router-dom";
import Hls from "hls.js";
import { SkipForward } from "lucide-react";

import { getMediaDetails, resolveStream } from "../services/source";
import { useAppStore } from "../store/appStore";
import type { Media, Stream } from "../types";

export default function Watch() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Media | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState(true);
  const [language, setLanguage] = useState<"sub" | "dub">("sub");
  const [quality, setQuality] = useState("Auto");
  const [seekNotice, setSeekNotice] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const positionRef = useRef(0);
  const savedPositionRef = useRef(0);
  const lastTapRef = useRef({ time: 0, side: "" });
  const activeStreamIndex = streams.findIndex((stream) => stream.id === quality);

  const handlePlaybackError = () => {
    const nextStream = streams[activeStreamIndex + 1];
    if (nextStream) {
      rememberPosition();
      setStreamError(null);
      setQuality(nextStream.id || "");
      return;
    }

    setStreamError("This stream could not be played by the browser. Try another quality.");
  };
  const episode = Number(params.get("episode")) || 1;
  const playbackKey = `${id}:${episode}`;

  const addHistory = useAppStore((state) => state.addHistory);
  const saveHistoryMedia = useAppStore((state) => state.saveHistoryMedia);
  const setProgress = useAppStore((state) => state.setProgress);
  const setPlaybackPosition = useAppStore((state) => state.setPlaybackPosition);
  const savedPosition = useAppStore((state) => state.playbackPositions[`${id}:${episode}`] ?? 0);
  const selectedSourceId = useAppStore((state) => state.selectedSourceId);
  const selectedSourceName = useAppStore((state) => state.selectedSourceName);

  useEffect(() => {
    positionRef.current = savedPosition;
    savedPositionRef.current = savedPosition;
  }, [playbackKey]);

  const rememberPosition = () => {
    const currentTime = videoRef.current?.currentTime ?? positionRef.current;
    if (Number.isFinite(currentTime) && currentTime > 0) {
      positionRef.current = currentTime;
      setPlaybackPosition(playbackKey, currentTime);
    }
  };

  const handleVideoTouch = (event: TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const side = event.changedTouches[0].clientX < event.currentTarget.clientWidth / 2 ? "left" : "right";
    const previous = lastTapRef.current;

    if (now - previous.time < 320 && previous.side === side && videoRef.current) {
      const delta = side === "left" ? -10 : 10;
      const nextTime = Math.max(0, Math.min(videoRef.current.duration || Infinity, videoRef.current.currentTime + delta));
      videoRef.current.currentTime = nextTime;
      positionRef.current = nextTime;
      setPlaybackPosition(playbackKey, nextTime);
      setSeekNotice(`${delta > 0 ? "+10" : "-10"} seconds`);
      window.setTimeout(() => setSeekNotice(null), 700);
    }

    lastTapRef.current = { time: now, side };
  };

  useEffect(() => {
    const numericId = Number(id);
    if (!id || Number.isNaN(numericId)) {
      setAnime(null);
      return;
    }

    getMediaDetails(numericId, "ANIME")
      .then((media) => {
        setAnime(media);
        if (media) {
          addHistory(media.id);
          saveHistoryMedia(media);
          setProgress(media.id, episode);
        }
      })
      .catch((error) => {
        console.error("Failed to load watch data", error);
        setAnime(null);
      });
  }, [id, addHistory, saveHistoryMedia, setProgress, episode]);

  useEffect(() => {
    if (!anime) return;

    let mounted = true;
    const timeout = window.setTimeout(() => {
      if (mounted) {
        setStreamLoading(false);
        setStreamError("The source took too long to respond. Try another source or language.");
      }
    }, 45000);

    setStreamLoading(true);
    setStreamError(null);
    setStreams([]);

    resolveStream(selectedSourceId, anime.title, episode, language)
      .then((items) => {
        if (mounted) {
          setStreams(items);
          setQuality(items[0]?.id || "");
        }
      })
      .catch((error) => {
        if (mounted) {
          setStreamError(error instanceof Error ? error.message : "Playback could not be resolved.");
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (mounted) setStreamLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [anime, episode, selectedSourceId, language]);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streams.find((item) => item.id === quality) || streams[0];
    if (!video || !stream) return;

    video.currentTime = positionRef.current || savedPositionRef.current;

    const restorePosition = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(positionRef.current || savedPositionRef.current, Math.max(0, video.duration - 1));
      }
    };
    video.addEventListener("loadedmetadata", restorePosition, { once: true });

    if (stream.type === "hls" && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      const activeIndex = streams.findIndex((item) => item.url === stream.url);
      let recoveryAttempts = 0;
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && recoveryAttempts < 2) {
          recoveryAttempts += 1;
          hls.startLoad();
          return;
        }

        if (activeIndex >= 0 && streams[activeIndex + 1]) {
          rememberPosition();
          setQuality(streams[activeIndex + 1].id || "");
        } else {
          setStreamError("The provider stream failed. Try another quality or source.");
        }
      });
      hls.attachMedia(video);
      hls.loadSource(stream.url);

      return () => {
        rememberPosition();
        video.removeEventListener("loadedmetadata", restorePosition);
        hls.destroy();
      };
    }

    if (stream.type === "hls" && !video.canPlayType("application/vnd.apple.mpegurl")) {
      setStreamError("This browser cannot play HLS streams.");
      video.removeEventListener("loadedmetadata", restorePosition);
      return;
    }

    video.src = stream.url;
    video.load();
    return () => {
      rememberPosition();
      video.removeEventListener("loadedmetadata", restorePosition);
    };
  }, [quality, streams]);

  const qualities = streams.map((stream) => ({
    id: stream.id || stream.url,
    label: stream.quality || "Auto",
    language: stream.language || "",
  }));
  const totalEpisodes = anime?.episodes ?? 0;
  const hasNextEpisode = totalEpisodes > 0 && episode < totalEpisodes;

  const goToNextEpisode = () => {
    if (hasNextEpisode) {
      rememberPosition();
      navigate(`/watch/${id}?episode=${episode + 1}`);
    }
  };

  if (!anime) {
    return <h1>Video not found</h1>;
  }

  return (
    <div className="watch-page">
      <div className="video-player" onTouchEnd={handleVideoTouch}>
        {streamLoading ? (
          <div className="video-status">Finding a stream from {selectedSourceName}…</div>
        ) : streamError ? (
          <div className="video-status video-error">
            <strong>Playback unavailable</strong>
            <span>{streamError}</span>
            <small>Choose another source in Settings and try this episode again.</small>
          </div>
        ) : (
          <video
            className="video-element"
            controls
            preload="metadata"
            poster={anime.image}
            ref={videoRef}
            onTimeUpdate={(event) => {
              const currentTime = event.currentTarget.currentTime;
              positionRef.current = currentTime;
              if (Math.floor(currentTime) % 3 === 0) {
                setPlaybackPosition(playbackKey, currentTime);
              }
            }}
            onPause={rememberPosition}
            onEnded={rememberPosition}
            onError={handlePlaybackError}
          />
        )}
        {seekNotice && <div className="seek-notice">{seekNotice}</div>}
      </div>

      <div className="player-options">
        <div className="watch-toggle" role="group" aria-label="Audio language">
          <button className={language === "sub" ? "active" : ""} onClick={() => { rememberPosition(); setLanguage("sub"); }}>SUB</button>
          <button className={language === "dub" ? "active" : ""} onClick={() => { rememberPosition(); setLanguage("dub"); }}>DUB</button>
        </div>

        <label className="quality-select">
          Quality / stream
          <select value={quality} onChange={(event) => { rememberPosition(); setQuality(event.target.value); }} disabled={!qualities.length}>
            {qualities.length ? qualities.map((item, index) => <option key={item.id} value={item.id}>{item.label}{item.language ? ` • ${item.language}` : ""}{index > 0 ? " (backup)" : ""}</option>) : <option value="">Auto</option>}
          </select>
        </label>

        <span className="source-note">Source: {selectedSourceName}</span>

        <button
          className="next-episode-button"
          onClick={goToNextEpisode}
          disabled={!hasNextEpisode}
          title={hasNextEpisode ? `Play episode ${episode + 1}` : "Last episode"}
        >
          <SkipForward size={16} />
          Next Episode
        </button>
      </div>

      <div className="watch-info">
        <div>
          <span className="muted">
            {anime.title} • Episode {episode}
          </span>

          <h1>Episode {episode}</h1>

          <p>{anime.description}</p>
        </div>
      </div>

      <section className="episode-strip">
        <h2>More Episodes</h2>

        <div className="episode-scroll">
          {Array.from({ length: Math.min(anime.episodes ?? 0, 20) }).map(
            (_, index) => (
              <button
                className={
                  index + 1 === episode
                    ? "episode-mini selected"
                    : "episode-mini"
                }
                key={index}
                onClick={() => navigate(`/watch/${id}?episode=${index + 1}`)}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </section>
    </div>
  );
}