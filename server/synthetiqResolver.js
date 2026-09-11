// @ts-nocheck
import AdmZip from "adm-zip";
import vm from "node:vm";
import { Readable } from "node:stream";

const MODULE_URLS = {
  "anikoto-v4": "https://github.com/kas021/Synthetiq-Modules/releases/download/module-anikoto-v4-v5.0.0/Anikoto-5.0.0.zip",
  "animeheaven-v2-1": "https://github.com/kas021/Synthetiq-Modules/releases/download/module-animeheaven-v2-1-v4.1.0/AnimeHeaven-4.1.0.zip",
};

const MANGA_MODULE_URL = "https://github.com/kas021/Synthetiq-Modules/releases/download/module-weebcentral-v2-v4.1.10/WeebCentral-4.1.10.zip";

const moduleCache = new Map();
let mangaRuntime;

const DEFAULT_STREAM_REFERER = "https://megaplay.buzz/";

function proxyUrl(url, referer = DEFAULT_STREAM_REFERER) {
  return `/api/media?url=${encodeURIComponent(url)}&referer=${encodeURIComponent(referer)}`;
}

async function isPlayableStream(url, referer = DEFAULT_STREAM_REFERER) {
  if (!/\.m3u8(?:\?|$)/i.test(url)) return true;

  const response = await fetch(url, {
    headers: {
      Referer: referer,
      Origin: new URL(referer).origin,
      "User-Agent": "Mozilla/5.0",
      Accept: "*/*",
    },
  });

  // A provider may reject a probe without the exact playback session headers;
  // keep the route so the media proxy can make the real request and try backups.
  if (!response.ok) return true;
  const playlist = await response.text();
  const mediaLines = playlist
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  return !mediaLines.some((line) => /\.(png|jpe?g|gif|webp)(?:\?|$)/i.test(line));
}

export async function proxyMedia(request, response) {
  const query = new URL(request.url, "http://localhost").searchParams;
  const target = query.get("url");
  const referer = query.get("referer") || DEFAULT_STREAM_REFERER;

  if (!target || !/^https?:\/\//i.test(target)) {
    response.statusCode = 400;
    response.end("Invalid media URL");
    return;
  }

  const upstream = await fetch(target, {
    headers: {
      Referer: referer,
      Origin: new URL(referer).origin,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36",
      Accept: "*/*",
      ...(request.headers.range ? { Range: request.headers.range } : {}),
    },
  });

  if (!upstream.ok) {
    response.statusCode = upstream.status;
    response.end(`Provider media error: ${upstream.status}`);
    return;
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  response.statusCode = 200;
  if (upstream.status === 206) response.statusCode = 206;
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", contentType);
  for (const header of ["content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(header);
    if (value) response.setHeader(header, value);
  }

  if (contentType.includes("mpegurl") || /\.m3u8(?:\?|$)/i.test(target)) {
    const playlist = await upstream.text();
    const base = new URL(target);
    const rewritten = playlist
      .split("\n")
      .map((line) => {
        const value = line.trim();
        if (!value || value.startsWith("#")) {
          return value.replace(/URI="([^"]+)"/g, (_match, uri) => `URI="${proxyUrl(new URL(uri, base).href, referer)}"`);
        }
        return proxyUrl(new URL(value, base).href, referer);
      })
      .join("\n");
    response.end(rewritten);
    return;
  }

  if (!upstream.body) {
    response.end();
    return;
  }

  Readable.fromWeb(upstream.body).pipe(response);
}

async function loadModule(moduleId) {
  if (!MODULE_URLS[moduleId]) {
    throw new Error(`The selected source (${moduleId}) is not connected to the web resolver yet.`);
  }

  if (moduleCache.has(moduleId)) {
    return moduleCache.get(moduleId);
  }

  const response = await fetch(MODULE_URLS[moduleId]);
  if (!response.ok) {
    throw new Error(`Could not download ${moduleId}: ${response.status}`);
  }

  const archive = new AdmZip(Buffer.from(await response.arrayBuffer()));
  const entry = archive.getEntry("index.js");
  if (!entry) {
    throw new Error(`The ${moduleId} package does not contain index.js.`);
  }

  const context = {
    console,
    fetch,
    URL,
    URLSearchParams,
    Headers,
    Request,
    Response,
    setTimeout,
    clearTimeout,
    TextDecoder,
    TextEncoder,
  };
  context.globalThis = context;
  vm.runInNewContext(entry.getData().toString("utf8"), context, {
    filename: `${moduleId}/index.js`,
  });

  const runtime = {
    searchResults: context.searchResults,
    extractEpisodes: context.extractEpisodes,
    extractStreamUrl: context.extractStreamUrl,
  };

  if (Object.values(runtime).some((value) => typeof value !== "function")) {
    throw new Error(`The ${moduleId} package did not expose the playback contract.`);
  }

  moduleCache.set(moduleId, runtime);
  return runtime;
}

async function loadMangaModule() {
  if (mangaRuntime) return mangaRuntime;

  const response = await fetch(MANGA_MODULE_URL);
  if (!response.ok) throw new Error(`Could not download manga module: ${response.status}`);

  const archive = new AdmZip(Buffer.from(await response.arrayBuffer()));
  const entry = archive.getEntry("index.js");
  if (!entry) throw new Error("The manga package does not contain index.js.");

  const context = {
    console,
    fetch,
    URL,
    URLSearchParams,
    Headers,
    Request,
    Response,
    setTimeout,
    clearTimeout,
    TextDecoder,
    TextEncoder,
  };
  context.globalThis = context;
  vm.runInNewContext(entry.getData().toString("utf8"), context, { filename: "weebcentral/index.js" });

  mangaRuntime = {
    searchResults: context.searchResults,
    extractChapters: context.extractChapters,
    extractImages: context.extractImages,
  };

  if (Object.values(mangaRuntime).some((value) => typeof value !== "function")) {
    throw new Error("The manga package did not expose the reader contract.");
  }

  return mangaRuntime;
}

export async function mangaSearch(query) {
  const runtime = await loadMangaModule();
  return runtime.searchResults(query, 1);
}

export async function mangaChapters(seriesId) {
  const runtime = await loadMangaModule();
  return runtime.extractChapters(seriesId);
}

export async function mangaPages(chapterId) {
  const runtime = await loadMangaModule();
  return runtime.extractImages(chapterId);
}

function pickTitleResult(results, title) {
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return [...results].sort((left, right) => {
    const leftTitle = String(left.title || "").toLowerCase();
    const rightTitle = String(right.title || "").toLowerCase();
    return Number(rightTitle.includes(normalizedTitle)) - Number(leftTitle.includes(normalizedTitle));
  })[0];
}

async function resolveWithModule({ sourceId, title, episode, language = "sub" }) {
  const runtime = await loadModule(sourceId);
  const results = await runtime.searchResults(title, 0);
  const match = pickTitleResult(Array.isArray(results) ? results : [], title);

  if (!match?.href) {
    throw new Error(`No ${sourceId} result was found for ${title}.`);
  }

  const episodes = await runtime.extractEpisodes(match.href);
  const selectedEpisode = (Array.isArray(episodes) ? episodes : []).find(
    (item) => Number(item.number) === Number(episode)
  );

  if (!selectedEpisode?.href) {
    throw new Error(`Episode ${episode} is not available from ${sourceId}.`);
  }

  const resolved = await runtime.extractStreamUrl(selectedEpisode.href, language);
  const entries = [
    ...(Array.isArray(resolved?.streams) ? resolved.streams : []),
    resolved,
  ].filter((item) => item?.url);

  const seenUrls = new Set();
  const validEntries = [];
  for (const item of entries) {
    if (seenUrls.has(item.url)) continue;
    seenUrls.add(item.url);
    if (await isPlayableStream(item.url)) validEntries.push(item);
  }

  const streams = validEntries
    .map((item, index) => ({
      id: `${language}-${index}-${item.url}`,
      url: proxyUrl(item.url),
      type: String(item.url).includes(".m3u8") ? "hls" : "mp4",
      quality: item.quality && item.quality !== "Auto"
        ? item.quality
        : `Auto - ${index === 0 ? "Primary" : `Backup ${index}`}`,
      language: item.language || (language === "dub" ? "Dub" : "Sub"),
    }));

  if (!streams.length) {
    throw new Error(`No playable stream was returned for ${title} episode ${episode}.`);
  }

  return streams;
}

export async function resolveSynthetiqStream({ sourceId, title, episode, language = "sub" }) {
  const candidates = sourceId === "anikoto-v4"
    ? [sourceId, "animeheaven-v2-1"]
    : [sourceId];
  const failures = [];

  for (const candidate of candidates) {
    try {
      return await resolveWithModule({ sourceId: candidate, title, episode, language });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(failures.join(" "));
}

export function synthetiqResolverPlugin() {
  return {
    name: "synthetiq-resolver",
    configureServer(server) {
      server.middlewares.use("/api/stream", async (request, response) => {
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.end(JSON.stringify({ error: "POST required" }));
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of request) chunks.push(chunk);
          const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          const streams = await resolveSynthetiqStream(body);
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ streams }));
        } catch (error) {
          response.statusCode = 502;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Stream resolution failed" }));
        }
      });

      server.middlewares.use("/api/media", async (request, response) => {
        try {
          await proxyMedia(request, response);
        } catch (error) {
          response.statusCode = 502;
          response.end(error instanceof Error ? error.message : "Media proxy failed");
        }
      });

      server.middlewares.use("/api/manga", async (request, response) => {
        try {
          const query = new URL(request.url, "http://localhost").searchParams;
          const action = query.get("action");
          let payload;

          if (action === "search") payload = await mangaSearch(query.get("q") || "One Piece");
          else if (action === "chapters") payload = await mangaChapters(query.get("id") || "");
          else if (action === "pages") payload = await mangaPages(query.get("id") || "");
          else throw new Error("Unknown manga action");

          response.setHeader("Access-Control-Allow-Origin", "*");
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify(payload));
        } catch (error) {
          response.statusCode = 502;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Manga request failed" }));
        }
      });
    },
  };
}
