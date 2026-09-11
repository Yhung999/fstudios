import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { searchAnime } from "../services/source";
import type { Media } from "../types";

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideTap = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideTap);
    return () => document.removeEventListener("pointerdown", closeOnOutsideTap);
  }, []);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      searchAnime(value)
        .then((items) => {
          if (active) {
            setResults(items.slice(0, 5));
            setOpen(true);
          }
        })
        .catch(() => {
          if (active) setResults([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const goToSearch = () => {
    const value = query.trim();
    if (value) {
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-bar">
      <Search size={20} />

      <input
        value={query}
        placeholder="Search anime, manga, movies..."
        onFocus={() => {
          window.clearTimeout(blurTimer.current);
          if (results.length) setOpen(true);
        }}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            goToSearch();
          }
        }}
      />

      <kbd>/</kbd>
      </div>

      {open && query.trim().length >= 2 && (
        <div
          className="search-preview"
          onMouseDown={(event) => event.preventDefault()}
          onMouseLeave={() => {
            blurTimer.current = window.setTimeout(() => setOpen(false), 150);
          }}
        >
          {loading ? (
            <div className="search-preview-empty">Searching…</div>
          ) : results.length ? (
            results.map((item) => (
              <button
                className="search-preview-item"
                key={item.id}
                onClick={() => {
                  setOpen(false);
                  navigate(`/anime/${item.id}`);
                }}
              >
                <img src={item.image} alt="" />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.year ?? "N/A"} • {item.episodes ?? 0} episodes</small>
                </span>
              </button>
            ))
          ) : (
            <div className="search-preview-empty">No anime found</div>
          )}

          <button className="search-preview-all" onClick={goToSearch}>
            See all results for “{query.trim()}”
          </button>
        </div>
      )}
    </div>
  );
}