import { Play, Plus, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Media } from "../types";

interface Props {
  anime: Media;
}

export default function Hero({ anime }: Props) {
  const navigate = useNavigate();

  return (
    <section
      className="hero"
      style={{
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(5,6,10,.98) 0%,
            rgba(5,6,10,.85) 35%,
            rgba(5,6,10,.25) 75%,
            rgba(5,6,10,.1) 100%
          ),
          url(${anime.banner})
        `,
      }}
    >
      <div className="hero-content">
        <span className="featured">FEATURED</span>

        <h1>{anime.title}</h1>

        <div className="hero-meta">
          <span>★ {anime.rating}</span>
          <span>{anime.year}</span>
          <span>{anime.episodes} Episodes</span>
          <span>{anime.status}</span>
        </div>

        <p>{anime.description}</p>

        <div className="hero-buttons">
          <button
            className="primary-button"
            onClick={() => navigate(`/watch/${anime.id}`)}
          >
            <Play size={19} fill="currentColor" />
            Watch Now
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate(`/anime/${anime.id}`)}
          >
            <Info size={19} />
            Details
          </button>

          <button className="circle-button">
            <Plus size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}