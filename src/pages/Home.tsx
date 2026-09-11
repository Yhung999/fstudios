import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import ContentRow from "../components/ContentRow";
import {
  getTrendingAnime,
  getPopularAnime,
  getLatestAnime,
  getPopularManga,
} from "../services/source";
import type { Media } from "../types";

export default function Home() {
  const [featured, setFeatured] = useState<Media | null>(null);
  const [continueWatching, setContinueWatching] = useState<Media[]>([]);
  const [trending, setTrending] = useState<Media[]>([]);
  const [popular, setPopular] = useState<Media[]>([]);
  const [manga, setManga] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getTrendingAnime(),
      getPopularAnime(),
      getLatestAnime(),
      getPopularManga(),
    ])
      .then(([trendingItems, popularItems, latestItems, mangaItems]) => {
        if (!mounted) return;

        setFeatured(trendingItems[0] ?? popularItems[0] ?? latestItems[0] ?? null);
        setContinueWatching(latestItems.slice(0, 10));
        setTrending(trendingItems.slice(0, 12));
        setPopular(popularItems.slice(0, 12));
        setManga(mangaItems.slice(0, 10));
      })
      .catch((error) => {
        console.error("Failed to load home data", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !featured) {
    return (
      <div className="empty">
        <h3>Loading home feed…</h3>
        <p>Fetching live anime data.</p>
      </div>
    );
  }

  return (
    <>
      <Hero anime={featured} />

      <ContentRow title="Continue Watching" items={continueWatching} to="/history" />

      <ContentRow title="Trending Now" items={trending} to="/anime" />

      <ContentRow title="Popular This Week" items={popular} to="/anime" />

      <ContentRow title="Fresh Manga" items={manga} to="/manga" />
    </>
  );
}