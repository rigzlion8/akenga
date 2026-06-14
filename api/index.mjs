import server from "../dist/server/server.js";

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "localhost";
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const url = new URL(req.url, `${protocol}://${host}`);

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

    const webReq = new Request(url, {
      method: req.method,
      headers: req.headers,
      body,
    });

    const response = await server.fetch(webReq, process.env, {});

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (key !== "content-encoding" && key !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });

    const text = await response.text();
    res.end(text);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(error instanceof Error ? error.stack : String(error));
  }
}
