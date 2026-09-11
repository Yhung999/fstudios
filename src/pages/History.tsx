import { useEffect, useState } from "react";
import { Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMediaDetails } from "../services/source";
import { useAppStore } from "../store/appStore";
import type { Media } from "../types";

export default function History() {
  const navigate = useNavigate();
  const history = useAppStore((state) => state.history);
  const historyMedia = useAppStore((state) => state.historyMedia);
  const continueWatching = useAppStore((state) => state.continueWatching);
  const removeHistory = useAppStore((state) => state.removeHistory);
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all(history.map((id) => historyMedia[id] || getMediaDetails(Number(id), "ANIME")))
      .then((results) => {
        if (active) setItems(results.filter((item): item is Media => item !== null));
      })
      .catch((error) => console.error("Failed to load watch history", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [history, historyMedia]);

  return (
    <div>
      <div className="page-title">
        <h1>History</h1>
        <p>Your recently watched titles.</p>
      </div>

      {loading ? (
        <div className="empty"><h3>Loading history…</h3></div>
      ) : items.length ? (
        <div className="history-list">
          {items.map((item) => {
            const episode = continueWatching[item.id] ?? 1;
            return (
              <article className="history-item" key={item.id}>
                <img src={item.image} alt={item.title} />
                <div className="history-item-info">
                  <h3>{item.title}</h3>
                  <p>Episode {episode} · {item.status ?? "Anime"}</p>
                  <button className="primary-button" onClick={() => navigate(`/watch/${item.id}?episode=${episode}`)}>
                    <Play size={16} fill="currentColor" /> Continue
                  </button>
                </div>
                <button className="history-remove" title="Remove from history" onClick={() => removeHistory(item.id)}>
                  <Trash2 size={17} />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <h3>No recent watch history</h3>
          <p>Open a title and it will appear here.</p>
        </div>
      )}
    </div>
  );
}
