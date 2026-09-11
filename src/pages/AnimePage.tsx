import { useEffect, useState } from "react";
import { getAnimeCatalog } from "../services/source";
import AnimeCard from "../components/AnimeCard";
import type { Media } from "../types";

export default function AnimePage() {
  const [animeData, setAnimeData] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState<string | undefined>();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPage(1);

    getAnimeCatalog(1, genre)
      .then((items) => {
        if (mounted) setAnimeData(items);
      })
      .catch((error) => {
        console.error("Failed to load anime data", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [genre]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);

    getAnimeCatalog(nextPage, genre)
      .then((items) => {
        setAnimeData((current) => {
          const existing = new Set(current.map((item) => item.id));
          return [...current, ...items.filter((item) => !existing.has(item.id))];
        });
        setPage(nextPage);
      })
      .catch((error) => console.error("Failed to load more anime", error))
      .finally(() => setLoadingMore(false));
  };

  const filters = [
    ["All", undefined],
    ["Action", "Action"],
    ["Adventure", "Adventure"],
    ["Fantasy", "Fantasy"],
    ["Romance", "Romance"],
    ["Sci-Fi", "Sci-Fi"],
    ["Comedy", "Comedy"],
    ["Drama", "Drama"],
    ["Horror", "Horror"],
    ["Sports", "Sports"],
  ] as const;

  return (
    <div>
      <div className="page-title">
        <h1>Anime</h1>
        <p>Discover your next favorite series.</p>
      </div>

      <div className="filter-bar">
        {filters.map(([label, value]) => (
          <button
            key={label}
            className={genre === value ? "filter active" : "filter"}
            onClick={() => setGenre(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">
          <h3>Loading anime…</h3>
        </div>
      ) : (
        <div className="anime-grid large">
          {animeData.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}

      {!loading && animeData.length > 0 && (
        <div className="catalog-more">
          <button className="primary-button" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading more…" : "Load more anime"}
          </button>
          <span>Page {page} · {animeData.length} titles loaded</span>
        </div>
      )}
    </div>
  );
}