import { getStore } from "@netlify/blobs";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";

const json = (body: unknown, status = 200) => Response.json(body, { status });

function publicProduct(product: typeof products.$inferSelect) {
  return { ...product, img: product.imageUrl, image_url: product.imageUrl, delivery_time: product.deliveryTime, is_available: product.isAvailable };
}

export default async (request: Request) => {
  try {
    if (request.method === "GET") {
      const rows = await db.select().from(products).where(eq(products.isAvailable, true)).orderBy(desc(products.createdAt));
      console.log(`[DailyKart DB] connected; loaded ${rows.length} available products`);
      return json(rows.map(publicProduct));
    }

    if (request.method === "POST" || request.method === "PUT") {
      const body = await request.json();
      if (!body.name?.trim() || !Number.isFinite(Number(body.price))) return json({ error: "Name and a valid price are required." }, 400);
      let imageUrl = body.image_url || body.img || "";
      if (body.image_data) {
        const match = /^data:([^;]+);base64,(.+)$/.exec(body.image_data);
        if (!match) return json({ error: "Invalid image upload." }, 400);
        const key = `${crypto.randomUUID()}.${match[1].split("/")[1] || "jpg"}`;
        const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
        await getStore("product-images").set(key, bytes.buffer);
        imageUrl = `/api/product-image?key=${encodeURIComponent(key)}&type=${encodeURIComponent(match[1])}`;
      }
      if (!imageUrl) imageUrl = `https://dummyimage.com/640x480/F5F1EB/2E2E2E&text=${encodeURIComponent(body.name)}`;
      const values = {
        name: body.name.trim(), price: Number(body.price), mrp: Number(body.mrp || body.price),
        description: body.description || "", category: body.category || "Fast Food", imageUrl,
        isAvailable: body.is_available !== false, tag: body.tag || "normal",
        deliveryTime: body.delivery_time || "15 mins", size: body.size || "normal",
      };
      if (request.method === "PUT") {
        const id = Number(new URL(request.url).searchParams.get("id"));
        if (!id) return json({ error: "Product id is required." }, 400);
        const [updated] = await db.update(products).set(values).where(eq(products.id, id)).returning();
        return updated ? json(publicProduct(updated)) : json({ error: "Product not found." }, 404);
      }
      const [created] = await db.insert(products).values(values).returning();
      console.log(`[DailyKart DB] product created: ${created.id}`);
      return json(publicProduct(created), 201);
    }

    if (request.method === "DELETE") {
      const id = Number(new URL(request.url).searchParams.get("id"));
      if (!id) return json({ error: "Product id is required." }, 400);
      await db.delete(products).where(eq(products.id, id));
      return new Response(null, { status: 204 });
    }
    return json({ error: "Method not allowed." }, 405);
  } catch (error) {
    console.error("[DailyKart DB] connection or query failed", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "The product catalog is temporarily unavailable." }, 500);
  }
};
