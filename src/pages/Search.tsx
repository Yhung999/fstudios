import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchAnime } from "../services/source";
import AnimeCard from "../components/AnimeCard";
import type { Media } from "../types";

export default function Search() {
  const [params] = useSearchParams();
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  const query = params.get("q") || "";

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    searchAnime(query)
      .then((items) => {
        if (mounted) setResults(items);
      })
      .catch((error) => {
        console.error("Failed to search anime", error);
        if (mounted) setResults([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <div>
      <div className="page-title">
        <h1>Search</h1>
        <p>
          {query
            ? `Results for "${query}"`
            : "Find something to watch."}
        </p>
      </div>

      {loading ? (
        <div className="empty">
          <h2>Searching…</h2>
          <p>Looking for live matches.</p>
        </div>
      ) : results.length ? (
        <div className="anime-grid">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime as any} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>No results found</h2>
          <p>Try searching for another title.</p>
        </div>
      )}
    </div>
  );
}