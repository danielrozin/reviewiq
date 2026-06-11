/**
 * Seed the lifted ReviewIQ Google Sites content into Postgres.
 *
 * DAN-942 (Phase 1b). Loads the structured records produced by the content lift
 * (data/reviewiq-lifted.ts) as Category + Product (+ YouTubeVideo) rows.
 *
 *   npm run db:seed:reviewiq      # (added to package.json)
 *   # or: tsx prisma/seed-reviewiq.ts
 *
 * Idempotent: all rows use stable `riq-` / `riq-cat-` ids and are upserted, so
 * re-running is safe and it does NOT touch the existing demo seed data.
 *
 * The lifted categories use the LEGACY Google Sites slugs (technology,
 * home-goods, …) so the Phase 1b 301 redirect map resolves on the preview
 * deploy: /reviews/{cat}/{slug} → /category/{cat}/{slug}.
 *
 * Author: Fullstack Developer (SmartReview), DAN-942.
 */

import { PrismaClient } from "@prisma/client";
import {
  liftedCategories,
  liftedProducts,
} from "../data/reviewiq-lifted";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding lifted ReviewIQ content...");

  console.log(`Categories: ${liftedCategories.length}`);
  for (const c of liftedCategories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
      },
    });
  }

  console.log(`Products: ${liftedProducts.length}`);
  for (const p of liftedProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        categoryId: p.categoryId,
        description: p.description,
        image: p.image,
      },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        categoryId: p.categoryId,
        description: p.description,
        image: p.image,
        priceMin: 0,
        priceMax: 0,
      },
    });

    if (p.video) {
      const videoId = `riq-vid-${p.slug}`;
      await prisma.youTubeVideo.upsert({
        where: { id: videoId },
        update: { videoId: p.video, title: p.name },
        create: {
          id: videoId,
          productId: p.id,
          videoId: p.video,
          title: p.name,
        },
      });
    }
  }

  const catCount = await prisma.category.count({ where: { id: { startsWith: "riq-cat-" } } });
  const prodCount = await prisma.product.count({ where: { id: { startsWith: "riq-" } } });
  console.log(`Done. Lifted rows in DB → categories: ${catCount}, products: ${prodCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
