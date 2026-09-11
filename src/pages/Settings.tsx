import { Moon, Sun, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import { getVideoModules } from "../services/source";
import type { SourceModule } from "../types";

export default function Settings() {
  const {
    darkMode,
    toggleTheme,
    appName,
    setAppName,
    selectedSourceId,
    selectedSourceName,
    setSelectedSource,
  } = useAppStore();

  const [name, setName] = useState(appName);
  const [sources, setSources] = useState<SourceModule[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);

  useEffect(() => {
    let mounted = true;

    getVideoModules()
      .then((items) => {
        if (!mounted) return;
        setSources(items);

        if (!selectedSourceId && items[0]) {
          setSelectedSource(items[0].moduleId, items[0].moduleId);
        }
      })
      .catch((error) => {
        console.error("Failed to load source modules", error);
      })
      .finally(() => {
        if (mounted) setLoadingSources(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedSourceId, setSelectedSource]);

  return (
    <div className="settings">
      <div className="page-title">
        <h1>Settings</h1>
        <p>Customize your FStudios experience.</p>
      </div>

      <section className="settings-section">
        <h2>Appearance</h2>

        <div className="setting">
          <div>
            <strong>Theme</strong>
            <p>Choose how FStudios looks.</p>
          </div>

          <button className="theme-button" onClick={toggleTheme}>
            {darkMode ? (
              <>
                <Moon size={18} />
                Dark
              </>
            ) : (
              <>
                <Sun size={18} />
                Light
              </>
            )}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Branding</h2>

        <div className="setting-column">
          <label>App name</label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="FStudios"
          />

          <button className="primary-button" onClick={() => setAppName(name)}>
            <Save size={17} />
            Save Name
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Sources</h2>

        <div className="setting-column">
          <strong>Current source</strong>
          <p>{selectedSourceName}</p>
        </div>

        {loadingSources ? (
          <div className="empty">
            <h3>Loading sources…</h3>
          </div>
        ) : (
          <div className="anime-grid">
            {sources.map((source) => (
              <button
                key={source.moduleId}
                className="anime-card"
                onClick={() =>
                  setSelectedSource(source.moduleId, source.moduleId)
                }
                style={{
                  border: selectedSourceId === source.moduleId ? "1px solid #8b5cf6" : "1px solid rgba(255,255,255,0.08)",
                  background: selectedSourceId === source.moduleId ? "rgba(124,58,237,0.12)" : undefined,
                }}
              >
                <div className="poster" style={{ display: "grid", placeItems: "center" }}>
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.2))", fontWeight: 800 }}>
                    {source.presentation?.category?.[0] ?? source.contentType[0].toUpperCase()}
                  </div>
                </div>
                <div className="card-info">
                  <h3>{source.moduleId}</h3>
                  <div className="meta">
                    <span>{source.presentation?.category ?? source.contentType}</span>
                    <span>•</span>
                    <span>{source.presentation?.language ?? "Unknown"}</span>
                  </div>
                  <p>{source.presentation?.purpose ?? "Source module"}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="settings-section">
        <h2>Playback</h2>

        <div className="setting">
          <div>
            <strong>Auto play</strong>
            <p>Automatically play the next episode.</p>
          </div>

          <input type="checkbox" defaultChecked />
        </div>

        <div className="setting">
          <div>
            <strong>Auto next</strong>
            <p>Move to the next episode automatically.</p>
          </div>

          <input type="checkbox" defaultChecked />
        </div>
      </section>
    </div>
  );
}