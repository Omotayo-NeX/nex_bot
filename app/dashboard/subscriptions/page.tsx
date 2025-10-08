"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_EMAIL = "adetolaodunubi@gmail.com";

type Subscription = {
  id: string;
  user_email: string | null;
  user_id: string | null;
  plan: string | null;
  amount: number;
  status: string | null;
  reference: string | null;
  transaction_id: string | null;
  paystack_customer_code: string | null;
  created_at: string;
  app_source: string;
};

export default function SubscriptionsDashboard() {
  const [data, setData] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          console.log("No authenticated user, redirecting to login");
          router.push("/admin/login");
          return;
        }

        const email = user.email?.toLowerCase();
        setUserEmail(user.email || "");

        // Only allow the admin email to access this dashboard
        if (email === ADMIN_EMAIL.toLowerCase()) {
          setAuthorized(true);
        } else {
          console.log(`Unauthorized email: ${email}`);
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/admin/login");
      } finally {
        setChecking(false);
      }
    };

    verifyUser();
  }, [router]);

  // Fetch data only when authorized
  useEffect(() => {
    if (authorized) {
      fetchData();
    }
  }, [authorized]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [nexaiRes, elevenRes] = await Promise.all([
        supabase
          .from("nexai_subscriptions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("elevenone_subscriptions")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      const merged: Subscription[] = [
        ...(nexaiRes.data || []).map((r) => ({ ...r, app_source: "NeX AI" })),
        ...(elevenRes.data || []).map((r) => ({ ...r, app_source: "ElevenOne" })),
      ];

      // Sort by created_at descending
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setData(merged);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filtered = data.filter((d) => {
    const matchesApp = filter === "all" || d.app_source.toLowerCase() === filter.toLowerCase();
    const matchesStatus = statusFilter === "all" || d.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      d.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.plan?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesApp && matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalRevenue = filtered.reduce((sum, item) => sum + (item.amount || 0), 0);
  const successfulPayments = filtered.filter(
    (item) => item.status?.toLowerCase() === "success"
  ).length;

  // Logout handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Loading state while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B4636] mx-auto mb-4"></div>
          <p className="text-[#5B4636] text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render anything (redirect happens in useEffect)
  if (!authorized) {
    return null;
  }

  return (
    <section className="min-h-screen bg-white text-[#5B4636] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Subscriptions Overview</h1>
            <p className="text-gray-600">
              Manage and monitor all subscription transactions across NeX Consulting apps
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">
              Logged in as: <span className="font-medium">{userEmail}</span>
            </p>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#F9F6F1] border border-[#e5e5e5] rounded-lg p-4">
            <h3 className="text-sm text-gray-600 mb-1">Total Transactions</h3>
            <p className="text-2xl font-semibold">{filtered.length}</p>
          </div>
          <div className="bg-[#F9F6F1] border border-[#e5e5e5] rounded-lg p-4">
            <h3 className="text-sm text-gray-600 mb-1">Successful Payments</h3>
            <p className="text-2xl font-semibold">{successfulPayments}</p>
          </div>
          <div className="bg-[#F9F6F1] border border-[#e5e5e5] rounded-lg p-4">
            <h3 className="text-sm text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-2xl font-semibold">₦{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#e5e5e5] rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* App Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">App Source</label>
              <div className="flex gap-2">
                {["all", "NeX AI", "ElevenOne"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      filter === f
                        ? "bg-[#5B4636] text-white border-[#5B4636]"
                        : "border-[#5B4636] text-[#5B4636] hover:bg-[#5B4636]/10"
                    }`}
                  >
                    {f === "all" ? "All Apps" : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#5B4636] text-[#5B4636] focus:outline-none focus:ring-2 focus:ring-[#5B4636]/20"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Email, reference, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#5B4636] focus:outline-none focus:ring-2 focus:ring-[#5B4636]/20"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B4636] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#e5e5e5] rounded-lg p-8 text-center">
            <p className="text-gray-600">No transactions found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-[#e5e5e5] rounded-lg shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F9F6F1] border-b border-[#e5e5e5]">
                <tr>
                  <th className="p-3 text-left font-semibold">App</th>
                  <th className="p-3 text-left font-semibold">User Email</th>
                  <th className="p-3 text-left font-semibold">Plan</th>
                  <th className="p-3 text-left font-semibold">Amount</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-left font-semibold">Reference</th>
                  <th className="p-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-[#e5e5e5] hover:bg-[#F9F6F1]/50 transition-colors"
                  >
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          row.app_source === "NeX AI"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {row.app_source}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">
                      {row.user_email || <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="p-3">
                      <span className="capitalize font-medium">{row.plan || "N/A"}</span>
                    </td>
                    <td className="p-3 font-semibold">₦{row.amount?.toLocaleString() || "0"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                          row.status?.toLowerCase() === "success"
                            ? "bg-green-100 text-green-800"
                            : row.status?.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.status || "Unknown"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{row.reference || "N/A"}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(row.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-6 py-2 bg-[#5B4636] text-white rounded-lg hover:bg-[#4a3829] disabled:opacity-50 transition-colors"
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>
    </section>
  );
}
