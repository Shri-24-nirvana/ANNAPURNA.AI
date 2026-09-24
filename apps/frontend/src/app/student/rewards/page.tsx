"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Award, 
  Coffee, 
  UtensilsCrossed, 
  Gift, 
  Flame, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ChevronRight, 
  RefreshCw, 
  QrCode, 
  Info,
  ShieldCheck,
  Star,
  MessageSquare
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Coupon {
  id: string;
  title: string;
  description: string;
  reward_type: string;
  status: "AVAILABLE" | "REDEEMED" | "EXPIRED";
  earned_date: string;
  expiry_date: string;
  days_left: number;
  redeemed_date?: string | null;
  reason: string;
  redemption_code: string;
  rule_id: string;
}

interface ProgressItem {
  rule_id: string;
  rule_name: string;
  reward_title: string;
  reward_type: string;
  current: number;
  target: number;
  remaining?: number;
  percentage: number;
  unit: string;
  label: string;
  current_feedback?: number;
  target_feedback?: number;
}

interface RewardsSummary {
  stats: {
    verified_meals_count: number;
    genuine_feedbacks_count: number;
    current_streak_days: number;
    total_coupons_earned: number;
    available_count: number;
    redeemed_count: number;
    expired_count: number;
  };
  available_coupons: Coupon[];
  redeemed_coupons: Coupon[];
  expired_coupons: Coupon[];
  progress: ProgressItem[];
}

export default function RewardsPage() {
  const [data, setData] = useState<RewardsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"available" | "redeemed" | "expired">("available");

  // Redeem Confirmation & Verification Dialog State
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [redeemConfirmOpen, setRedeemConfirmOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccessCoupon, setRedeemSuccessCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRewards = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await apiFetch("/student/rewards");
      setData(res);
      setErrorMessage(null);
    } catch (err: any) {
      console.error("Failed to load rewards data", err);
      // Fallback sample data for offline preview
      if (!data) {
        setData({
          stats: {
            verified_meals_count: 14,
            genuine_feedbacks_count: 8,
            current_streak_days: 5,
            total_coupons_earned: 2,
            available_count: 1,
            redeemed_count: 1,
            expired_count: 0
          },
          available_coupons: [
            {
              id: "CPN-COFFEE-84920",
              title: "Free Artisan Coffee / Special Chai",
              description: "Redeemable at the Campus Cafe for any hot or iced handcrafted beverage.",
              reward_type: "FREE_COFFEE",
              status: "AVAILABLE",
              earned_date: "Sep 24, 2026",
              expiry_date: "Oct 24, 2026",
              days_left: 29,
              reason: "You attended 10 verified meals at the mess with zero unexcused waste!",
              redemption_code: "ANN-7392-CF",
              rule_id: "rule_10_meals"
            }
          ],
          redeemed_coupons: [
            {
              id: "CPN-DESSERT-12049",
              title: "Free Gourmet Dessert / Snack Box",
              description: "Redeemable for any artisanal dessert, fresh smoothie, or protein snack box.",
              reward_type: "BONUS_DESSERT",
              status: "REDEEMED",
              earned_date: "Sep 18, 2026",
              expiry_date: "Oct 18, 2026",
              days_left: 23,
              redeemed_date: "Sep 22, 2026 - 01:15 PM",
              reason: "You maintained a flawless 7-day consecutive mess attendance streak!",
              redemption_code: "ANN-4192-DS",
              rule_id: "rule_7_day_streak"
            }
          ],
          expired_coupons: [],
          progress: [
            {
              rule_id: "rule_10_meals",
              rule_name: "10-Meal Attendance Milestone",
              reward_title: "Free Artisan Coffee",
              reward_type: "FREE_COFFEE",
              current: 4,
              target: 10,
              remaining: 6,
              percentage: 40,
              unit: "meals attended",
              label: "4/10 meals attended (6 to go for next Free Coffee)"
            },
            {
              rule_id: "rule_20_meals_10_feedbacks",
              rule_name: "Active Contributor Feast",
              reward_title: "Free Sunday Special Feast Meal",
              reward_type: "FREE_MEAL",
              current: 14,
              target: 20,
              current_feedback: 8,
              target_feedback: 10,
              percentage: 75,
              unit: "meals & feedback",
              label: "14/20 meals + 8/10 reviews submitted"
            },
            {
              rule_id: "rule_7_day_streak",
              rule_name: "7-Day Consistency Warrior",
              reward_title: "Free Gourmet Dessert",
              reward_type: "BONUS_DESSERT",
              current: 5,
              target: 7,
              remaining: 2,
              percentage: 71,
              unit: "day streak",
              label: "5/7-day streak (2 more consecutive days needed)"
            }
          ]
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleRedeemClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setRedeemConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedCoupon) return;
    setRedeeming(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch("/student/coupons/redeem", {
        method: "POST",
        body: JSON.stringify({ coupon_id: selectedCoupon.id })
      });
      
      setRedeemConfirmOpen(false);
      setRedeemSuccessCoupon({
        ...selectedCoupon,
        status: "REDEEMED",
        redemption_code: res.coupon?.redemption_code || selectedCoupon.redemption_code,
        redeemed_date: res.coupon?.redeemed_date || "Just now"
      });
      // Refresh list
      await fetchRewards();
    } catch (err: any) {
      console.error("Redemption failed", err);
      setErrorMessage(err.message || "Unable to redeem coupon at this moment.");
    } finally {
      setRedeeming(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const getRewardIcon = (type: string, className = "h-5 w-5") => {
    switch (type) {
      case "FREE_COFFEE":
        return <Coffee className={className} />;
      case "FREE_MEAL":
        return <UtensilsCrossed className={className} />;
      case "BONUS_DESSERT":
        return <Gift className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getRewardGradient = (type: string) => {
    switch (type) {
      case "FREE_COFFEE":
        return "from-amber-500 to-orange-600";
      case "FREE_MEAL":
        return "from-emerald-500 to-teal-700";
      case "BONUS_DESSERT":
        return "from-purple-500 to-indigo-600";
      default:
        return "from-blue-600 to-indigo-700";
    }
  };

  const availableCount = data?.available_coupons.length || 0;
  const redeemedCount = data?.redeemed_coupons.length || 0;
  const expiredCount = data?.expired_coupons.length || 0;

  return (
    <div className="p-5 space-y-6">
      
      {/* Top Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Student Rewards & Perks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Earn coupons through verified mess attendance & reviews
          </p>
        </div>
        <button
          onClick={() => fetchRewards(true)}
          disabled={refreshing}
          title="Refresh Rewards"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-3.5 text-white shadow-md shadow-blue-500/15 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-2 -bottom-2 opacity-15 text-white">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-blue-100">Verified Meals</p>
          <div className="mt-1">
            <span className="text-2xl font-black">{data?.stats.verified_meals_count ?? 0}</span>
            <span className="text-[10px] text-blue-200 block">QR Scanned</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-3.5 text-white shadow-md shadow-orange-500/15 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-2 -bottom-2 opacity-15 text-white">
            <Flame className="h-16 w-16" />
          </div>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-100">Active Streak</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black">{data?.stats.current_streak_days ?? 0}</span>
            <span className="text-[11px] font-semibold text-amber-200">Days 🔥</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-3.5 text-white shadow-md shadow-teal-500/15 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-2 -bottom-2 opacity-15 text-white">
            <Gift className="h-16 w-16" />
          </div>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-emerald-100">Coupons</p>
          <div className="mt-1">
            <span className="text-2xl font-black">{data?.available_coupons.length ?? 0}</span>
            <span className="text-[10px] text-emerald-200 block">Available</span>
          </div>
        </div>
      </div>

      {/* PROGRESS TOWARDS UPCOMING REWARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Progress Toward Next Rewards
          </h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Auto-unlocked</span>
        </div>

        <div className="space-y-2.5">
          {data?.progress && data.progress.length > 0 ? (
            data.progress.map((prog) => (
              <Card key={prog.rule_id} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getRewardGradient(prog.reward_type)} text-white shadow-xs`}>
                        {getRewardIcon(prog.reward_type, "h-3.5 w-3.5")}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {prog.reward_title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {prog.rule_name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {prog.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getRewardGradient(prog.reward_type)}`}
                      style={{ width: `${Math.max(5, Math.min(100, prog.percentage))}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>{prog.label}</span>
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-center text-xs text-slate-500">
              Loading reward milestones...
            </div>
          )}
        </div>
      </div>

      {/* COUPONS SECTION (TABS) */}
      <div className="space-y-4 pt-1">
        {/* Tab Controls */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/60 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "available"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Available</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === "available" ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "bg-slate-300/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
              {availableCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("redeemed")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "redeemed"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Redeemed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {redeemedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("expired")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "expired"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Expired</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {expiredCount}
            </span>
          </button>
        </div>

        {/* Tab 1: AVAILABLE COUPONS */}
        {activeTab === "available" && (
          <div className="space-y-3.5">
            {data?.available_coupons && data.available_coupons.length > 0 ? (
              data.available_coupons.map((coupon) => (
                <Card 
                  key={coupon.id} 
                  className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden group"
                >
                  {/* Card Header Ribbon */}
                  <div className={`h-2.5 w-full bg-gradient-to-r ${getRewardGradient(coupon.reward_type)}`} />
                  
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${getRewardGradient(coupon.reward_type)} text-white shadow-sm shrink-0`}>
                          {getRewardIcon(coupon.reward_type, "h-5 w-5")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              {coupon.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {coupon.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* "Why you got this" Reason Box */}
                    <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-blue-700 dark:text-blue-300 block">Why you earned this:</span>
                        <span>{coupon.reason}</span>
                      </div>
                    </div>

                    {/* Expiry & Redeem Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Valid until <strong className="text-slate-700 dark:text-slate-300">{coupon.expiry_date}</strong></span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold ml-1">
                          {coupon.days_left}d left
                        </span>
                      </div>

                      <button
                        onClick={() => handleRedeemClick(coupon)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${getRewardGradient(coupon.reward_type)} shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1`}
                      >
                        <span>Redeem</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <Gift className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Available Coupons Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Attend meals and scan your QR code at the mess counter to earn free coffees, feasts, and perks!
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                    Next milestone: 10 verified meals
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: REDEEMED COUPONS */}
        {activeTab === "redeemed" && (
          <div className="space-y-3">
            {data?.redeemed_coupons && data.redeemed_coupons.length > 0 ? (
              data.redeemed_coupons.map((coupon) => (
                <Card 
                  key={coupon.id} 
                  className="border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden opacity-90"
                >
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {getRewardIcon(coupon.reward_type, "h-4 w-4")}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-through decoration-slate-400">
                            {coupon.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Redeemed on {coupon.redeemed_date || "Past Session"}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Claimed
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Verification Code:</span>
                      <button 
                        onClick={() => {
                          setSelectedCoupon(coupon);
                          setRedeemSuccessCoupon(coupon);
                        }}
                        className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {coupon.redemption_code}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No redeemed coupons in your history.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: EXPIRED COUPONS */}
        {activeTab === "expired" && (
          <div className="space-y-3">
            {data?.expired_coupons && data.expired_coupons.length > 0 ? (
              data.expired_coupons.map((coupon) => (
                <Card 
                  key={coupon.id} 
                  className="border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 rounded-2xl overflow-hidden opacity-60"
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{coupon.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-[10px] font-bold">
                        Expired
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Expired on {coupon.expiry_date}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No expired coupons! Great job redeeming your rewards on time.
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- STEP 1: CONFIRM REDEMPTION MODAL --- */}
      {redeemConfirmOpen && selectedCoupon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex justify-center">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${getRewardGradient(selectedCoupon.reward_type)} text-white shadow-lg`}>
                {getRewardIcon(selectedCoupon.reward_type, "h-8 w-8")}
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Redeem this Perk?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedCoupon.title}
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Please ensure you are at the campus mess or cafe counter. Once confirmed, your unique verification code will be activated.
              </span>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-1.5 border border-red-200 dark:border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRedeemConfirmOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={redeeming}
                onClick={handleConfirmRedeem}
                className={`flex-1 py-3 text-white text-xs font-bold rounded-xl shadow-md bg-gradient-to-r ${getRewardGradient(selectedCoupon.reward_type)} hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1 disabled:opacity-50`}
              >
                {redeeming ? "Activating..." : "Confirm & Redeem"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 2: REDEMPTION SUCCESS & VERIFICATION SCREEN --- */}
      {redeemSuccessCoupon && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            
            {/* Celebration Badge */}
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                Coupon Activated!
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {redeemSuccessCoupon.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Present this code to the counter staff
              </p>
            </div>

            {/* VERIFICATION CODE BOX */}
            <div className="p-4 bg-slate-900 dark:bg-slate-950 text-white rounded-2xl shadow-inner relative space-y-2 border border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Counter Redemption Code
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-black tracking-wider text-amber-400">
                  {redeemSuccessCoupon.redemption_code}
                </span>
                <button
                  onClick={() => copyToClipboard(redeemSuccessCoupon.redemption_code)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Barcode Mock Visual */}
              <div className="pt-2 flex justify-center opacity-70">
                <div className="h-8 w-44 bg-gradient-to-r from-white via-transparent to-white repeating-linear-gradient flex items-center justify-center font-mono text-[8px] tracking-[6px] text-slate-400">
                  || | ||| || ||| | |||
                </div>
              </div>
            </div>

            {/* Student metadata check */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl flex justify-between items-center">
              <span>Student ID: <strong className="text-slate-800 dark:text-slate-200">ET12345</strong></span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified
              </span>
            </div>

            <button
              onClick={() => {
                setRedeemSuccessCoupon(null);
                setSelectedCoupon(null);
              }}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-md hover:opacity-90 transition-all"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
