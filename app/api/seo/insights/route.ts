import { NextRequest, NextResponse } from "next/server";
import {
  fetchCategoryInsights,
  fetchProductKeywordIdeas,
  fetchComparisonKeywords,
  fetchBuyerQuestions,
  fetchComplaintSearchSignals,
} from "@/lib/dataforseo/endpoints";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const keyword = searchParams.get("keyword");
  const productA = searchParams.get("productA");
  const productB = searchParams.get("productB");

  if (!type || !keyword) {
    return NextResponse.json(
      { error: "type and keyword are required" },
      { status: 400 }
    );
  }

  try {
    switch (type) {
      case "category":
        return NextResponse.json(await fetchCategoryInsights(keyword));
      case "product":
        return NextResponse.json(await fetchProductKeywordIdeas(keyword));
      case "comparison":
        if (!productA || !productB) {
          return NextResponse.json(
            { error: "productA and productB required for comparison" },
            { status: 400 }
          );
        }
        return NextResponse.json(await fetchComparisonKeywords(productA, productB));
      case "buyer":
        return NextResponse.json(await fetchBuyerQuestions(keyword));
      case "complaints":
        return NextResponse.json(await fetchComplaintSearchSignals(keyword));
      default:
        return NextResponse.json(
          { error: "Invalid type. Use: category, product, comparison, buyer, complaints" },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "DataForSEO request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
