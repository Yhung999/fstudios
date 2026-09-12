import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, EyeOff, Settings2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getMangaChapters, getMangaPages, searchMangaSource } from "../services/source";
import { useAppStore } from "../store/appStore";
import type { MangaChapter } from "../types";

type Direction = "rtl" | "ltr" | "vertical";

type MangaPreference = {
  direction: Direction;
  spread: boolean;
  fit: "width" | "height" | "original";
  trim: boolean;
  grayscale: boolean;
  brightness: number;
  contrast: number;
  locked: boolean;
};

const defaults: MangaPreference = {
  direction: "rtl",
  spread: false,
  fit: "width",
  trim: false,
  grayscale: false,
  brightness: 100,
  contrast: 100,
  locked: false,
};

export default function MangaReader() {
  const { mangaId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [pages, setPages] = useState<string[]>([]);
  const [title, setTitle] = useState("Manga Reader");
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [chapterId, setChapterId] = useState(params.get("chapter") || "");
  const [page, setPage] = useState(0);
  const [privateMode, setPrivateMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const storedPreference = useAppStore((state) => state.mangaPreferences[mangaId || ""]);
  const mangaProgress = useAppStore((state) => state.mangaProgress);
  const setMangaPreference = useAppStore((state) => state.setMangaPreference);
  const setMangaProgress = useAppStore((state) => state.setMangaProgress);
  const addMangaHistory = useAppStore((state) => state.addMangaHistory);

  const preference: MangaPreference = { ...defaults, ...storedPreference };
  const currentChapterIndex = chapters.findIndex((chapter) => (chapter.id || chapter.href) === chapterId);
  const currentChapter = currentChapterIndex >= 0 ? chapters[currentChapterIndex] : chapters[0];
  const canPrevious = page > 0 || currentChapterIndex > 0;
  const canNext = page < pages.length - 1 || currentChapterIndex < chapters.length - 1;

  useEffect(() => {
    if (!mangaId) return;
    let active = true;
    setLoading(true);

    searchMangaSource(mangaId)
      .then(async (results) => {
        if (!active) return;
        const result = results[0];
        if (result) {
          setTitle(result.title);
          const seriesId = result.id || result.href || mangaId;
          const items = await getMangaChapters(seriesId);
          if (active) {
            setChapters(items);
            const requested = params.get("chapter");
            setChapterId(requested || items[0]?.id || items[0]?.href || "");
          }
        }
      })
      .catch((error) => console.error("Failed to load manga chapters", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mangaId]);

  useEffect(() => {
    if (!chapterId) return;
    let active = true;
    setPageLoading(true);
    getMangaPages(chapterId)
      .then((items) => {
        if (!active) return;
        setPages(items);
        const savedPage = Number.isFinite(mangaProgress[chapterId]) ? mangaProgress[chapterId] : 0;
        setPage(Math.min(savedPage, Math.max(items.length - 1, 0)));
      })
      .catch((error) => console.error("Failed to load manga pages", error))
      .finally(() => {
        if (active) setPageLoading(false);
      });
    return () => {
      active = false;
    };
  }, [chapterId, mangaProgress]);

  useEffect(() => {
    if (mangaId) addMangaHistory(mangaId, privateMode);
  }, [mangaId, privateMode]);

  useEffect(() => {
    if (preference.direction === "vertical" || !pages.length) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        handlePageStep(1);
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        handlePageStep(-1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [page, pages.length, preference.direction]);

  const updatePreference = (patch: Partial<MangaPreference>) => {
    if (mangaId) setMangaPreference(mangaId, patch);
  };

  const savePage = (nextPage: number) => {
    const bounded = Math.max(0, Math.min(pages.length - 1, nextPage));
    setPage(bounded);
    if (chapterId) setMangaProgress(chapterId, bounded);
  };

  const handlePageStep = (step: number) => {
    if (preference.direction === "vertical" || !pages.length) return;
    savePage(page + step);
  };

  const openChapter = (nextId: string) => {
    if (!nextId) return;
    setChapterId(nextId);
    setPage(0);
    navigate(`/manga/${mangaId}/read?chapter=${encodeURIComponent(nextId)}`);
  };

  const changeChapter = (offset: number) => {
    const nextIndex = currentChapterIndex + offset;
    const nextChapter = chapters[nextIndex];
    if (nextChapter) {
      const nextId = nextChapter.id || nextChapter.href || "";
      openChapter(nextId);
    }
  };

  const visiblePages = preference.direction === "vertical"
    ? pages
    : pages.slice(page, page + (preference.spread ? 2 : 1));
  const filter = `brightness(${preference.brightness}%) contrast(${preference.contrast}%)${preference.grayscale ? " grayscale(1)" : ""}`;
  const sourceLabel = title || "Manga Reader";

  if (loading) return <div className="empty"><h3>Loading reader…</h3></div>;

  return (
    <div className={`manga-reader manga-reader-${preference.direction}`}>
      <header className="reader-toolbar">
        <button className="back-button" onClick={() => navigate(`/manga/${mangaId}`)}><ArrowLeft size={18} /> Back</button>
        <div className="reader-heading"><strong>{title}</strong><span>{currentChapter?.title || "Choose a chapter"}</span></div>
        <button className="reader-icon-button" onClick={() => setSettingsOpen((value) => !value)} title="Reader settings"><Settings2 size={18} /></button>
      </header>

      {settingsOpen && (
        <section className="reader-settings">
          <label>Direction
            <select value={preference.direction} onChange={(event) => updatePreference({ direction: event.target.value as Direction })}>
              <option value="rtl">Right to left</option><option value="ltr">Left to right</option><option value="vertical">Vertical scroll</option>
            </select>
          </label>
          <label>Fit
            <select value={preference.fit} onChange={(event) => updatePreference({ fit: event.target.value as MangaPreference["fit"] })}>
              <option value="width">Fit width</option><option value="height">Fit height</option><option value="original">Original</option>
            </select>
          </label>
          <label>Brightness <input type="range" min="70" max="140" value={preference.brightness} onChange={(event) => updatePreference({ brightness: Number(event.target.value) })} /></label>
          <label>Contrast <input type="range" min="70" max="150" value={preference.contrast} onChange={(event) => updatePreference({ contrast: Number(event.target.value) })} /></label>
          <label className="reader-check"><input type="checkbox" checked={preference.spread} onChange={(event) => updatePreference({ spread: event.target.checked })} /> Dual-page spread</label>
          <label className="reader-check"><input type="checkbox" checked={preference.trim} onChange={(event) => updatePreference({ trim: event.target.checked })} /> Smart trim margins</label>
          <label className="reader-check"><input type="checkbox" checked={preference.grayscale} onChange={(event) => updatePreference({ grayscale: event.target.checked })} /> Grayscale / E-Ink</label>
          <label className="reader-check"><input type="checkbox" checked={preference.locked} onChange={(event) => updatePreference({ locked: event.target.checked })} /> Lock for this series</label>
          <label className="reader-check"><input type="checkbox" checked={privateMode} onChange={(event) => setPrivateMode(event.target.checked)} /> Incognito history</label>
        </section>
      )}

      <div className="reader-chapter-bar">
        <button onClick={() => changeChapter(-1)} disabled={currentChapterIndex <= 0}>Previous chapter</button>
        <select value={chapterId} onChange={(event) => openChapter(event.target.value)}>
          {chapters.map((chapter) => <option key={chapter.id || chapter.href} value={chapter.id || chapter.href}>{chapter.title}</option>)}
        </select>
        <button onClick={() => changeChapter(1)} disabled={currentChapterIndex >= chapters.length - 1}>Next chapter</button>
        <span className="reader-source-label">{sourceLabel}</span>
      </div>

      <main
        className={`reader-canvas reader-fit-${preference.fit}${preference.trim ? " reader-trim" : ""}`}
        style={{ filter }}
        tabIndex={0}
        onWheel={(event) => {
          if (preference.direction === "vertical" || !pages.length) return;
          if (Math.abs(event.deltaY) < 12) return;
          event.preventDefault();
          handlePageStep(event.deltaY > 0 ? 1 : -1);
        }}
      >
        {pageLoading ? <div className="empty"><h3>Loading pages…</h3></div> : visiblePages.map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt={`Page ${page + index + 1}`} loading={index < 3 ? "eager" : "lazy"} />
        ))}
      </main>

      {preference.direction !== "vertical" && (
        <div className="reader-pagination">
          <button onClick={() => savePage(page - 1)} disabled={!canPrevious}><ChevronLeft size={19} /></button>
          <span>Page {Math.min(page + 1, pages.length)} / {pages.length}</span>
          <button onClick={() => savePage(page + 1)} disabled={!canNext}><ChevronRight size={19} /></button>
        </div>
      )}

      {privateMode && <div className="reader-private"><EyeOff size={14} /> Incognito reading enabled</div>}
    </div>
  );
}
