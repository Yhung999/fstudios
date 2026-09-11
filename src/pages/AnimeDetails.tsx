import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Heart, ArrowLeft } from "lucide-react";
import { getMediaDetails, getTrendingAnime } from "../services/source";
import { useAppStore } from "../store/appStore";
import type { Media } from "../types";

export default function AnimeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Media | null>(null);
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);

  useEffect(() => {
    const numericId = Number(id);
    if (!id || Number.isNaN(numericId)) {
      setAnime(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    Promise.all([
      getMediaDetails(numericId, "ANIME"),
      getTrendingAnime(),
    ])
      .then(([media, trending]) => {
        if (!mounted) return;
        setAnime(media);
        setRecommendations(trending.filter((item) => item.id !== String(numericId)).slice(0, 5));
      })
      .catch((error) => {
        console.error("Failed to load anime details", error);
        if (mounted) setAnime(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="empty">
        <h3>Loading details…</h3>
      </div>
    );
  }

  if (!anime) {
    return <h1>Anime not found</h1>;
  }

  const saved = favorites.includes(anime.id);
  const seasons = [anime, ...(anime.seasons || [])]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index)
    .sort((left, right) => (left.year ?? 0) - (right.year ?? 0));

  return (
    <div className="details">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Back
      </button>

      <div
        className="details-banner"
        style={{
          backgroundImage: `url(${anime.banner || anime.image})`,
        }}
      />

      <div className="details-content">
        <img
          className="details-poster"
          src={anime.image}
          alt={anime.title}
        />

        <div className="details-info">
          <span className="featured">ANIME</span>

          <h1>{anime.title}</h1>

          <div className="hero-meta">
            <span>★ {anime.rating ?? anime.score ?? 0}</span>
            <span>{anime.year ?? "N/A"}</span>
            <span>{anime.episodes ?? 0} Episodes</span>
            <span>{anime.status ?? "Unknown"}</span>
          </div>

          <p>{anime.description}</p>

          <div className="genres">
            {(anime.genres || []).map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={() => navigate(`/watch/${anime.id}`)}
            >
              <Play size={18} fill="currentColor" />
              Start Watching
            </button>

            <button
              className="secondary-button"
              onClick={() => toggleFavorite(anime.id)}
            >
              <Heart
                size={18}
                fill={saved ? "currentColor" : "none"}
              />

              {saved ? "Saved" : "Add to Library"}
            </button>
          </div>
        </div>
      </div>

      {seasons.length > 1 && (
        <section className="season-picker">
          <div className="section-heading">
            <h2>Seasons</h2>
            <span>Jump directly to a season</span>
          </div>
          <div className="season-list">
            {seasons.map((season, index) => (
              <button
                key={season.id}
                className={season.id === anime.id ? "season-button active" : "season-button"}
                onClick={() => navigate(`/anime/${season.id}`)}
              >
                <img src={season.image} alt="" />
                <span>
                  <strong>{index === 0 ? "Season 1" : `Season ${index + 1}`}</strong>
                  <small>{season.title}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="episodes">
        <div className="section-heading">
          <h2>Episodes</h2>
          <span>{anime.episodes ?? 0} episodes</span>
        </div>

        <div className="episode-grid">
          {Array.from({
            length: Math.min(anime.episodes ?? 0, 12),
          }).map((_, index) => (
            <button
              className="episode"
              key={index}
              onClick={() =>
                navigate(`/watch/${anime.id}?episode=${index + 1}`)
              }
            >
              <span>{index + 1}</span>
              <div>
                <strong>Episode {index + 1}</strong>
                <small>Watch episode</small>
              </div>
              <Play size={17} />
            </button>
          ))}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="content-section">
          <div className="section-heading">
            <h2>Recommendations</h2>
          </div>
          <div className="anime-grid">
            {recommendations.map((item) => (
              <button
                key={item.id}
                className="anime-card"
                onClick={() => navigate(`/anime/${item.id}`)}
                style={{ border: "none", background: "transparent", textAlign: "left" }}
              >
                <div className="poster">
                  <img src={item.image} alt={item.title} />
                  <div className="rating">
                    <span>★</span>
                    {item.rating ?? item.score ?? 0}
                  </div>
                </div>
                <div className="card-info">
                  <h3>{item.title}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}