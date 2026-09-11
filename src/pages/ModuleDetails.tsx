import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getVideoModules } from "../services/source";
import type { SourceModule } from "../types";

export default function ModuleDetails() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<SourceModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getVideoModules()
      .then((modules) => {
        if (!mounted) return;
        const match = modules.find((item) => item.moduleId === moduleId);
        setModule(match ?? null);
      })
      .catch((error) => {
        console.error("Failed to load module details", error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [moduleId]);

  if (loading) {
    return (
      <div className="empty">
        <h3>Loading module…</h3>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="empty">
        <h3>Module not found</h3>
        <p>The selected provider could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="details">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>

      <div className="details-banner" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(236,72,153,0.6))" }} />

      <div className="details-content">
        <div className="details-poster" style={{ display: "grid", placeItems: "center", fontSize: "3rem", fontWeight: 800 }}>
          {module.presentation?.category?.[0] ?? module.contentType[0].toUpperCase()}
        </div>

        <div className="details-info">
          <span className="featured">{module.contentType.toUpperCase()}</span>
          <h1>{module.moduleId}</h1>

          <div className="hero-meta">
            <span>{module.presentation?.category ?? "Media"}</span>
            <span>{module.presentation?.language ?? "Unknown"}</span>
            <span>{module.version}</span>
          </div>

          <p>
            {module.presentation?.purpose ?? "Live Synthetiq content provider"}
          </p>

          <div className="genres">
            <span>{module.moduleFamilyId ?? module.moduleId}</span>
            <span>{module.presentation?.recommended ? "Recommended" : "Optional"}</span>
          </div>

          <div className="hero-buttons">
            <a
              href={module.packageUrl}
              target="_blank"
              rel="noreferrer"
              className="primary-button"
              style={{ textDecoration: "none" }}
            >
              Open package
            </a>
            <button className="secondary-button" onClick={() => navigate("/discover")}>
              Browse catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
