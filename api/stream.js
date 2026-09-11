import { resolveSynthetiqStream } from "../server/synthetiqResolver.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "POST required" });
    return;
  }

  try {
    const streams = await resolveSynthetiqStream(request.body || {});
    response.status(200).json({ streams });
  } catch (error) {
    response.status(502).json({ error: error instanceof Error ? error.message : "Stream resolution failed" });
  }
}