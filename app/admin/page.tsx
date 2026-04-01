"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3, Package, MessageSquare, Users, Star, Shield,
  LogOut, Search, ChevronLeft, ChevronRight, Trash2, Check,
  X, Eye, Pin, TrendingUp, Mail, AlertTriangle, RefreshCw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface Summary {
  totalProducts: number;
  totalCategories: number;
  totalReviews: number;
  recentReviews: number;
  pendingReviews: number;
  totalUsers: number;
  recentUsers: number;
  totalThreads: number;
  totalComments: number;
  totalVotes: number;
  totalSubscriptions: number;
  pendingReports: number;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  smartScore: number;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  image: string;
  description: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  _count?: { reviews: number };
  createdAt: string;
  updatedAt: string;
}

interface ReviewItem {
  id: string;
  headline: string;
  rating: number;
  body: string;
  status: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: string;
  product: { id: string; name: string; slug: string };
  user: { id: string; name: string | null; email: string | null };
}

interface RatingDist {
  rating: number;
  count: number;
}

interface StatsData {
  summary: Summary;
  ratingDistribution: RatingDist[];
  topProducts: ProductItem[];
  recentReviews: ReviewItem[];
  recentSignups: Array<{
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
    trustLevel: string;
  }>;
}

type Tab = "overview" | "products" | "reviews" | "queue" | "analytics";

// ─── Helpers ─────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function RatingBar({ rating, count, max }: { rating: number; count: number; max: number }) {
  const colors: Record<number, string> = {
    5: "bg-emerald-500", 4: "bg-emerald-400", 3: "bg-yellow-400", 2: "bg-orange-400", 1: "bg-red-400",
  };
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-6 text-right text-gray-500 font-medium">{rating}★</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[rating]}`}
          style={{ width: max > 0 ? `${(count / max) * 100}%` : "0%" }}
        />
      </div>
      <span className="w-8 text-right text-gray-400 text-xs">{count}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    flagged: "bg-red-50 text-red-700 border-red-200",
    rejected: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

// ─── Login Gate ──────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      onLogin();
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">SmartReview Admin</h1>
            <p className="text-xs text-gray-400">Enter password to continue</p>
          </div>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full mt-4 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewFilter, setReviewFilter] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [pendingReviews, setPendingReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.ok) setAuthed(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (res.ok) setStats(await res.json());
  }, []);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(productPage),
      limit: "15",
      ...(productSearch ? { search: productSearch } : {}),
    });
    const res = await fetch(`/api/admin/products?${params}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setProductTotal(data.total);
    }
  }, [productPage, productSearch]);

  const loadReviews = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(reviewPage),
      limit: "15",
      ...(reviewFilter ? { status: reviewFilter } : {}),
      ...(reviewSearch ? { search: reviewSearch } : {}),
    });
    const res = await fetch(`/api/admin/reviews?${params}`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews);
      setReviewTotal(data.total);
    }
  }, [reviewPage, reviewFilter, reviewSearch]);

  const loadPendingReviews = useCallback(async () => {
    const res = await fetch("/api/admin/reviews?status=pending&limit=50");
    if (res.ok) {
      const data = await res.json();
      setPendingReviews(data.reviews);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (activeTab === "overview") loadStats();
    if (activeTab === "products") loadProducts();
    if (activeTab === "reviews") loadReviews();
    if (activeTab === "queue") loadPendingReviews();
    if (activeTab === "analytics") loadStats();
  }, [authed, activeTab, loadStats, loadProducts, loadReviews, loadPendingReviews]);

  const handleBulkAction = async (status: string) => {
    if (selectedReviews.size === 0) return;
    setLoading(true);
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedReviews), status }),
    });
    setSelectedReviews(new Set());
    loadReviews();
    setLoading(false);
  };

  const handleQueueAction = async (id: string, status: string) => {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id], status }),
    });
    loadPendingReviews();
    loadStats();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product and all its reviews?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    loadProducts();
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    loadReviews();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onLogin={() => { setAuthed(true); }} />;
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "products", label: "Products", icon: Package },
    { key: "reviews", label: "Reviews", icon: MessageSquare },
    { key: "queue", label: "Content Queue", icon: AlertTriangle, badge: stats?.summary.pendingReviews },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">SmartReview Admin</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && tab.badge > 0 ? (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ──── Overview Tab ──── */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard label="Products" value={stats.summary.totalProducts} icon={Package} color="bg-blue-50 text-blue-600" />
              <StatCard label="Reviews" value={stats.summary.totalReviews} icon={MessageSquare} color="bg-emerald-50 text-emerald-600" />
              <StatCard label="Users" value={stats.summary.totalUsers} icon={Users} color="bg-purple-50 text-purple-600" />
              <StatCard label="Pending Reviews" value={stats.summary.pendingReviews} icon={AlertTriangle} color="bg-yellow-50 text-yellow-600" />
              <StatCard label="Discussions" value={stats.summary.totalThreads} icon={MessageSquare} color="bg-indigo-50 text-indigo-600" />
              <StatCard label="Votes" value={stats.summary.totalVotes} icon={Star} color="bg-orange-50 text-orange-600" />
              <StatCard label="Subscribers" value={stats.summary.totalSubscriptions} icon={Mail} color="bg-cyan-50 text-cyan-600" />
              <StatCard label="Reports" value={stats.summary.pendingReports} icon={Shield} color="bg-red-50 text-red-600" />
            </div>

            {/* Rating Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                <div className="space-y-2">
                  {stats.ratingDistribution.map((r) => (
                    <RatingBar
                      key={r.rating}
                      rating={r.rating}
                      count={r.count}
                      max={Math.max(...stats.ratingDistribution.map((d) => d.count))}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Signups</h3>
                {stats.recentSignups.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentSignups.slice(0, 8).map((u) => (
                      <div key={u.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium text-gray-900">{u.name || "Anonymous"}</span>
                          <span className="text-gray-400 ml-2 text-xs">{u.email}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No recent signups</p>
                )}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Reviews</h3>
              {stats.recentReviews.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentReviews.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm text-gray-900 truncate">{r.headline}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        <p className="text-xs text-gray-400">
                          {r.product.name} · {r.user.name || r.user.email} · {"★".repeat(r.rating)} · {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No reviews yet</p>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Products by Reviews</h3>
              {stats.topProducts.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium hidden sm:table-cell">Category</th>
                      <th className="pb-2 font-medium text-right">Reviews</th>
                      <th className="pb-2 font-medium text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.slice(0, 10).map((p, i) => (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 text-gray-400">{i + 1}</td>
                        <td className="py-2 text-gray-900 font-medium">{p.name}</td>
                        <td className="py-2 text-gray-500 hidden sm:table-cell">{p.category.name}</td>
                        <td className="py-2 text-right text-emerald-600 font-medium">{p.reviewCount}</td>
                        <td className="py-2 text-right text-gray-600">{p.smartScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 text-sm">No products yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "overview" && !stats && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {/* ──── Products Tab ──── */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <span className="text-sm text-gray-400">{productTotal} products</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Brand</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Category</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Score</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Reviews</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Price</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">/{p.slug}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.brand}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{p.category.name}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${p.smartScore >= 80 ? "text-emerald-600" : p.smartScore >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                          {p.smartScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{p._count?.reviews ?? p.reviewCount}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ${p.priceMin}–${p.priceMax}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/category/${p.category.slug}/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                            title="View product"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">No products found</div>
              )}
            </div>

            {/* Pagination */}
            {productTotal > 15 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Page {productPage} of {Math.ceil(productTotal / 15)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    disabled={productPage === 1}
                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProductPage((p) => p + 1)}
                    disabled={productPage >= Math.ceil(productTotal / 15)}
                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──── Reviews Tab ──── */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => { setReviewSearch(e.target.value); setReviewPage(1); }}
                  placeholder="Search reviews..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <select
                value={reviewFilter}
                onChange={(e) => { setReviewFilter(e.target.value); setReviewPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none"
              >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
              </select>
              {selectedReviews.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{selectedReviews.size} selected</span>
                  <button
                    onClick={() => handleBulkAction("published")}
                    disabled={loading}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleBulkAction("rejected")}
                    disabled={loading}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
              <span className="text-sm text-gray-400 ml-auto">{reviewTotal} reviews</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <th className="px-4 py-3 w-8">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviews(new Set(reviews.map((r) => r.id)));
                          } else {
                            setSelectedReviews(new Set());
                          }
                        }}
                        checked={reviews.length > 0 && selectedReviews.size === reviews.length}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Review</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Product</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Author</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Rating</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedReviews.has(r.id)}
                          onChange={(e) => {
                            const next = new Set(selectedReviews);
                            if (e.target.checked) next.add(r.id);
                            else next.delete(r.id);
                            setSelectedReviews(next);
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{r.headline}</span>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.body}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{r.product.name}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{r.user.name || r.user.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                        <span className="text-gray-200">{"★".repeat(5 - r.rating)}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.status !== "published" && (
                            <button
                              onClick={() => handleQueueAction(r.id, "published")}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 rounded"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              onClick={() => handleQueueAction(r.id, "rejected")}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reviews.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">No reviews found</div>
              )}
            </div>

            {reviewTotal > 15 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Page {reviewPage} of {Math.ceil(reviewTotal / 15)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={reviewPage === 1}
                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setReviewPage((p) => p + 1)}
                    disabled={reviewPage >= Math.ceil(reviewTotal / 15)}
                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──── Content Queue Tab ──── */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Reviews ({pendingReviews.length})
              </h2>
              <button
                onClick={loadPendingReviews}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <Check className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">All caught up!</p>
                <p className="text-gray-400 text-sm mt-1">No pending reviews to moderate.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReviews.map((r) => (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{r.headline}</h3>
                          <span className="text-yellow-500 text-sm">{"★".repeat(r.rating)}</span>
                          {r.verifiedPurchase && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">{r.product.name}</span>
                          {" · "}
                          {r.user.name || r.user.email}
                          {" · "}
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-3">{r.body}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleQueueAction(r.id, "published")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleQueueAction(r.id, "flagged")}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-yellow-300 text-yellow-700 text-xs rounded-lg hover:bg-yellow-50"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Flag
                        </button>
                        <button
                          onClick={() => handleQueueAction(r.id, "rejected")}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-700 text-xs rounded-lg hover:bg-red-50"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──── Analytics Tab ──── */}
        {activeTab === "analytics" && stats && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900">Analytics Overview</h2>
              <p className="text-sm text-gray-600 mt-1">
                Key metrics and trends across SmartReview content.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Reviews This Week" value={stats.summary.recentReviews} icon={MessageSquare} color="bg-emerald-50 text-emerald-600" />
              <StatCard label="New Users This Week" value={stats.summary.recentUsers} icon={Users} color="bg-purple-50 text-purple-600" />
              <StatCard label="Categories" value={stats.summary.totalCategories} icon={Package} color="bg-blue-50 text-blue-600" />
              <StatCard label="Total Comments" value={stats.summary.totalComments} icon={MessageSquare} color="bg-indigo-50 text-indigo-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Content Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Review to Product Ratio</span>
                    <span className="font-bold text-gray-900">
                      {stats.summary.totalProducts > 0
                        ? (stats.summary.totalReviews / stats.summary.totalProducts).toFixed(1)
                        : "0"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Avg. Rating</span>
                    <span className="font-bold text-gray-900">
                      {stats.summary.totalReviews > 0
                        ? (
                            stats.ratingDistribution.reduce((s, r) => s + r.rating * r.count, 0) /
                            stats.summary.totalReviews
                          ).toFixed(1)
                        : "N/A"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Votes per Review</span>
                    <span className="font-bold text-gray-900">
                      {stats.summary.totalReviews > 0
                        ? (stats.summary.totalVotes / stats.summary.totalReviews).toFixed(1)
                        : "0"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Moderation Queue</span>
                    <span className={`font-bold ${stats.summary.pendingReviews > 5 ? "text-red-600" : "text-emerald-600"}`}>
                      {stats.summary.pendingReviews} pending
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <a
                    href="/admin/analytics"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">GA4 Analytics</p>
                      <p className="text-xs text-gray-400">View detailed funnel and event analytics</p>
                    </div>
                  </a>
                  <button
                    onClick={() => setActiveTab("queue")}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <AlertTriangle className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Moderate Reviews</p>
                      <p className="text-xs text-gray-400">{stats.summary.pendingReviews} reviews pending</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("products")}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <Pin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Manage Products</p>
                      <p className="text-xs text-gray-400">Feature or unfeature products on homepage</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && !stats && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
