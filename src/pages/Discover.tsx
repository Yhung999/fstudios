import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVideoModules } from "../services/source";
import type { SourceModule } from "../types";

export default function Discover() {
  const [modules, setModules] = useState<SourceModule[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    getVideoModules()
      .then((items) => {
        if (mounted) setModules(items);
      })
      .catch((error) => {
        console.error("Failed to load Synthetiq modules", error);
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
        <h1>Discover</h1>
        <p>Live module catalogue from the Synthetiq repository.</p>
      </div>

      {loading ? (
        <div className="empty">
          <h3>Loading catalogue…</h3>
          <p>Fetching available video modules.</p>
        </div>
      ) : (
        <div className="anime-grid large">
          {modules.map((module) => (
            <article
              className="anime-card"
              key={module.moduleId}
              onClick={() => navigate(`/discover/${module.moduleId}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="poster" style={{ display: "grid", placeItems: "center" }}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.2))",
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {module.presentation?.category?.[0] ?? module.contentType[0].toUpperCase()}
                </div>
              </div>

              <div className="card-info">
                <h3>{module.moduleId}</h3>
                <div className="meta">
                  <span>{module.presentation?.category ?? module.contentType}</span>
                  <span>•</span>
                  <span>{module.presentation?.language ?? "Unknown"}</span>
                </div>
                <p style={{ marginTop: 8, color: "#b3b6c0" }}>
                  {module.presentation?.purpose ?? "Synthetiq provider"}
                </p>
                <p style={{ marginTop: 6, color: "#8b8f9a", fontSize: 13 }}>
                  {module.version} • {module.moduleFamilyId ?? module.moduleId}
                </p>
                <button
                  type="button"
                  className="primary-button"
                  style={{
                    marginTop: 10,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open(module.packageUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  Open package
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
