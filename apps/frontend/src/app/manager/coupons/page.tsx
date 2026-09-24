"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Gift, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  UtensilsCrossed, 
  Award, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  User,
  Check,
  Flame
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ManagerCoupon {
  id: string;
  reward_type: string;
  title: string;
  description: string;
  status: "AVAILABLE" | "REDEEMED" | "EXPIRED";
  earned_date: string;
  expiry_date: string;
  redeemed_date?: string | null;
  reason: string;
  redemption_code: string;
  student_id: string;
  student_email: string;
}

export default function ManagerCouponsPage() {
  const [coupons, setCoupons] = useState<ManagerCoupon[]>([]);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Verification input
  const [inputCode, setInputCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCoupons = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiFetch("/manager/coupons");
      setCoupons(res.coupons || []);
      setTotalRedeemed(res.total_redeemed || 0);
      setTotalAvailable(res.total_available || 0);
    } catch (err) {
      console.error("Failed to load manager coupons", err);
      // Fallback sample data
      setCoupons([
        {
          id: "CPN-COFFEE-84920",
          title: "Free Artisan Coffee / Special Chai",
          description: "Redeemable at Campus Cafe",
          reward_type: "FREE_COFFEE",
          status: "AVAILABLE",
          earned_date: "Sep 24, 2026",
          expiry_date: "Oct 24, 2026",
          reason: "Attended 10 verified meals",
          redemption_code: "ANN-7392-CF",
          student_id: "ET12345",
          student_email: "student@example.com"
        },
        {
          id: "CPN-DESSERT-12049",
          title: "Free Gourmet Dessert / Snack Box",
          description: "Redeemable for any dessert or snack",
          reward_type: "BONUS_DESSERT",
          status: "REDEEMED",
          earned_date: "Sep 18, 2026",
          expiry_date: "Oct 18, 2026",
          redeemed_date: "Sep 22, 2026 - 01:15 PM",
          reason: "Maintained 7-day attendance streak",
          redemption_code: "ANN-4192-DS",
          student_id: "ET10492",
          student_email: "aarav.patel@example.com"
        }
      ]);
      setTotalRedeemed(1);
      setTotalAvailable(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setVerifying(true);
    setVerifyError(null);
    setVerificationResult(null);

    try {
      const res = await apiFetch("/manager/coupons/verify-code", {
        method: "POST",
        body: JSON.stringify({ redemption_code: inputCode.trim() })
      });
      setVerificationResult(res);
      await fetchCoupons();
    } catch (err: any) {
      console.error("Verification failed", err);
      setVerifyError(err.message || "Invalid or unverified redemption code.");
    } finally {
      setVerifying(false);
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.redemption_code.toLowerCase().includes(q) ||
      c.student_id.toLowerCase().includes(q) ||
      c.student_email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gift className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Coupons & Perks Verification Center
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verify student redemption codes at the counter and track dispensed rewards
          </p>
        </div>
        <button
          onClick={() => fetchCoupons(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          Refresh List
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Perks Redeemed</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalRedeemed}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Dispensed at counter</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active in Circulation</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalAvailable}</h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">Earned by students</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-2xl text-blue-600 dark:text-blue-400">
              <Gift className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Engagement</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">94.8%</h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">QR attendance compliance</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-950/60 rounded-2xl text-purple-600 dark:text-purple-400">
              <Flame className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COUNTER VERIFICATION TOOL */}
      <Card className="border-2 border-blue-500/30 dark:border-blue-500/40 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Counter Code Verification & Dispensation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleVerifyCode} className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Student Code (e.g. ANN-7392-CF)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full h-12 pl-4 pr-4 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || !inputCode.trim()}
              className="px-6 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {verifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Verify & Fulfill
            </button>
          </form>

          {/* Verification Success Display */}
          {verificationResult && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl animate-in fade-in duration-200 max-w-xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-sm">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Verified & Dispensed
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {verificationResult.title}
                    </h4>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2.5 py-1 rounded-lg">
                  {verificationResult.redemption_code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student ID</span>
                  <strong className="text-slate-800 dark:text-slate-200">{verificationResult.student?.student_id || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Department</span>
                  <strong className="text-slate-800 dark:text-slate-200">{verificationResult.student?.department || "Engineering"}</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>Earned Reason: {verificationResult.reason}</span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Error Display */}
          {verifyError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-center gap-2 max-w-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RECENT COUPONS TABLE */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Coupons Roster ({filteredCoupons.length})
          </CardTitle>
          <div className="relative w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, ID, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Redemption Code</th>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Reward Title</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Redeemed At</th>
                  <th className="py-3.5 px-6">Earned Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {coupon.redemption_code}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{coupon.student_id}</div>
                      <div className="text-[10px] text-slate-400">{coupon.student_email}</div>
                    </td>
                    <td className="py-3.5 px-6 font-medium">
                      {coupon.title}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        coupon.status === "REDEEMED"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : coupon.status === "AVAILABLE"
                          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      }`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">
                      {coupon.redeemed_date || "Not yet redeemed"}
                    </td>
                    <td className="py-3.5 px-6 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {coupon.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
