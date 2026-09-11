import type { Anime, Manga } from "../types";

export const animeData: Anime[] = [
  {
    id: "1",
    title: "Solo Leveling",
    description:
      "In a world where hunters fight dangerous monsters, one weak hunter discovers a mysterious system that allows him to grow stronger.",
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    banner:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1800&q=85",
    rating: 9.1,
    year: 2024,
    genres: ["Action", "Fantasy", "Adventure"],
    episodes: 25,
    status: "Completed",
    type: "anime",
  },
  {
    id: "2",
    title: "Cyber Knights",
    description:
      "A group of young warriors enters a futuristic city controlled by an artificial intelligence.",
    image:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=600&q=80",
    banner:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85",
    rating: 8.7,
    year: 2025,
    genres: ["Sci-Fi", "Action"],
    episodes: 24,
    status: "Ongoing",
    type: "anime",
  },
  {
    id: "3",
    title: "Demon Hunter",
    description:
      "A young warrior begins a dangerous journey after a mysterious event changes his family forever.",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
    banner:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85",
    rating: 8.9,
    year: 2023,
    genres: ["Action", "Fantasy"],
    episodes: 48,
    status: "Completed",
    type: "anime",
  },
  {
    id: "4",
    title: "Moon Warriors",
    description:
      "A mysterious group of warriors protects humanity from creatures arriving through portals.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    banner:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=80",
    rating: 8.5,
    year: 2024,
    genres: ["Adventure", "Fantasy"],
    episodes: 36,
    status: "Ongoing",
    type: "anime",
  },
  {
    id: "5",
    title: "Neon Tokyo",
    description:
      "A hacker discovers a secret that could completely change the future of humanity.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=600&q=80",
    banner:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=80",
    rating: 9.0,
    year: 2025,
    genres: ["Sci-Fi", "Thriller"],
    episodes: 12,
    status: "Completed",
    type: "anime",
  },
  {
    id: "6",
    title: "Dragon Realm",
    description:
      "An ordinary teenager discovers that he is connected to an ancient dragon kingdom.",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    banner:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80",
    rating: 8.6,
    year: 2022,
    genres: ["Fantasy", "Adventure"],
    episodes: 72,
    status: "Completed",
    type: "anime",
  },
];

export const mangaData: Manga[] = [
  {
    id: "m1",
    title: "Shadow Realm",
    description: "A mysterious warrior discovers a hidden world.",
    image:
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    rating: 9.2,
    chapters: 182,
    genres: ["Action", "Fantasy"],
    type: "manga",
  },
  {
    id: "m2",
    title: "Starfall",
    description: "A group of explorers searches for a legendary planet.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    rating: 8.8,
    chapters: 96,
    genres: ["Adventure", "Sci-Fi"],
    type: "manga",
  },
  {
    id: "m3",
    title: "Dark Horizon",
    description: "Humanity faces its greatest threat.",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
    rating: 8.9,
    chapters: 140,
    genres: ["Action", "Thriller"],
    type: "manga",
  },
];