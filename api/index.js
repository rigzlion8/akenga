import server from "../dist/server/server.js";

export default async function handler(request) {
  const url = new URL(request.url, `https://${request.headers.get("host") || "localhost"}`);
  const req = new Request(url, request);
  return server.fetch(req, process.env, {});
}
