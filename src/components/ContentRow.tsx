import type { Media } from "../types";
import AnimeCard from "./AnimeCard";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  items: Media[];
  to: string;
}

export default function ContentRow({ title, items, to }: Props) {
  const navigate = useNavigate();

  return (
    <section className="content-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <button type="button" onClick={() => navigate(to)}>View all</button>
      </div>

      <div className="anime-grid">
        {items.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
}