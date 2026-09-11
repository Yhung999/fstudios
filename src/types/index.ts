export type MediaType = "ANIME" | "MANGA" | "anime" | "manga";

export interface Media {
  id: string;
  title: string;
  image: string;
  banner?: string;
  description: string;
  rating?: number;
  score?: number;
  year?: number;
  genres: string[];
  episodes?: number;
  chapters?: number;
  status?: string;
  type: MediaType;
  seasons?: Media[];
}

export interface Anime extends Media {
  type: MediaType;
}

export interface Manga extends Media {
  type: MediaType;
}

export interface MangaChapter {
  id: string;
  href?: string;
  number?: number;
  title: string;
}

export interface Episode {
  id: string;
  number: number;
  title?: string;
  thumbnail?: string;
  duration?: number;
}

export interface Stream {
  url: string;
  id?: string;
  type: "hls" | "mp4";
  quality?: string;
  language?: string;
  subtitles?: Subtitle[];
  headers?: Record<string, string>;
}

export interface Subtitle {
  url: string;
  language: string;
  label?: string;
}

export interface SourceModule {
  moduleId: string;
  moduleFamilyId?: string;
  contentType: string;
  version: string;
  packageUrl: string;

  presentation?: {
    category?: string;
    purpose?: string;
    recommended?: boolean;
    language?: string;
    languages?: string[];
    iconUrl?: string;
  };
}

export interface SynthetiqRepository {
  schemaVersion: number;
  repositoryId: string;
  name: string;
  enabled: boolean;

  bundle?: {
    version: number;
    minAppVersion?: string;
    packageUrl: string;
    sha256?: string;
  };

  modules: SourceModule[];
}