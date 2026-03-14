import type {
  CategorySearchInsight,
  ProductSearchInsight,
  ComparisonOpportunity,
  BuyerQuestion,
  ComplaintSearchSignal,
} from "@/types";

type RawItem = Record<string, unknown>;

export function mapToCategoryInsights(items: RawItem[]): CategorySearchInsight[] {
  return items.map((item) => ({
    keyword: (item.keyword as string) || "",
    searchVolume: (item.search_volume as number) || 0,
    competition: (item.competition as number) || 0,
    cpc: (item.cpc as number) || 0,
    trend: ((item.monthly_searches as Array<{ search_volume: number }>) || []).map(
      (m) => m.search_volume
    ),
    relatedKeywords: [],
  }));
}

export function mapToProductInsights(
  items: RawItem[],
  productName: string
): ProductSearchInsight[] {
  return items
    .filter((item) =>
      ((item.keyword as string) || "").toLowerCase().includes(productName.toLowerCase())
    )
    .map((item) => ({
      productName,
      brand: productName.split(" ")[0] || "",
      searchVolume: (item.search_volume as number) || 0,
      relatedSearches: [],
    }));
}

export function mapToComparisonOpportunities(
  items: RawItem[],
  productA: string,
  productB: string
): ComparisonOpportunity[] {
  return items
    .filter((item) => ((item.keyword as string) || "").toLowerCase().includes("vs"))
    .map((item) => ({
      keyword: (item.keyword as string) || "",
      productA,
      productB,
      searchVolume: (item.search_volume as number) || 0,
    }));
}

export function mapToBuyerQuestions(items: RawItem[], category: string): BuyerQuestion[] {
  return items.map((item) => {
    const keyword = ((item.keyword as string) || "").toLowerCase();
    let intent: BuyerQuestion["intent"] = "informational";
    if (keyword.includes("buy") || keyword.includes("price")) intent = "transactional";
    else if (keyword.includes("best") || keyword.includes("worth") || keyword.includes("vs"))
      intent = "commercial";

    return {
      question: (item.keyword as string) || "",
      searchVolume: (item.search_volume as number) || 0,
      category,
      intent,
    };
  });
}

export function mapToComplaintSignals(
  items: RawItem[],
  productName: string
): ComplaintSearchSignal[] {
  return items.map((item) => {
    const keyword = (item.keyword as string) || "";
    let issueType = "general";
    if (keyword.includes("battery")) issueType = "battery";
    else if (keyword.includes("noise") || keyword.includes("loud")) issueType = "noise";
    else if (keyword.includes("leak")) issueType = "leaking";
    else if (keyword.includes("break") || keyword.includes("broken")) issueType = "durability";

    return {
      keyword,
      productName,
      searchVolume: (item.search_volume as number) || 0,
      issueType,
    };
  });
}
