import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Media } from "../types";

interface FStudiosState {
  darkMode: boolean;

  appName: string;

  accent: string;

  favorites: string[];

  history: string[];

  historyMedia: Record<string, Media>;

  continueWatching: Record<string, number>;

  playbackPositions: Record<string, number>;

  selectedSourceId: string | null;

  selectedSourceName: string;

  mangaPreferences: Record<string, {
    direction: "rtl" | "ltr" | "vertical";
    spread: boolean;
    fit: "width" | "height" | "original";
    trim: boolean;
    grayscale: boolean;
    brightness: number;
    contrast: number;
    locked: boolean;
  }>;

  mangaProgress: Record<string, number>;

  privateMangaHistory: string[];

  toggleDarkMode: () => void;

  toggleTheme: () => void;

  setAppName: (name: string) => void;

  setAccent: (accent: string) => void;

  setSelectedSource: (id: string, name: string) => void;

  toggleFavorite: (id: string) => void;

  addHistory: (id: string) => void;

  saveHistoryMedia: (media: Media) => void;

  setProgress: (animeId: string, episode: number) => void;

  setPlaybackPosition: (key: string, seconds: number) => void;

  removeHistory: (id: string) => void;

  clearHistory: () => void;

  setMangaPreference: (seriesId: string, preference: Partial<FStudiosState["mangaPreferences"][string]>) => void;

  setMangaProgress: (chapterId: string, page: number) => void;

  addMangaHistory: (seriesId: string, privateMode: boolean) => void;
}

export const useStore = create<FStudiosState>()(
  persist(
    (set) => ({
      darkMode: true,

      appName: "FStudios",

      accent: "#8b5cf6",

      favorites: [],

      history: [],

      historyMedia: {},

      continueWatching: {},

      playbackPositions: {},

      selectedSourceId: "all",

      selectedSourceName: "Auto source fallback",

      mangaPreferences: {},

      mangaProgress: {},

      privateMangaHistory: [],

      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      toggleTheme: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      setAppName: (name) =>
        set({
          appName: name.trim() || "FStudios",
        }),

      setAccent: (accent) =>
        set({
          accent,
        }),

      setSelectedSource: (id, name) =>
        set({
          selectedSourceId: id,
          selectedSourceName: name,
        }),

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((item) => item !== id)
            : [...state.favorites, id],
        })),

      addHistory: (id) =>
        set((state) => ({
          history: [id, ...state.history.filter((item) => item !== id)].slice(0, 50),
        })),

      saveHistoryMedia: (media) =>
        set((state) => ({
          historyMedia: {
            ...state.historyMedia,
            [media.id]: media,
          },
        })),

      setProgress: (animeId, episode) =>
        set((state) => ({
          continueWatching: {
            ...state.continueWatching,
            [animeId]: episode,
          },
        })),

      setPlaybackPosition: (key, seconds) =>
        set((state) => ({
          playbackPositions: {
            ...state.playbackPositions,
            [key]: Math.max(0, seconds),
          },
        })),

      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item !== id),
        })),

      clearHistory: () =>
        set({
          history: [],
          historyMedia: {},
          continueWatching: {},
          playbackPositions: {},
        }),

      setMangaPreference: (seriesId, preference) =>
        set((state) => ({
          mangaPreferences: {
            ...state.mangaPreferences,
            [seriesId]: {
              ...{
                direction: "rtl" as const,
                spread: false,
                fit: "width" as const,
                trim: false,
                grayscale: false,
                brightness: 100,
                contrast: 100,
                locked: false,
              },
              ...state.mangaPreferences[seriesId],
              ...preference,
            },
          },
        })),

      setMangaProgress: (chapterId, page) =>
        set((state) => ({
          mangaProgress: {
            ...state.mangaProgress,
            [chapterId]: page,
          },
        })),

      addMangaHistory: (seriesId, privateMode) =>
        privateMode ? undefined : set((state) => ({
          privateMangaHistory: [seriesId, ...state.privateMangaHistory.filter((id) => id !== seriesId)].slice(0, 50),
        })),
    }),
    {
      name: "fstudios-storage",
    }
  )
);

export const useAppStore = useStore;