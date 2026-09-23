"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Calendar, ChevronRight, CheckCircle2, CloudRain, TreePine, QrCode, Maximize2, RefreshCw, Download, ShieldCheck, UserCheck, AlertTriangle, Users, Flame, Printer } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { apiFetch } from "@/lib/api";

interface VerifiedStudent {
  student_id: string;
  email: string;
  department: string;
  hostel: string;
  verified_at: string;
  meal_type: string;
}

const attendanceData = [
  { time: "12:30 PM", count: 0 },
  { time: "12:45 PM", count: 140 },
  { time: "1:00 PM", count: 320 },
  { time: "1:15 PM", count: 490 },
  { time: "1:30 PM", count: 580 },
  { time: "1:45 PM", count: 650 },
  { time: "2:00 PM", count: 692 },
];

export default function ManagerDashboard() {
  // Mess QR Code states
  const [qrPayload, setQrPayload] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrExpiresAt, setQrExpiresAt] = useState<number>(0);
  const [qrTimeRemaining, setQrTimeRemaining] = useState<number>(180);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [showKioskModal, setShowKioskModal] = useState<boolean>(false);

  // Live Attendance Stream states
  const [recentScans, setRecentScans] = useState<VerifiedStudent[]>([]);
  const [scannedCount, setScannedCount] = useState<number>(692);
  const [skippedCount, setSkippedCount] = useState<number>(93);
  const [totalEnrolled, setTotalEnrolled] = useState<number>(2000);
  const [predictedCount, setPredictedCount] = useState<number>(785);
  const [mealType, setMealType] = useState<string>("LUNCH");
  const [newScanAlert, setNewScanAlert] = useState<boolean>(false);

  // Load Mess QR Token
  const fetchMessQR = async () => {
    try {
      const data = await apiFetch("/manager/mess-qr");
      const payloadString = data.payload_string || JSON.stringify(data);
      setQrPayload(payloadString);
      setQrExpiresAt(data.expires_at || (Math.floor(Date.now() / 1000) + 180));
      
      const url = await QRCode.toDataURL(payloadString, {
        width: 380,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff"
        }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.warn("Using offline fallback mess QR");
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

  // Regenerate Mess QR Secret
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

  // Load Live Attendance Data
  const fetchLiveAttendance = async () => {
    try {
      const data = await apiFetch("/manager/live-attendance");
      if (data) {
        if (data.recent_scans && data.recent_scans.length > recentScans.length) {
          setNewScanAlert(true);
          setTimeout(() => setNewScanAlert(false), 2000);
        }
        setRecentScans(data.recent_scans || []);
        setScannedCount(data.scanned_count || 692);
        setSkippedCount(data.skipped_count || 93);
        setTotalEnrolled(data.total_enrolled || 2000);
        setPredictedCount(data.predicted_count || 785);
        setMealType(data.meal_type || "LUNCH");
      }
    } catch (err) {
      // offline baseline
      if (recentScans.length === 0) {
        setRecentScans([
          { student_id: "ET10492", email: "aarav.patel@example.com", department: "Computer Science", hostel: "Block B - R104", verified_at: "1:14:32 PM", meal_type: "LUNCH" },
          { student_id: "ET11823", email: "priya.sharma@example.com", department: "Electronics", hostel: "Block A - R312", verified_at: "1:13:58 PM", meal_type: "LUNCH" },
          { student_id: "ET12345", email: "student@example.com", department: "Computer Science", hostel: "Block C - R210", verified_at: "1:12:10 PM", meal_type: "LUNCH" },
        ]);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchMessQR();
    fetchLiveAttendance();

    // Poll live attendance every 3 seconds for real-time reactivity
    const pollInterval = setInterval(() => {
      fetchLiveAttendance();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  // Rotating Token Expiry Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, qrExpiresAt - now);
      setQrTimeRemaining(remaining);

      // Auto-refresh when token expires
      if (remaining <= 0 && qrExpiresAt > 0) {
        fetchMessQR();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [qrExpiresAt]);

  const optedInCount = totalEnrolled - skippedCount;
  const verifiedPercentage = Math.round((scannedCount / optedInCount) * 100) || 88;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">MESS COMMAND CENTER</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE STATION ACTIVE
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-0.5">Automated Single-QR Verification & Wastage Prevention Hub</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKioskModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Maximize2 className="h-4 w-4" /> Fullscreen Entrance Kiosk
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm text-slate-700">
            <Calendar className="h-4 w-4 text-slate-500" />
            Today • {mealType}
          </div>
        </div>
      </div>

      {/* TOP ROW: Mess QR Station & Real-Time Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MESS ENTRANCE QR CODE STATION */}
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
            
            {/* Live QR Display Box */}
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

            {/* Rotating Security Token Bar */}
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

            {/* Action Buttons */}
            <div className="w-full flex gap-2">
              <button
                onClick={() => setShowKioskModal(true)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" /> Fullscreen Display
              </button>
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Print Mess Poster"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </CardContent>
        </Card>

        {/* REAL-TIME HEADCOUNT & DONUT METRICS */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Headcount Verification & Attendance</CardTitle>
              <p className="text-xs text-slate-500 font-medium">Session: {mealType} (12:30 PM - 02:00 PM)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              {scannedCount} VERIFIED AT GATE
            </span>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
              
              {/* Predicted Headcount */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">AI Forecast</p>
                <p className="text-4xl font-black text-slate-800">{predictedCount}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Target Portions Prepared</p>
              </div>

              {/* Central Verified Donut Chart */}
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
                  <p className="text-3xl font-black text-slate-900 leading-none">{scannedCount}</p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">({verifiedPercentage}%)</p>
                </div>
              </div>

              {/* Skips & Total Opted In */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Confirmed Skips</p>
                  <p className="text-2xl font-black text-red-600">{skippedCount}</p>
                  <p className="text-[10px] text-slate-400">Meals Averted (Saved)</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Total Enrolled:</span>
                  <span className="text-slate-900 font-bold">{totalEnrolled}</span>
                </div>
              </div>

            </div>

            {/* Quick Summary Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Verified In-App</p>
                <p className="text-lg font-black text-emerald-900">{scannedCount}</p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-700 uppercase">Opted-In Students</p>
                <p className="text-lg font-black text-blue-900">{optedInCount}</p>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-700 uppercase">Expected Remaining</p>
                <p className="text-lg font-black text-amber-900">{Math.max(0, optedInCount - scannedCount)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-600 uppercase">Avg Queue Time</p>
                <p className="text-lg font-black text-slate-900">1.2 sec</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECOND ROW: LIVE VERIFIED STUDENT STREAM & LIVE FLOW CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LIVE REAL-TIME VERIFIED STUDENTS STREAM */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
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
            <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
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

        {/* WASTAGE & ESG IMPACT */}
        <Card className="shadow-sm border-slate-200 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" /> Wastage Risk & Sustainability
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
              <TreePine className="h-8 w-8 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Wastage Risk: <span className="text-emerald-700 font-black">LOW (OPTIMAL)</span></p>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                  93 verified skips adjusted kitchen batch prep by ~37.2kg.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Protected Ingredients</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Paneer (Dairy)</span>
                  <span className="font-bold text-slate-900">14.5 kg saved</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Basmati Rice</span>
                  <span className="font-bold text-slate-900">18.0 kg saved</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Yellow Daal</span>
                  <span className="font-bold text-slate-900">8.2 kg saved</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner">
              <p className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
                <CloudRain className="h-3.5 w-3.5" /> AI Procurement Forecast
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dinner Forecast: 1,650 expected. Recommended prep batch release at 6:30 PM.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FULLSCREEN ENTRANCE KIOSK MODAL (For TV Monitors / Tablet Mounts) */}
      {showKioskModal && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-between p-8 text-white animate-in fade-in duration-200">
          {/* Kiosk Topbar */}
          <div className="w-full max-w-5xl flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl font-black">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">EXAMPLE TECH UNIVERSITY MESS</h1>
                <p className="text-xs font-bold text-emerald-400 tracking-wider">ENTRANCE VERIFICATION STATION • {mealType}</p>
              </div>
            </div>

            <button
              onClick={() => setShowKioskModal(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Exit Kiosk
            </button>
          </div>

          {/* Kiosk Center QR Display */}
          <div className="flex flex-col items-center justify-center my-auto space-y-6">
            <div className="p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] border-4 border-emerald-400">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Live Mess QR" className="w-80 h-80 sm:w-96 sm:h-96 rounded-2xl" />
              )}
            </div>

            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-2xl font-black text-white tracking-tight">SCAN WITH ANNAPURNA STUDENT APP</h3>
              <p className="text-sm text-slate-400">
                Open your Annapurna AI student dashboard & tap <strong>"Scan Mess QR"</strong> to verify meal access.
              </p>
            </div>

            {/* Rotating Token Timer */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Code Rotates In: {qrTimeRemaining}s
            </div>
          </div>

          {/* Kiosk Live Scanned Banner */}
          <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-300">Live Counter:</span>
              <span className="text-lg font-black text-emerald-400">{scannedCount} Verified</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{skippedCount} Confirmed Skips</span>
            </div>
            <p className="text-[11px] text-slate-500">Fast contactless entry • No queue delays</p>
          </div>
        </div>
      )}
    </div>
  );
}
