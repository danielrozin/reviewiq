import type { BlogPost } from "@/types";

const blogPosts: BlogPost[] = [];

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getRecentBlogPosts(count: number): BlogPost[] {
  return blogPosts.slice(0, count);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getBlogPostsByCategory(categorySlug: string): BlogPost[] {
  return blogPosts.filter((p) => p.categorySlug === categorySlug);
}
