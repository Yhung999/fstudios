import { useEffect, useState } from "react";
import { getPopularAnime, getTrendingAnime } from "../services/source";
import type { Media } from "../types";
import AnimeCard from "../components/AnimeCard";
import { useAppStore } from "../store/appStore";

export default function Library() {
  const favorites = useAppStore((state) => state.favorites);
  const history = useAppStore((state) => state.history);
  const [libraryItems, setLibraryItems] = useState<Media[]>([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([getTrendingAnime(), getPopularAnime()])
      .then(([trending, popular]) => {
        if (!mounted) return;
        setLibraryItems([...trending, ...popular]);
      })
      .catch((error) => {
        console.error("Failed to load library items", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const savedAnime = libraryItems.filter((anime) =>
    favorites.includes(anime.id)
  );

  const historyAnime = libraryItems.filter((anime) =>
    history.includes(anime.id)
  );

  return (
    <div>
      <div className="page-title">
        <h1>My Library</h1>
        <p>Your personal collection.</p>
      </div>

      <section className="content-section">
        <div className="section-heading">
          <h2>Favorites</h2>
        </div>

        {savedAnime.length ? (
          <div className="anime-grid">
            {savedAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Your library is empty</h3>
            <p>Add anime to your library to see them here.</p>
          </div>
        )}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Recently Watched</h2>
        </div>

        <div className="anime-grid">
          {historyAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>
    </div>
  );
}