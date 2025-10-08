"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Verify it's the admin email
    if (email.toLowerCase() !== "adetolaodunubi@gmail.com") {
      setMessage("❌ Access denied. This dashboard is restricted to admin only.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard/subscriptions`,
        },
      });

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
      } else {
        setMessage("✅ Check your email for a magic link to sign in!");
      }
    } catch (error) {
      setMessage("❌ An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F6F1] to-white">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-lg border border-[#e5e5e5] p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#5B4636] mb-2">
              NeX AI Admin
            </h1>
            <p className="text-sm text-gray-600">
              Subscriptions Dashboard Access
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#5B4636] mb-2"
              >
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adetolaodunubi@gmail.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#5B4636] focus:ring-2 focus:ring-[#5B4636]/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5B4636] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#4A3C2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending magic link..." : "Sign in with Email"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 p-4 rounded-lg text-sm ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              <strong>Note:</strong> This dashboard is restricted to authorized
              admin access only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
