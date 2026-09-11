import { proxyMedia } from "../server/synthetiqResolver.js";

export default async function handler(request, response) {
  try {
    await proxyMedia(request, response);
  } catch (error) {
    response.statusCode = 502;
    response.end(error instanceof Error ? error.message : "Media proxy failed");
  }
}