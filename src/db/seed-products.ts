import { getDb } from "./index";
import { products, categories } from "./schema";
import { eq } from "drizzle-orm";

const staticProducts = [
  { name: "Handwoven Raffia Sandals", category: "Footwear", tag: "Artisan Craft", price: "KES 4,500", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461009/i62zn4pgkgfa2yljogxw.png" },
  { name: "Abstract Landscape — Oil on Canvas", category: "Fine Art", tag: "Original", price: "KES 85,000", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461023/pfu7phtdjksuqy15nmow.png" },
  { name: "Brushstroke Collection Tee", category: "Apparel", tag: "Limited Edition", price: "KES 2,800", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461033/zrlmgg0ffm3fvvugvwez.png" },
  { name: "Botanical Art Postcard Set", category: "Stationery", tag: "Best Seller", price: "KES 1,200", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461040/nixvd2jjypmr5ve7mdev.png" },
  { name: "Professional Oak Art Easel", category: "Supplies", tag: "Studio Essential", price: "KES 18,500", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461046/a60u2bbxqqutpjif136w.png" },
  { name: "Artisan Honey Bee Hive", category: "Naturalia", tag: "Spotlight", price: "KES 12,000", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461057/ywt3wsbhm2iq8zpnptv1.png" },
  { name: "Artist Brush Collection", category: "Supplies", tag: "Professional", price: "KES 6,500", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461074/h6jjfzreuhgmurrxrfiq.png" },
  { name: "Geometric Ceramic Vase", category: "Decor", tag: "Handmade", price: "KES 9,800", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461155/y8nkid2iv67qihxzbsm9.png" },
  { name: "Leather-Bound Sketchbook", category: "Stationery", tag: "Essential", price: "KES 3,200", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461165/ah2olg2tipnhmaoq156v.png" },
  { name: "Woven Textile Art Panel", category: "Fine Art", tag: "Heritage", price: "KES 42,000", img: "https://res.cloudinary.com/dsjptulx6/image/upload/v1781461178/siwmencqpor9f4y8jnmb.png" },
];

const catNames = ["Footwear", "Fine Art", "Apparel", "Stationery", "Supplies", "Decor", "Naturalia"];

async function seedProducts() {
  const db = getDb();

  for (const cat of catNames) {
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, cat));
    if (!existing) {
      await db.insert(categories).values({ name: cat });
      console.log(`Created category: ${cat}`);
    }
  }

  for (const p of staticProducts) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.name, p.name));
    if (existing) {
      console.log(`Skipping (exists): ${p.name}`);
      continue;
    }
    await db.insert(products).values({
      name: p.name,
      category: p.category,
      tag: p.tag,
      price: p.price,
      images: [p.img],
      inStock: true,
    });
    console.log(`Seeded: ${p.name}`);
  }

  console.log("\nDone seeding products and categories.");
  process.exit(0);
}

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});
