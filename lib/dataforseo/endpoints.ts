import { dataForSeoRequest } from "./client";
import {
  mapToCategoryInsights,
  mapToProductInsights,
  mapToComparisonOpportunities,
  mapToBuyerQuestions,
  mapToComplaintSignals,
} from "./mappers";
import type {
  CategorySearchInsight,
  ProductSearchInsight,
  ComparisonOpportunity,
  BuyerQuestion,
  ComplaintSearchSignal,
} from "@/types";

interface DataForSEOResponse {
  tasks: Array<{
    result: Array<{
      items: Array<Record<string, unknown>>;
    }>;
  }>;
}

export async function fetchCategoryInsights(
  categoryKeyword: string,
  locationCode: number = 2840 // US
): Promise<CategorySearchInsight[]> {
  const data = await dataForSeoRequest<DataForSEOResponse>(
    "/keywords_data/google_ads/keywords_for_keywords/live",
    [
      {
        keywords: [`best ${categoryKeyword}`, `top ${categoryKeyword}`, `${categoryKeyword} review`],
        location_code: locationCode,
        language_code: "en",
      },
    ]
  );

  return mapToCategoryInsights(data.tasks[0]?.result[0]?.items || []);
}

export async function fetchProductKeywordIdeas(
  productName: string,
  locationCode: number = 2840
): Promise<ProductSearchInsight[]> {
  const data = await dataForSeoRequest<DataForSEOResponse>(
    "/keywords_data/google_ads/keywords_for_keywords/live",
    [
      {
        keywords: [`${productName} review`, `${productName} worth it`],
        location_code: locationCode,
        language_code: "en",
      },
    ]
  );

  return mapToProductInsights(data.tasks[0]?.result[0]?.items || [], productName);
}

export async function fetchComparisonKeywords(
  productA: string,
  productB: string,
  locationCode: number = 2840
): Promise<ComparisonOpportunity[]> {
  const data = await dataForSeoRequest<DataForSEOResponse>(
    "/keywords_data/google_ads/keywords_for_keywords/live",
    [
      {
        keywords: [`${productA} vs ${productB}`],
        location_code: locationCode,
        language_code: "en",
      },
    ]
  );

  return mapToComparisonOpportunities(data.tasks[0]?.result[0]?.items || [], productA, productB);
}

export async function fetchBuyerQuestions(
  keyword: string,
  locationCode: number = 2840
): Promise<BuyerQuestion[]> {
  const data = await dataForSeoRequest<DataForSEOResponse>(
    "/keywords_data/google_ads/keywords_for_keywords/live",
    [
      {
        keywords: [
          `is ${keyword} worth it`,
          `what to check before buying ${keyword}`,
          `${keyword} buying guide`,
        ],
        location_code: locationCode,
        language_code: "en",
      },
    ]
  );

  return mapToBuyerQuestions(data.tasks[0]?.result[0]?.items || [], keyword);
}

export async function fetchComplaintSearchSignals(
  productName: string,
  locationCode: number = 2840
): Promise<ComplaintSearchSignal[]> {
  const data = await dataForSeoRequest<DataForSEOResponse>(
    "/keywords_data/google_ads/keywords_for_keywords/live",
    [
      {
        keywords: [
          `${productName} problems`,
          `${productName} issues`,
          `${productName} complaints`,
        ],
        location_code: locationCode,
        language_code: "en",
      },
    ]
  );

  return mapToComplaintSignals(data.tasks[0]?.result[0]?.items || [], productName);
}
