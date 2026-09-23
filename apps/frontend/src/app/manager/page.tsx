"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Calendar, ChevronRight, CheckCircle2, CloudRain, TreePine, QrCode, Maximize2, RefreshCw, Printer, ShieldCheck, UserCheck, AlertTriangle, Users, Flame, Clock, Layers, FileSpreadsheet, Lock, AlertCircle, Sparkles, ChefHat } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { apiFetch } from "@/lib/api";

interface RawMaterialItem {
  ingredient: string;
  category: string;
  unit: string;
  amount: number;
  per_person: number;
}

interface MealSessionData {
  meal_id: number;
  meal_type: string;
  menu_items: string;
  institution_name: string;
  phase: "PLANNING" | "ATTENDANCE" | "SUMMARY";
  is_cutoff_passed: boolean;
  start_time_str: string;
  end_time_str: string;
  cutoff_time_str: string;
  cutoff_minutes: number;
  seconds_until_start: number;
  seconds_until_cutoff: number;
  headcount: {
    total_enrolled: number;
    opted_in: number;
    skipped: number;
    predicted_attendance: number;
    scanned_count: number;
    no_shows: number;
  };
  raw_materials: RawMaterialItem[];
}

interface VerifiedStudent {
  student_id: string;
  email: string;
  department: string;
  hostel: string;
  verified_at: string;
  meal_type: string;
}

const attendanceFlowData = [
  { time: "12:30 PM", count: 0 },
  { time: "12:45 PM", count: 140 },
  { time: "1:00 PM", count: 320 },
  { time: "1:15 PM", count: 490 },
  { time: "1:30 PM", count: 580 },
  { time: "1:45 PM", count: 650 },
  { time: "2:00 PM", count: 692 },
];

export default function ManagerDashboard() {
  // Session & Phase State
  const [session, setSession] = useState<MealSessionData | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>("LUNCH");
  const [viewTab, setViewTab] = useState<"AUTO" | "PLANNING" | "ATTENDANCE" | "SUMMARY">("AUTO");
  const [loading, setLoading] = useState(true);

  // Mess QR Code states
  const [qrPayload, setQrPayload] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrExpiresAt, setQrExpiresAt] = useState<number>(0);
  const [qrTimeRemaining, setQrTimeRemaining] = useState<number>(180);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [showKioskModal, setShowKioskModal] = useState<boolean>(false);

  // Live Attendance Stream states
  const [recentScans, setRecentScans] = useState<VerifiedStudent[]>([]);
  const [newScanAlert, setNewScanAlert] = useState<boolean>(false);

  // Fetch Current Meal Session (Planning + Phase info)
  const fetchSessionData = async (mealOverride?: string) => {
    try {
      const targetType = mealOverride || selectedMealType;
      const data = await apiFetch(`/manager/meal-session/current?meal_type_override=${targetType}`);
      setSession(data);
    } catch (err) {
      console.warn("Using offline fallback meal session");
      if (!session) {
        setSession({
          meal_id: 2,
          meal_type: "LUNCH",
          menu_items: "Paneer Tikka, Jeera Rice, Yellow Daal, Naan",
          institution_name: "Example Tech University",
          phase: "ATTENDANCE",
          is_cutoff_passed: true,
          start_time_str: "12:30 PM",
          end_time_str: "02:00 PM",
          cutoff_time_str: "11:30 AM",
          cutoff_minutes: 60,
          seconds_until_start: 0,
          seconds_until_cutoff: 0,
          headcount: {
            total_enrolled: 2000,
            opted_in: 1907,
            skipped: 93,
            predicted_attendance: 1811,
            scanned_count: 692,
            no_shows: 65,
          },
          raw_materials: [
            { ingredient: "BASMATI RICE", category: "Grains", unit: "KG", amount: 181.1, per_person: 0.10 },
            { ingredient: "YELLOW DAL / TOOR", category: "Legumes", unit: "KG", amount: 90.55, per_person: 0.05 },
            { ingredient: "FRESH PANEER", category: "Dairy", unit: "KG", amount: 144.88, per_person: 0.08 },
            { ingredient: "ONIONS", category: "Vegetables", unit: "KG", amount: 54.33, per_person: 0.03 },
            { ingredient: "TOMATOES", category: "Vegetables", unit: "KG", amount: 54.33, per_person: 0.03 },
            { ingredient: "WHEAT FLOUR (NAAN)", category: "Grains", unit: "KG", amount: 108.66, per_person: 0.06 },
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Live Mess QR Token
  const fetchMessQR = async () => {
    try {
      const data = await apiFetch("/manager/mess-qr");
      const payloadString = data.payload_string || JSON.stringify(data);
      setQrPayload(payloadString);
      setQrExpiresAt(data.expires_at || (Math.floor(Date.now() / 1000) + 180));
      
      const url = await QRCode.toDataURL(payloadString, {
        width: 380,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffff" }
      });
      setQrDataUrl(url);
    } catch (err) {
      const fallbackPayload = JSON.stringify({
        app: "ANNAPURNA_AI",
        version: "1.0",
        institution_id: 1,
        institution_name: "Example Tech University",
        timestamp: Math.floor(Date.now() / 1000),
        expires_at: Math.floor(Date.now() / 1000) + 180,
        nonce: "7f9a1b",
        sig: "demo_offline_signature"
      });
      setQrPayload(fallbackPayload);
      const url = await QRCode.toDataURL(fallbackPayload, { width: 380, margin: 2 });
      setQrDataUrl(url);
    }
  };

  // Regenerate Secret
  const handleRegenerateQR = async () => {
    setIsRegenerating(true);
    try {
      const res = await apiFetch("/manager/mess-qr/regenerate", { method: "POST" });
      const qrData = res.qr || res;
      const payloadString = qrData.payload_string || JSON.stringify(qrData);
      setQrPayload(payloadString);
      setQrExpiresAt(qrData.expires_at || (Math.floor(Date.now() / 1000) + 180));
      const url = await QRCode.toDataURL(payloadString, { width: 380, margin: 2 });
      setQrDataUrl(url);
    } catch (err) {
      await fetchMessQR();
    } finally {
      setIsRegenerating(false);
    }
  };

  // Fetch Live Attendance Scans
  const fetchLiveAttendance = async () => {
    try {
      const data = await apiFetch("/manager/live-attendance");
      if (data) {
        if (data.recent_scans && data.recent_scans.length > recentScans.length) {
          setNewScanAlert(true);
          setTimeout(() => setNewScanAlert(false), 2000);
        }
        setRecentScans(data.recent_scans || []);
      }
    } catch (err) {
      if (recentScans.length === 0) {
        setRecentScans([
          { student_id: "ET10492", email: "aarav.patel@example.com", department: "Computer Science", hostel: "Block B - R104", verified_at: "1:14:32 PM", meal_type: "LUNCH" },
          { student_id: "ET11823", email: "priya.sharma@example.com", department: "Electronics", hostel: "Block A - R312", verified_at: "1:13:58 PM", meal_type: "LUNCH" },
          { student_id: "ET12345", email: "student@example.com", department: "Computer Science", hostel: "Block C - R210", verified_at: "1:12:10 PM", meal_type: "LUNCH" },
        ]);
      }
    }
  };

  // Initial Load & Polling
  useEffect(() => {
    fetchSessionData();
    fetchMessQR();
    fetchLiveAttendance();

    const pollInterval = setInterval(() => {
      fetchSessionData();
      fetchLiveAttendance();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [selectedMealType]);

  // QR Rotating Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, qrExpiresAt - now);
      setQrTimeRemaining(remaining);
      if (remaining <= 0 && qrExpiresAt > 0) {
        fetchMessQR();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [qrExpiresAt]);

  // Resolve Effective Active View
  const serverPhase = session?.phase || "ATTENDANCE";
  const activeView: "PLANNING" | "ATTENDANCE" | "SUMMARY" = 
    viewTab === "AUTO" ? serverPhase : viewTab;

  const headcount = session?.headcount || {
    total_enrolled: 2000,
    opted_in: 1907,
    skipped: 93,
    predicted_attendance: 1811,
    scanned_count: 692,
    no_shows: 65,
  };

  const rawMaterials = session?.raw_materials || [];
  const verifiedPercentage = Math.round((headcount.scanned_count / Math.max(1, headcount.opted_in)) * 100) || 88;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* TOPBAR: Title, Server-Phase Badge & Session Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">MESS COMMAND CENTER</h2>
            {/* Dynamic Server Phase Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border shadow-sm ${
              serverPhase === "PLANNING" 
                ? "bg-blue-50 text-blue-800 border-blue-200" 
                : serverPhase === "ATTENDANCE"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-purple-50 text-purple-800 border-purple-200"
            }`}>
              <span className={`h-2 w-2 rounded-full ${serverPhase === "ATTENDANCE" ? "bg-emerald-500 animate-ping" : "bg-blue-500"}`}></span>
              SERVER PHASE: {serverPhase}
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">
            {session?.institution_name || "Campus Mess"} • Session: <strong>{session?.meal_type || selectedMealType}</strong> ({session?.start_time_str} - {session?.end_time_str})
          </p>
        </div>

        {/* Meal Session Switcher */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          {["BREAKFAST", "LUNCH", "DINNER"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setSelectedMealType(m);
                fetchSessionData(m);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedMealType === m 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* PHASE VIEW SELECTOR TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setViewTab("AUTO")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              viewTab === "AUTO"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Auto ({serverPhase})
          </button>
          
          <button
            onClick={() => setViewTab("PLANNING")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              viewTab === "PLANNING"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ChefHat className="h-3.5 w-3.5" /> 1. Pre-Meal Planning
          </button>

          <button
            onClick={() => setViewTab("ATTENDANCE")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              viewTab === "ATTENDANCE"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" /> 2. Live QR & Attendance
          </button>

          <button
            onClick={() => setViewTab("SUMMARY")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              viewTab === "SUMMARY"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> 3. Post-Meal Summary
          </button>
        </div>

        {/* Cutoff Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
          {session?.is_cutoff_passed ? (
            <span className="text-amber-700 flex items-center gap-1 font-bold">
              <Lock className="h-3.5 w-3.5 text-amber-600" /> Cutoff Locked ({session.cutoff_time_str})
            </span>
          ) : (
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <Clock className="h-3.5 w-3.5 text-emerald-600" /> Cutoff Open until {session?.cutoff_time_str}
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHASE 1: PRE-MEAL PLANNING VIEW */}
      {/* ========================================================================= */}
      {activeView === "PLANNING" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Headcount Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-l-4 border-l-blue-600 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Enrolled</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{headcount.total_enrolled}</p>
                <p className="text-[11px] text-slate-400 mt-1">Hostel students on meal plan</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-red-500 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Confirmed Skips</p>
                <p className="text-3xl font-black text-red-600 mt-1">{headcount.skipped}</p>
                <p className="text-[11px] text-slate-400 mt-1">Opted out via student app</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-emerald-600 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Currently Opted In</p>
                <p className="text-3xl font-black text-emerald-700 mt-1">{headcount.opted_in}</p>
                <p className="text-[11px] text-slate-400 mt-1">Expected students (Default: Yes)</p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50/70 border-2 border-emerald-200 shadow-sm rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-900 uppercase">AI Target Portions</p>
                  <p className="text-3xl font-black text-emerald-700 mt-1">{headcount.predicted_attendance}</p>
                  <p className="text-[11px] text-emerald-800 mt-1 font-medium">Recommended Batch Size</p>
                </div>
                <ChefHat className="h-9 w-9 text-emerald-600" />
              </CardContent>
            </Card>
          </div>

          {/* Real-time Raw Materials Calculation Table */}
          <Card className="shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> Live Raw Material Requirements ({selectedMealType})
                </CardTitle>
                <p className="text-xs text-slate-500 font-medium">
                  Automatically recalculated in real-time based on <strong>{headcount.predicted_attendance} portions</strong>
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print Prep Sheet
              </button>
            </CardHeader>
            
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-3.5">Raw Ingredient</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5 text-center">Portion / Student</th>
                    <th className="px-6 py-3.5 text-right">Required Batch Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawMaterials.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">{item.ingredient}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-semibold text-slate-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600">
                        {item.per_person} {item.unit}/person
                      </td>
                      <td className="px-6 py-3.5 font-black text-right text-base text-emerald-700">
                        {item.amount} <span className="text-xs font-bold text-slate-400">{item.unit}</span>
                      </td>
                    </tr>
                  ))}
                  {rawMaterials.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No recipe configuration available for this meal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Kitchen Workflow Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <p className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5 mb-1.5">
                <Clock className="h-4 w-4 text-blue-600" /> Kitchen Schedule & Prep Cutoff
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students can opt out until <strong>{session?.cutoff_time_str}</strong> ({session?.cutoff_minutes} mins before service). 
                Once passed, figures lock automatically so kitchen chefs can finalize boiling and cooking quantities without surprise changes.
              </p>
            </Card>

            <Card className="border border-emerald-100 rounded-2xl p-4 bg-emerald-50/50">
              <p className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5 mb-1.5">
                <TreePine className="h-4 w-4 text-emerald-600" /> Food Waste Prevention Impact
              </p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                With <strong>{headcount.skipped} confirmed skips</strong>, you have successfully avoided preparing ~{Math.round(headcount.skipped * 0.4)} kg of excess food for this session.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: LIVE ATTENDANCE & MESS QR VIEW */}
      {/* ========================================================================= */}
      {activeView === "ATTENDANCE" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* MESS ENTRANCE QR STATION */}
            <Card className="border-2 border-emerald-100 shadow-md rounded-3xl bg-gradient-to-b from-emerald-50/40 via-white to-white overflow-hidden">
              <CardHeader className="pb-2 border-b border-emerald-100/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold text-slate-900">Mess Entrance QR</CardTitle>
                    <p className="text-[10px] font-semibold text-emerald-700">Single In-App Scan Pass</p>
                  </div>
                </div>
                <button
                  onClick={handleRegenerateQR}
                  disabled={isRegenerating}
                  title="Regenerate Security Secret"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </CardHeader>

              <CardContent className="pt-5 flex flex-col items-center text-center space-y-4">
                
                {/* Live QR Image Box */}
                <div className="relative p-3 bg-white rounded-2xl border border-slate-200 shadow-inner group flex items-center justify-center">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Mess Entrance QR" className="w-48 h-48 rounded-xl" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-xl">
                      <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowKioskModal(true)}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white gap-1 backdrop-blur-xs cursor-pointer"
                  >
                    <Maximize2 className="h-6 w-6" />
                    <span className="text-xs font-bold">Open Kiosk Display</span>
                  </button>
                </div>

                {/* Rotating Token Timer */}
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-left">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-600 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Rotating Token Security
                    </span>
                    <span className="text-emerald-700 font-mono">{qrTimeRemaining}s</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(qrTimeRemaining / 180) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                    Refreshes automatically every 3 mins to prevent screenshot fraud.
                  </p>
                </div>

                {/* Actions */}
                <div className="w-full flex gap-2">
                  <button
                    onClick={() => setShowKioskModal(true)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Maximize2 className="h-3.5 w-3.5" /> Fullscreen Kiosk
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* REAL-TIME HEADCOUNT & ATTENDANCE DONUT */}
            <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">Real-Time Headcount Verification</CardTitle>
                  <p className="text-xs text-slate-500 font-medium">Session: {selectedMealType} ({session?.start_time_str} - {session?.end_time_str})</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  {headcount.scanned_count} VERIFIED AT GATE
                </span>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
                  
                  {/* Planned Headcount */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase">Target Prepared</p>
                    <p className="text-4xl font-black text-slate-800">{headcount.predicted_attendance}</p>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Portions cooked</p>
                  </div>

                  {/* Central Donut */}
                  <div className="relative flex flex-col items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle cx="72" cy="72" r="58" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-100" />
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="58" 
                        stroke="currentColor" 
                        strokeWidth="14" 
                        fill="transparent" 
                        strokeDasharray="364" 
                        strokeDashoffset={364 - (364 * (verifiedPercentage / 100))} 
                        className="text-emerald-600 transition-all duration-1000 ease-out" 
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Scanned</p>
                      <p className="text-3xl font-black text-slate-900 leading-none">{headcount.scanned_count}</p>
                      <p className="text-[11px] text-emerald-600 font-bold mt-1">({verifiedPercentage}%)</p>
                    </div>
                  </div>

                  {/* Skips & Total Opted In */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Confirmed Skips</p>
                      <p className="text-2xl font-black text-red-600">{headcount.skipped}</p>
                      <p className="text-[10px] text-slate-400">Meals Averted (Saved)</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Total Enrolled:</span>
                      <span className="text-slate-900 font-bold">{headcount.total_enrolled}</span>
                    </div>
                  </div>

                </div>

                {/* Compact Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">Verified In-App</p>
                    <p className="text-lg font-black text-emerald-900">{headcount.scanned_count}</p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-700 uppercase">Opted-In Students</p>
                    <p className="text-lg font-black text-blue-900">{headcount.opted_in}</p>
                  </div>
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Expected Remaining</p>
                    <p className="text-lg font-black text-amber-900">{Math.max(0, headcount.opted_in - headcount.scanned_count)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">Avg Queue Time</p>
                    <p className="text-lg font-black text-slate-900">1.2 sec</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LIVE VERIFIED STUDENT STREAM */}
          <Card className="shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">Live Entrance Verification Stream</CardTitle>
                  <p className="text-xs text-slate-500 font-medium">Real-time attendance log pushed from student in-app scans</p>
                </div>
              </div>
              {newScanAlert && (
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold animate-bounce shadow-md">
                  + NEW SCAN VERIFIED
                </span>
              )}
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                {recentScans.map((student, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {student.student_id.slice(-4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{student.student_id}</p>
                          <span className="text-[11px] text-slate-500 font-medium">({student.email})</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {student.hostel} • {student.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {student.verified_at}
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Verified In-App QR</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3: POST-MEAL SUMMARY & RECONCILIATION VIEW */}
      {/* ========================================================================= */}
      {activeView === "SUMMARY" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-l-4 border-l-blue-600 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Opted-In Students</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{headcount.opted_in}</p>
                <p className="text-[11px] text-slate-400 mt-1">Expected to dine</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-emerald-600 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Actually Attended</p>
                <p className="text-3xl font-black text-emerald-700 mt-1">{headcount.scanned_count}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">Verified at door ({verifiedPercentage}%)</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-amber-500 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">No-Shows</p>
                <p className="text-3xl font-black text-amber-600 mt-1">{Math.max(0, headcount.opted_in - headcount.scanned_count)}</p>
                <p className="text-[11px] text-slate-400 mt-1">Opted in but didn't scan</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-teal-600 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Wastage Prevented</p>
                <p className="text-3xl font-black text-teal-700 mt-1">~{Math.round(headcount.skipped * 0.4)} kg</p>
                <p className="text-[11px] text-teal-600 font-bold mt-1">From {headcount.skipped} early skips</p>
              </CardContent>
            </Card>
          </div>

          {/* Planned vs Actual Consumption Recap */}
          <Card className="shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Ingredient Reconciliation Breakdown</CardTitle>
              <p className="text-xs text-slate-500 font-medium">Comparison of planned raw materials vs actual attendee consumption</p>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3.5">Ingredient</th>
                    <th className="px-6 py-3.5">Planned Batch Quantity</th>
                    <th className="px-6 py-3.5">Actual Consumed (Estimated)</th>
                    <th className="px-6 py-3.5 text-right">Surplus / Buffer Retained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawMaterials.map((item, idx) => {
                    const actualConsumed = round2(headcount.scanned_count * item.per_person);
                    const surplus = round2(item.amount - actualConsumed);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">{item.ingredient}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-700">
                          {item.amount} {item.unit}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-emerald-700">
                          {actualConsumed} {item.unit}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-right text-slate-900">
                          +{surplus} {item.unit} (Optimal)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FULLSCREEN ENTRANCE KIOSK MODAL */}
      {showKioskModal && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-between p-8 text-white animate-in fade-in duration-200">
          <div className="w-full max-w-5xl flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl font-black">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">{session?.institution_name || "CAMPUS DINING HALL"}</h1>
                <p className="text-xs font-bold text-emerald-400 tracking-wider">ENTRANCE VERIFICATION STATION • {selectedMealType}</p>
              </div>
            </div>

            <button
              onClick={() => setShowKioskModal(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Exit Kiosk
            </button>
          </div>

          <div className="flex flex-col items-center justify-center my-auto space-y-6">
            <div className="p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] border-4 border-emerald-400">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Live Mess QR" className="w-80 h-80 sm:w-96 sm:h-96 rounded-2xl" />
              )}
            </div>

            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-2xl font-black text-white tracking-tight">SCAN WITH ANNAPURNA STUDENT APP</h3>
              <p className="text-sm text-slate-400">
                Open your student dashboard & tap <strong>"Scan Mess QR"</strong> to verify meal access.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Code Rotates In: {qrTimeRemaining}s
            </div>
          </div>

          <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-300">Live Counter:</span>
              <span className="text-lg font-black text-emerald-400">{headcount.scanned_count} Verified</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{headcount.skipped} Confirmed Skips</span>
            </div>
            <p className="text-[11px] text-slate-500">Fast contactless entry • No counter delays</p>
          </div>
        </div>
      )}
    </div>
  );
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}
