import { useEffect, useState } from "react";
import { BookOpen, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPopularManga } from "../services/source";
import type { Media } from "../types";

export default function MangaPage() {
  const navigate = useNavigate();
  const [mangaData, setMangaData] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getPopularManga()
      .then((items) => {
        if (mounted) setMangaData(items);
      })
      .catch((error) => {
        console.error("Failed to load manga data", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="page-title">
        <h1>Manga</h1>
        <p>Read your favorite stories.</p>
      </div>

      {loading ? (
        <div className="empty">
          <h3>Loading manga…</h3>
        </div>
      ) : (
        <div className="manga-grid">
          {mangaData.map((manga) => (
            <article className="manga-card" key={manga.id}>
              <div className="manga-cover">
                <img src={manga.image} alt={manga.title} />
                <span className="manga-type">MANGA</span>
              </div>

              <div className="manga-info">
                <h3>{manga.title}</h3>

                <span className="manga-meta">
                  <Star size={13} fill="currentColor" />
                  {manga.rating ?? manga.score ?? 0} • {manga.chapters ?? 0} chapters
                </span>

                <p>{manga.description}</p>

                <button className="primary-button" onClick={() => navigate(`/manga/${encodeURIComponent(manga.title)}/read`)}>
                  <BookOpen size={17} />
                  Read Now
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}