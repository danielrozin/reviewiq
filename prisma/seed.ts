import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Import static data - these need to be copied as plain objects
// since seed runs with ts-node, not Next.js path aliases
import { categories } from "../data/categories";
import { products } from "../data/products";
import { users } from "../data/users";
import { discussions, comments as discussionComments } from "../data/discussions";

async function main() {
  console.log("Seeding database...");

  // 1. Seed users
  console.log("Creating users...");
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        name: u.displayName,
        username: u.username,
        bio: u.bio,
        trustLevel: u.trustLevel,
        reputationScore: u.reputationScore,
        badges: u.badges,
        expertiseCategories: u.expertiseCategories,
        createdAt: new Date(u.joinedAt),
      },
    });
  }
  console.log(`  Created ${users.length} users`);

  // 2. Seed categories
  console.log("Creating categories...");
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        image: c.image,
      },
    });
  }
  console.log(`  Created ${categories.length} categories`);

  // 3. Seed products with all nested data
  console.log("Creating products...");
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        categoryId: p.categoryId,
        description: p.description,
        image: p.image,
        priceMin: p.priceRange.min,
        priceMax: p.priceRange.max,
        priceCurrency: p.priceRange.currency,
        smartScore: p.smartScore,
        verifiedPurchaseRate: p.verifiedPurchaseRate,
        reviewCount: p.reviewCount,
        ratingDist5: p.ratingDistribution[5],
        ratingDist4: p.ratingDistribution[4],
        ratingDist3: p.ratingDistribution[3],
        ratingDist2: p.ratingDistribution[2],
        ratingDist1: p.ratingDistribution[1],
      },
    });

    // AI Summary
    if (p.aiSummary) {
      await prisma.aISummary.upsert({
        where: { productId: p.id },
        update: {},
        create: {
          productId: p.id,
          whatPeopleLove: p.aiSummary.whatPeopleLove,
          whatPeopleHate: p.aiSummary.whatPeopleHate,
          bestFor: p.aiSummary.bestFor,
          notFor: p.aiSummary.notFor,
          topComplaints: p.aiSummary.topComplaints,
          keyFacts: p.aiSummary.keyFacts,
        },
      });
    }

    // Specs
    for (const spec of p.specs) {
      await prisma.productSpec.create({
        data: {
          productId: p.id,
          label: spec.label,
          value: spec.value,
          group: spec.group,
        },
      });
    }

    // Recurring issues
    for (const issue of p.recurringIssues) {
      await prisma.recurringIssue.create({
        data: {
          productId: p.id,
          title: issue.title,
          mentionCount: issue.mentionCount,
          severity: issue.severity,
          description: issue.description,
        },
      });
    }

    // FAQs
    for (const faq of p.faq) {
      await prisma.fAQ.create({
        data: {
          productId: p.id,
          question: faq.question,
          answer: faq.answer,
        },
      });
    }

    // YouTube videos
    if (p.youtubeVideos) {
      for (const vid of p.youtubeVideos) {
        await prisma.youTubeVideo.create({
          data: {
            productId: p.id,
            videoId: vid.id,
            title: vid.title,
          },
        });
      }
    }

    // Reviews
    for (const r of p.reviews) {
      // Assign reviews to random seed users
      const randomUser = users[Math.floor(Math.random() * users.length)];
      await prisma.review.create({
        data: {
          id: r.id,
          productId: p.id,
          userId: randomUser.id,
          headline: r.headline,
          rating: r.rating,
          verifiedPurchase: r.verifiedPurchase,
          verificationTier: r.verificationTier,
          timeOwned: r.timeOwned,
          experienceLevel: r.experienceLevel,
          pros: r.pros,
          cons: r.cons,
          reliabilityRating: r.reliabilityRating,
          easeOfUseRating: r.easeOfUseRating,
          valueRating: r.valueRating,
          body: r.body,
          aiTopics: r.aiTopics,
          helpfulCount: r.helpfulCount,
          createdAt: new Date(r.createdAt),
        },
      });
    }
  }
  console.log(`  Created ${products.length} products with specs, reviews, FAQs`);

  // 4. Seed discussion threads
  console.log("Creating discussions...");
  for (const d of discussions) {
    await prisma.discussionThread.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        title: d.title,
        body: d.body,
        threadType: d.threadType,
        authorId: d.authorId,
        productId: d.productId ? products.find((p) => p.slug === d.productSlug)?.id : undefined,
        categoryId: d.categoryId,
        upvotes: d.upvotes,
        downvotes: d.downvotes,
        commentCount: d.commentCount,
        viewCount: d.viewCount,
        isPinned: d.isPinned,
        isResolved: d.isResolved,
        tags: d.tags,
        createdAt: new Date(d.createdAt),
      },
    });
  }
  console.log(`  Created ${discussions.length} discussion threads`);

  // 5. Seed comments if exported
  if (typeof discussionComments !== "undefined" && discussionComments) {
    console.log("Creating comments...");
    let commentCount = 0;
    for (const c of discussionComments) {
      await prisma.comment.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          threadId: c.threadId,
          parentId: c.parentId,
          authorId: c.authorId,
          body: c.body,
          upvotes: c.upvotes,
          downvotes: c.downvotes,
          isTopAnswer: c.isTopAnswer,
          isOwnerVerified: c.isOwnerVerified,
          helpfulCount: c.helpfulCount,
          createdAt: new Date(c.createdAt),
        },
      });
      commentCount++;
    }
    console.log(`  Created ${commentCount} comments`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
