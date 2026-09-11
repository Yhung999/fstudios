import { Star, Plus, Check, Play } from "lucide-react";
import type { Media } from "../types";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";

interface Props {
  anime: Media;
}

export default function AnimeCard({ anime }: Props) {
  const navigate = useNavigate();

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore(
    (state) => state.toggleFavorite
  );

  const saved = favorites.includes(anime.id);

  const ratingValue = anime.rating ?? anime.score ?? 0;
  const episodeLabel = anime.episodes
    ? `${anime.episodes} eps`
    : `${anime.chapters ?? 0} ch`;

  return (
    <article className="anime-card">
      <div
        className="poster"
        onClick={() => navigate(`/anime/${anime.id}`)}
      >
        <img src={anime.image} alt={anime.title} />

        <div className="rating">
          <Star size={13} fill="currentColor" />
          {ratingValue.toFixed ? ratingValue.toFixed(1) : ratingValue}
        </div>

        <button
          className="card-play-button"
          aria-label={`Watch ${anime.title}`}
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/watch/${anime.id}`);
          }}
        >
          <Play size={17} fill="currentColor" />
        </button>

        <button
          className="add-button"
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(anime.id);
          }}
        >
          {saved ? <Check size={17} /> : <Plus size={17} />}
        </button>
      </div>

      <div className="card-info">
        <h3>{anime.title}</h3>

        <div className="meta">
          <span>{anime.year ?? "N/A"}</span>
          <span>•</span>
          <span>{episodeLabel}</span>
        </div>
      </div>
    </article>
  );
}