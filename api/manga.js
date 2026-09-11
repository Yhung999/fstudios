import { mangaChapters, mangaPages, mangaSearch } from "../server/synthetiqResolver.js";

export default async function handler(request, response) {
  try {
    const { action, q = "", id = "" } = request.query || {};
    let payload;

    if (action === "search") payload = await mangaSearch(q);
    else if (action === "chapters") payload = await mangaChapters(id);
    else if (action === "pages") payload = await mangaPages(id);
    else {
      response.status(400).json({ error: "Unknown manga action" });
      return;
    }

    response.status(200).json(payload);
  } catch (error) {
    response.status(502).json({ error: error instanceof Error ? error.message : "Manga request failed" });
  }
}