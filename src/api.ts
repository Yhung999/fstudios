const API_URL = "https://graphql.anilist.co";

const LIST_QUERY = `
query (
  $page: Int,
  $perPage: Int,
  $search: String,
  $type: MediaType,
  $sort: [MediaSort]
) {
  Page(
    page: $page,
    perPage: $perPage
  ) {
    media(
      search: $search,
      type: $type,
      sort: $sort,
      isAdult: false
    ) {
      id

      title {
        romaji
        english
        native
      }

      coverImage {
        large
        extraLarge
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

const DETAILS_QUERY = `
query ($id: Int, $type: MediaType) {
  Media(
    id: $id,
    type: $type
  ) {
    id

    title {
      romaji
      english
      native
    }

    coverImage {
      large
      extraLarge
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
`;

export interface Media {
  id: string;
  title: string;

  image: string;
  banner: string;

  description: string;

  rating: number;

  year?: number;

  genres: string[];

  episodes?: number;
  chapters?: number;

  status?: string;

  type: "ANIME" | "MANGA";
}

function normalize(item: any): Media {
  return {
    id: String(item.id),

    title:
      item.title?.english ||
      item.title?.romaji ||
      item.title?.native ||
      "Untitled",

    image:
      item.coverImage?.extraLarge ||
      item.coverImage?.large ||
      "",

    banner:
      item.bannerImage ||
      item.coverImage?.extraLarge ||
      item.coverImage?.large ||
      "",

    description:
      item.description ||
      "No description available.",

    rating:
      typeof item.averageScore === "number"
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

async function request(
  query: string,
  variables: Record<string, unknown>
) {
  const response = await fetch(API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `AniList request failed: ${response.status}`
    );
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(
      json.errors[0]?.message ||
        "AniList request failed"
    );
  }

  return json.data;
}

export async function trending(): Promise<Media[]> {
  const data = await request(
    LIST_QUERY,
    {
      page: 1,
      perPage: 20,
      type: "ANIME",
      sort: ["TRENDING_DESC"],
    }
  );

  return data.Page.media.map(normalize);
}

export async function popular(): Promise<Media[]> {
  const data = await request(
    LIST_QUERY,
    {
      page: 1,
      perPage: 20,
      type: "ANIME",
      sort: ["POPULARITY_DESC"],
    }
  );

  return data.Page.media.map(normalize);
}

export async function search(
  searchTerm: string
): Promise<Media[]> {
  if (!searchTerm.trim()) {
    return [];
  }

  const data = await request(
    LIST_QUERY,
    {
      page: 1,
      perPage: 30,
      search: searchTerm,
      type: "ANIME",
      sort: ["SEARCH_MATCH"],
    }
  );

  return data.Page.media.map(normalize);
}

export async function manga(): Promise<Media[]> {
  const data = await request(
    LIST_QUERY,
    {
      page: 1,
      perPage: 24,
      type: "MANGA",
      sort: ["POPULARITY_DESC"],
    }
  );

  return data.Page.media.map(normalize);
}

export async function details(
  id: string,
  type: "ANIME" | "MANGA" = "ANIME"
): Promise<Media | null> {
  const data = await request(
    DETAILS_QUERY,
    {
      id: Number(id),
      type,
    }
  );

  if (!data.Media) {
    return null;
  }

  return normalize(data.Media);
}