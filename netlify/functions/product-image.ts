import { getStore } from "@netlify/blobs";

export default async (request: Request) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) return new Response("Missing image key", { status: 400 });
  const data = await getStore("product-images").get(key, { type: "arrayBuffer" });
  if (!data) return new Response("Image not found", { status: 404 });
  return new Response(data as ArrayBuffer, {
    headers: { "Content-Type": url.searchParams.get("type") || "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
  });
};
