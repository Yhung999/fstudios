import type {
  Episode,
  Media,
  MediaType,
  SourceModule,
  Stream,
  SynthetiqRepository,
  MangaChapter,
} from "../types";

const ANILIST_URL =
  "https://graphql.anilist.co";

const SYNTHEITQ_REPOSITORY =
  "https://raw.githubusercontent.com/kas021/Synthetiq-Modules/main/repository.json";

const ANILIST_QUERY = `
query (
  $page: Int,
  $perPage: Int,
  $search: String,
  $type: MediaType,
  $sort: [MediaSort],
  $genre: String
) {
  Page(
    page: $page
    perPage: $perPage
  ) {
    media(
      search: $search
      type: $type
      genre: $genre
      sort: $sort
      isAdult: false
    ) {
      id

      title {
        romaji
        english
        native
      }

      coverImage {
        extraLarge
        large
      }

      bannerImage

      description(asHtml: false)

      averageScore

      startDate {
        year
      }

      genres

      episodes
      chapters

      status

      type
    }
  }
}
`;

const DETAIL_QUERY = `
query ($id: Int, $type: MediaType) {
  Media(
    id: $id
    type: $type
  ) {
    id

    title {
      romaji
      english
      native
    }

    coverImage {
      extraLarge
      large
    }

    bannerImage

    description(asHtml: false)

    averageScore

    startDate {
      year
    }

    genres

    episodes
    chapters

    status

    type

    relations {
      edges {
        relationType
        node {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
          }
          bannerImage
          description(asHtml: false)
          averageScore
          startDate {
            year
          }
          genres
          episodes
          status
          type
        }
      }
    }
  }
}
`;

async function anilistRequest(
  query: string,
  variables: Record<string, unknown>
) {
  const response = await fetch(
    ANILIST_URL,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        query,
        variables,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `AniList error: ${response.status}`
    );
  }

  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(
      json.errors[0]?.message ||
        "AniList request failed"
    );
  }

  return json.data;
}

function normalizeMedia(
  item: any
): Media {
  return {
    id: item.id,

    title:
      item.title?.english ||
      item.title?.romaji ||
      item.title?.native ||
      "Unknown",

    image:
      item.coverImage?.extraLarge ||
      item.coverImage?.large ||
      "",

    banner:
      item.bannerImage ||
      item.coverImage?.extraLarge ||
      "",

    description:
      item.description ||
      "No description available.",

    score:
      item.averageScore
        ? item.averageScore / 10
        : 0,

    year:
      item.startDate?.year,

    genres:
      item.genres || [],

    episodes:
      item.episodes,

    chapters:
      item.chapters,

    status:
      item.status,

    type:
      item.type === "MANGA"
        ? "MANGA"
        : "ANIME",
  };
}

/* =========================
   ANIME
========================= */

export async function getTrendingAnime() {
  const data = await anilistRequest(
    ANILIST_QUERY,
    {
      page: 1,
      perPage: 20,
      type: "ANIME",
      sort: ["TRENDING_DESC"],
    }
  );

  return data.Page.media.map(
    normalizeMedia
  ) as Media[];
}

export async function getPopularAnime(page = 1, genre?: string) {
  const data = await anilistRequest(
    ANILIST_QUERY,
    {
      page,
      perPage: 24,
      type: "ANIME",
      genre: genre || undefined,
      sort: ["POPULARITY_DESC"],
    }
  );

  return data.Page.media.map(
    normalizeMedia
  ) as Media[];
}

export async function getAnimeCatalog(page = 1, genre?: string) {
  const data = await anilistRequest(
    ANILIST_QUERY,
    {
      page,
      perPage: 24,
      type: "ANIME",
      genre: genre || undefined,
      sort: ["POPULARITY_DESC"],
    }
  );

  return data.Page.media.map(normalizeMedia) as Media[];
}

export async function getLatestAnime() {
  const data = await anilistRequest(
    ANILIST_QUERY,
    {
      page: 1,
      perPage: 20,
      type: "ANIME",
      sort: ["START_DATE_DESC"],
    }
  );

  return data.Page.media.map(
    normalizeMedia
  ) as Media[];
}

export async function searchAnime(
  search: string
) {
  if (!search.trim()) {
    return [];
  }

  const data = await anilistRequest(
    ANILIST_QUERY,
    {
      page: 1,
      perPage: 30,
      search,
      type: "ANIME",
      sort: ["SEARCH_MATCH"],
    }
  );

  return data.Page.media.map(
    normalizeMedia
  ) as Media[];
}

/* =========================
   MANGA
========================= */

export async function getPopularManga() {
  const data = await anilistRequest(
    ANILIST_QUERY,
    {
      page: 1,
      perPage: 24,
      type: "MANGA",
      sort: ["POPULARITY_DESC"],
    }
  );

  return data.Page.media.map(
    normalizeMedia
  ) as Media[];
}

export async function searchManga(
  search: string
) {
  if (!search.trim()) {
    return [];
  }

  const data = await anilistRequest(
    ANILIST_QUERY,
    {
      page: 1,
      perPage: 30,
      search,
      type: "MANGA",
      sort: ["SEARCH_MATCH"],
    }
  );

  return data.Page.media.map(
    normalizeMedia
  ) as Media[];
}

async function mangaRequest<T>(action: string, params: Record<string, string>) {
  const query = new URLSearchParams({ action, ...params });
  const response = await fetch(`/api/manga?${query.toString()}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Manga source request failed.");
  return payload as T;
}

export interface MangaSourceResult {
  id?: string;
  href?: string;
  title: string;
  image?: string;
  description?: string;
}

export async function searchMangaSource(query: string) {
  return mangaRequest<MangaSourceResult[]>("search", { q: query });
}

export async function getMangaChapters(seriesId: string) {
  return mangaRequest<MangaChapter[]>("chapters", { id: seriesId });
}

export async function getMangaPages(chapterId: string) {
  return mangaRequest<string[]>("pages", { id: chapterId });
}

/* =========================
   DETAILS
========================= */

export async function getMediaDetails(
  id: number,
  type: MediaType = "ANIME"
) {
  const data = await anilistRequest(
    DETAIL_QUERY,
    {
      id,
      type,
    }
  );

  if (!data.Media) {
    return null;
  }

  const media = normalizeMedia(data.Media) as Media;
  media.seasons = (data.Media.relations?.edges || [])
    .filter((edge: any) =>
      ["PREQUEL", "SEQUEL"].includes(edge.relationType) &&
      edge.node?.type === "ANIME"
    )
    .map((edge: any) => normalizeMedia(edge.node) as Media)
    .sort((left: Media, right: Media) => (left.year ?? 0) - (right.year ?? 0));

  return media;
}

/* =========================
   SYNTHEITQ
========================= */

export async function getSynthetiqRepository(): Promise<SynthetiqRepository> {
  const response = await fetch(
    SYNTHEITQ_REPOSITORY,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Synthetiq repository error: ${response.status}`
    );
  }

  return response.json();
}

export async function getVideoModules(): Promise<SourceModule[]> {
  const repository =
    await getSynthetiqRepository();

  return repository.modules.filter(
    (module) =>
      module.contentType === "video"
  );
}

export async function resolveStream(
  sourceId: string | null,
  title: string,
  episode: number,
  language: "sub" | "dub" = "sub"
): Promise<Stream[]> {
  if (!sourceId) {
    throw new Error("Choose a playback source in Settings first.");
  }

  const response = await fetch("/api/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceId,
      title,
      episode,
      language,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "The selected source could not resolve this episode.");
  }

  return payload.streams as Stream[];
}

/* =========================
   PROVIDER INTERFACE
========================= */

export interface FStudiosProvider {
  search(
    query: string
  ): Promise<Media[]>;

  details(
    id: number
  ): Promise<Media | null>;

  episodes(
    id: number
  ): Promise<Episode[]>;

  stream(
    episodeId: string
  ): Promise<Stream[]>;
}

/*
  Metadata provider.

  This is intentionally separate from
  video playback because the Synthetiq
  repository contains signed modules for
  its own runtime rather than a browser
  REST API.
*/

export const metadataProvider:
  FStudiosProvider = {
    search: searchAnime,

    details: (
      id
    ) =>
      getMediaDetails(
        id,
        "ANIME"
      ),

    episodes: async (
      id
    ) => {
      const anime =
        await getMediaDetails(
          id,
          "ANIME"
        );

      if (!anime?.episodes) {
        return [];
      }

      return Array.from(
        {
          length:
            anime.episodes,
        },
        (_, index) => ({
          id: `${id}-${index + 1}`,

          number:
            index + 1,

          title:
            `Episode ${index + 1}`,
        })
      );
    },

    stream: async () => {
      throw new Error(
        "No browser playback provider is connected yet."
      );
    },
  };