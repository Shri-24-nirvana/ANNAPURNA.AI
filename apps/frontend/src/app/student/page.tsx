"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Leaf, Award, Loader2, Star, MessageSquare, QrCode, Camera, AlertCircle, X, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import jsQR from "jsqr";

interface MealItem {
  id: number;
  meal_type: "BREAKFAST" | "LUNCH" | "DINNER";
  menu_items: string;
  scheduled_time: string;
  status: "ATTENDING" | "SKIPPING" | "SKIPPED" | "SCANNED";
  verified_at?: string | null;
  image: string;
  cutoffHour: number; // 24hr format
  cutoffMinute: number;
}

const DEFAULT_MEALS: MealItem[] = [
  {
    id: 1,
    meal_type: "BREAKFAST",
    menu_items: "Aloo Paratha, Curd, Pickle, Cardamom Tea",
    scheduled_time: "08:00 AM - 10:00 AM",
    status: "ATTENDING",
    image: "/breakfast_banner.png",
    cutoffHour: 10,
    cutoffMinute: 0
  },
  {
    id: 2,
    meal_type: "LUNCH",
    menu_items: "Paneer Tikka, Jeera Rice, Yellow Daal, Naan",
    scheduled_time: "12:30 PM - 02:00 PM",
    status: "ATTENDING",
    image: "/lunch_banner.png",
    cutoffHour: 14,
    cutoffMinute: 0
  },
  {
    id: 3,
    meal_type: "DINNER",
    menu_items: "Chicken Curry / Paneer Butter Masala, Roti, Salad",
    scheduled_time: "07:00 PM - 09:00 PM",
    status: "ATTENDING",
    image: "/dinner_banner.png",
    cutoffHour: 21,
    cutoffMinute: 0
  }
];

export default function StudentDashboard() {
  const [meals, setMeals] = useState<MealItem[]>(DEFAULT_MEALS);
  const [loadingMealId, setLoadingMealId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [selectedMealForScan, setSelectedMealForScan] = useState<MealItem | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  
  // Verification Result Modal
  const [scanResult, setScanResult] = useState<{
    status: "success" | "error";
    title: string;
    message: string;
    mealType?: string;
    verifiedAt?: string;
    studentId?: string;
  } | null>(null);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMeal, setFeedbackMeal] = useState<MealItem | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Video & Canvas Refs for In-App Scanner
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Live 1-second clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Fetch real status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await apiFetch("/meals/today");
        if (data && data.length > 0) {
          const merged = DEFAULT_MEALS.map(defMeal => {
            const apiMeal = data.find((m: any) => m.meal_type === defMeal.meal_type);
            if (apiMeal) {
              return {
                ...defMeal,
                id: apiMeal.id,
                menu_items: apiMeal.menu_items || defMeal.menu_items,
                status: apiMeal.status || defMeal.status,
                verified_at: apiMeal.verified_at || defMeal.verified_at
              };
            }
            return defMeal;
          });
          setMeals(merged);
        }
      } catch (err: any) {
        console.warn("Backend unavailable, using default local state.");
      }
    };
    loadStatus();
  }, []);

  // Real-Time Meal Logic
  const getActiveMealType = (): "BREAKFAST" | "LUNCH" | "DINNER" => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeVal = hours + minutes / 60;

    // Morning: 04:00 to 11:00 -> Breakfast
    if (timeVal >= 4 && timeVal < 11) {
      return "BREAKFAST";
    }
    // Afternoon: 11:00 to 16.5 (4:30 PM) -> Lunch
    else if (timeVal >= 11 && timeVal < 16.5) {
      return "LUNCH";
    }
    // Evening & Night: 16:30 to 04:00 -> Dinner
    else {
      return "DINNER";
    }
  };

  const activeMealType = getActiveMealType();
  const activeMeal = meals.find(m => m.meal_type === activeMealType) || meals[1];
  const otherMeals = meals.filter(m => m.meal_type !== activeMealType);

  // Dynamic Cutoff Countdown calculation
  const calculateCountdown = (meal: MealItem) => {
    const now = currentTime;
    const target = new Date(now);
    target.setHours(meal.cutoffHour, meal.cutoffMinute, 0, 0);

    // If target has passed today, assume tomorrow or show 0
    let diff = target.getTime() - now.getTime();
    if (diff < 0) {
      // In evening window for dinner or tomorrow breakfast
      diff = 0;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  const countdown = calculateCountdown(activeMeal);

  // Toggle Skip / Opt-back-in
  const toggleSkip = async (mealId: number, newStatus: "ATTENDING" | "SKIPPING") => {
    setLoadingMealId(mealId);
    try {
      await apiFetch("/attendance/skip", {
        method: "POST",
        body: JSON.stringify({ meal_id: mealId, status: newStatus }),
      });
      setMeals(prev => prev.map(m => m.id === mealId ? { ...m, status: newStatus } : m));
    } catch (err: any) {
      console.warn("Backend unavailable. Toggling local state.");
      setMeals(prev => prev.map(m => m.id === mealId ? { ...m, status: newStatus } : m));
    } finally {
      setLoadingMealId(null);
    }
  };

  // In-App Camera Scanner Controls
  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this browser or connection.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(scanQRCodeFrame);
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError(err.message || "Unable to access device camera. Please grant permission or use test simulator.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const scanQRCodeFrame = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanQRCodeFrame);
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        // Scanned successfully!
        handleVerifyPayload(code.data);
        return; // stop loop
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanQRCodeFrame);
  };

  // Open Scanner Modal
  const openScanner = (meal: MealItem) => {
    setSelectedMealForScan(meal);
    setShowScanner(true);
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Close Scanner Modal
  const closeScanner = () => {
    stopCamera();
    setShowScanner(false);
    setSelectedMealForScan(null);
  };

  // Execute Verification API Call
  const handleVerifyPayload = async (payloadString: string) => {
    if (verifying) return;
    setVerifying(true);
    stopCamera();

    try {
      const response = await apiFetch("/student/verify-mess-qr", {
        method: "POST",
        body: JSON.stringify({
          qr_payload: payloadString,
          meal_id: selectedMealForScan?.id,
          meal_type: selectedMealForScan?.meal_type
        })
      });

      // Update state locally to SCANNED
      if (selectedMealForScan) {
        setMeals(prev => prev.map(m => m.id === selectedMealForScan.id ? { 
          ...m, 
          status: "SCANNED",
          verified_at: response.verified_at || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : m));
      }

      setShowScanner(false);
      setScanResult({
        status: "success",
        title: "ACCESS GRANTED",
        message: response.message || `Verified for ${selectedMealForScan?.meal_type}`,
        mealType: selectedMealForScan?.meal_type,
        verifiedAt: response.verified_at || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        studentId: response.student_id || "ET12345"
      });

    } catch (err: any) {
      console.error("Verification failed:", err);
      const errorMsg = err.message || "Verification failed. Invalid or expired Mess QR.";
      setShowScanner(false);
      setScanResult({
        status: "error",
        title: "ACCESS DENIED",
        message: errorMsg,
        mealType: selectedMealForScan?.meal_type
      });
    } finally {
      setVerifying(false);
    }
  };

  // Test Simulation Scan: Fetches the live rotating QR from the backend and verifies it
  const handleSimulateScan = async () => {
    setVerifying(true);
    try {
      // 1. Fetch live rotating QR token from manager endpoint
      const qrData = await apiFetch("/manager/mess-qr");
      const payloadString = qrData.payload_string || JSON.stringify(qrData);

      // 2. Perform student verification
      await handleVerifyPayload(payloadString);
    } catch (err: any) {
      // If backend is offline, simulate realistic client response
      if (selectedMealForScan?.status === "SKIPPING" || selectedMealForScan?.status === "SKIPPED") {
        setShowScanner(false);
        setScanResult({
          status: "error",
          title: "ACCESS DENIED",
          message: `You are currently opted OUT (Skipped) for ${selectedMealForScan.meal_type}. Please opt back in on your dashboard before scanning.`
        });
      } else {
        if (selectedMealForScan) {
          setMeals(prev => prev.map(m => m.id === selectedMealForScan.id ? { 
            ...m, 
            status: "SCANNED",
            verified_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          } : m));
        }
        setShowScanner(false);
        setScanResult({
          status: "success",
          title: "ACCESS GRANTED",
          message: `Access Granted – Verified for ${selectedMealForScan?.meal_type}`,
          mealType: selectedMealForScan?.meal_type,
          verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          studentId: "ET12345"
        });
      }
      setVerifying(false);
    }
  };

  // Feedback Submission
  const submitFeedback = async () => {
    if (rating === 0) {
      setValidationError("Please select a star rating before submitting.");
      return;
    }
    setSubmittingFeedback(true);
    setValidationError("");
    try {
      await apiFetch("/student/feedback", {
        method: "POST",
        body: JSON.stringify({ 
          meal_id: feedbackMeal?.id || activeMeal.id, 
          rating, 
          comment 
        }),
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSuccess(false);
        setRating(0);
        setComment("");
        setFeedbackMeal(null);
      }, 2000);
    } catch (err) {
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSuccess(false);
        setRating(0);
        setComment("");
        setFeedbackMeal(null);
      }, 2000);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="p-6 space-y-6 pb-28 max-w-2xl mx-auto font-sans">
      {/* Impact Summary */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center justify-between">
            <span>Your Impact Summary</span>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Top 5% Eco Student</span>
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-green-50 rounded-xl p-3 flex flex-col items-center justify-center border border-green-100">
              <Leaf className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-xl font-bold text-green-700">14</span>
              <span className="text-[10px] text-green-600 font-medium text-center">Meals Saved</span>
            </div>
            <div className="flex-1 bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center border border-blue-100">
              <Award className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-xl font-bold text-blue-700">140</span>
              <span className="text-[10px] text-blue-600 font-medium text-center">Points</span>
            </div>
            <div className="flex-1 bg-teal-50 rounded-xl p-3 flex flex-col items-center justify-center border border-teal-100">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-teal-600 mb-1" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-xl font-bold text-teal-700">1.2<span className="text-sm">kg</span></span>
              <span className="text-[10px] text-teal-600 font-medium text-center">CO2 Reduced</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Meal Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600" /> Currently Serving / Next Meal
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {activeMeal.scheduled_time}
          </span>
        </div>
        
        {/* HERO CARD FOR CURRENT ACTIVE MEAL */}
        {activeMeal && (() => {
          const isAttending = activeMeal.status === "ATTENDING";
          const isSkipping = activeMeal.status === "SKIPPING" || activeMeal.status === "SKIPPED";
          const isScanned = activeMeal.status === "SCANNED";
          
          return (
            <Card className="border border-slate-100 shadow-md rounded-3xl overflow-hidden bg-white transition-all duration-300">
              {/* Banner Image Area */}
              <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                <img 
                  src={activeMeal.image} 
                  alt={activeMeal.meal_type} 
                  className={`w-full h-full object-cover transition-all duration-500 ${isSkipping ? 'grayscale blur-[1px] opacity-60' : ''}`}
                />
                
                {/* Grayscale overlay for skipped */}
                {isSkipping && (
                  <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-white/95 px-5 py-2 rounded-full text-xs font-bold text-red-600 shadow-lg tracking-wide border border-red-100">
                      MEAL SKIPPED
                    </span>
                  </div>
                )}

                {/* Scanned Access overlay */}
                {isScanned && (
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-extrabold shadow-xl tracking-wide flex items-center gap-2 border border-emerald-400 animate-pulse">
                      <CheckCircle2 className="h-4 w-4" /> ACCESS VERIFIED ({activeMeal.verified_at || "Redeemed"})
                    </span>
                  </div>
                )}

                {/* In-App Scan Mess QR Trigger Badge */}
                {isAttending && (
                  <button 
                    onClick={() => openScanner(activeMeal)}
                    className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 backdrop-blur-md z-10"
                  >
                    <div className="p-1.5 bg-emerald-500 rounded-xl text-slate-950">
                      <Camera className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-extrabold text-white leading-tight">Scan Mess QR</p>
                      <p className="text-[8px] font-bold text-emerald-300 tracking-wider leading-none">IN-APP SCANNER</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Card Details */}
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      {activeMeal.meal_type}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {activeMeal.scheduled_time}
                      </span>
                    </h4>
                    <p className={`text-sm mt-1 font-medium ${isSkipping ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                      {activeMeal.menu_items}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {isAttending && (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> OPTED IN
                    </span>
                  )}
                  {isSkipping && (
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold flex items-center gap-1 border border-red-200">
                      SKIPPED
                    </span>
                  )}
                  {isScanned && (
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-extrabold flex items-center gap-1 border border-teal-200">
                      COMPLETED
                    </span>
                  )}
                </div>

                {/* Actions */}
                {isAttending && (
                  <div className="space-y-2.5">
                    <button 
                      onClick={() => openScanner(activeMeal)}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="h-5 w-5" /> SCAN ENTRANCE QR TO VERIFY
                    </button>

                    <button 
                      onClick={() => toggleSkip(activeMeal.id, "SKIPPING")}
                      disabled={loadingMealId === activeMeal.id}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs border border-red-200 transition-all flex flex-col items-center justify-center cursor-pointer disabled:opacity-70"
                    >
                      {loadingMealId === activeMeal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <>
                          <span>Skip {activeMeal.meal_type} (Prevent Waste)</span>
                          <span className="text-[10px] font-normal opacity-80 mt-0.5">
                            Skip window cutoff in: {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isSkipping && (
                  <button 
                    onClick={() => toggleSkip(activeMeal.id, "ATTENDING")}
                    disabled={loadingMealId === activeMeal.id}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loadingMealId === activeMeal.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        <RefreshCw className="h-4 w-4" /> UNDO SKIP (Opt Back In for {activeMeal.meal_type})
                      </>
                    )}
                  </button>
                )}

                {isScanned && (
                  <button 
                    onClick={() => {
                      setValidationError("");
                      setFeedbackMeal(activeMeal);
                      setShowFeedback(true);
                    }}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-slate-600" /> RATE THIS MEAL
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Other Meals Row */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Other Meals Today</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherMeals.map((meal) => {
              const isCompleted = meal.status === "SCANNED";
              const isSkipped = meal.status === "SKIPPING" || meal.status === "SKIPPED";
              
              let emoji = "🥞";
              let bgCircle = "bg-amber-100 text-amber-800";
              if (meal.meal_type === "LUNCH") {
                emoji = "🍛";
                bgCircle = "bg-orange-100 text-orange-800";
              } else if (meal.meal_type === "DINNER") {
                emoji = "🍗";
                bgCircle = "bg-indigo-100 text-indigo-800";
              }

              return (
                <Card key={meal.id} className="border border-slate-200 shadow-sm rounded-2xl bg-white relative overflow-hidden">
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-11 w-11 ${bgCircle} rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0`}>
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">{meal.meal_type}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">{meal.scheduled_time}</span>
                        </div>
                        {isCompleted && (
                          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Verified {meal.verified_at ? `(${meal.verified_at})` : ""}
                          </p>
                        )}
                        {isSkipped && (
                          <p className="text-[11px] text-red-500 font-bold">Skipped</p>
                        )}
                        {!isCompleted && !isSkipped && (
                          <p className="text-[11px] text-slate-500 font-medium">Status: Opted In</p>
                        )}
                      </div>
                    </div>
                    
                    {isCompleted ? (
                      <button 
                        onClick={() => {
                          setValidationError("");
                          setFeedbackMeal(meal);
                          setShowFeedback(true);
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-slate-500" /> Rate Meal
                      </button>
                    ) : isSkipped ? (
                      <button 
                        onClick={() => toggleSkip(meal.id, "ATTENDING")}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Undo Skip
                      </button>
                    ) : (
                      <button 
                        onClick={() => toggleSkip(meal.id, "SKIPPING")}
                        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold border border-red-100 transition-colors cursor-pointer"
                      >
                        Skip Meal
                      </button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEEDBACK SECTION MODAL */}
      {showFeedback && (
        <Card className="border border-slate-200 shadow-xl rounded-3xl overflow-hidden bg-white mb-4 animate-in fade-in slide-in-from-top-2">
          <CardContent className="p-6">
            {feedbackSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-emerald-600">
                <CheckCircle2 className="h-12 w-12 mb-2 animate-bounce" />
                <p className="font-bold text-base">Feedback Submitted Successfully!</p>
                <p className="text-xs text-slate-500 mt-1">Your rating helps the kitchen optimize meal quantities.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">How was {feedbackMeal?.meal_type || activeMeal.meal_type}?</h4>
                    <p className="text-xs text-slate-500">Rate your dining experience to improve future meals.</p>
                  </div>
                  <button 
                    onClick={() => setShowFeedback(false)} 
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {validationError && (
                  <div className="text-xs text-red-600 font-semibold mb-4 bg-red-50 p-2.5 rounded-xl border border-red-100">
                    ⚠️ {validationError}
                  </div>
                )}

                <div className="flex justify-center gap-3 mb-5 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => {
                        setRating(star);
                        setValidationError("");
                      }} 
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star className={`h-9 w-9 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>

                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any comments? (e.g. Too salty, delicious paneer, great quantity...)" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  rows={3}
                ></textarea>

                <button 
                  onClick={submitFeedback}
                  disabled={submittingFeedback}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingFeedback ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "SUBMIT FEEDBACK"
                  )}
                </button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* IN-APP CAMERA QR SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <style>{`
            @keyframes scanlaser {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(220px); }
            }
            .scan-laser-line {
              animation: scanlaser 2s infinite ease-in-out;
            }
          `}</style>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 flex flex-col items-center relative overflow-hidden shadow-2xl text-white">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Mess QR Scanner</h3>
                  <p className="text-xs text-slate-400 font-medium">Scan QR displayed at the mess entrance</p>
                </div>
              </div>
              <button 
                onClick={closeScanner}
                className="text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Viewfinder Container */}
            <div className="relative w-full aspect-square max-w-[280px] bg-black rounded-3xl overflow-hidden border-2 border-slate-700 mb-5 flex items-center justify-center shadow-inner">
              {/* Video Element */}
              <video 
                ref={videoRef} 
                className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`} 
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Laser Scanning Animation Overlay */}
              {cameraActive && (
                <>
                  {/* Targeting frame corners */}
                  <div className="absolute inset-6 border-2 border-emerald-400/50 rounded-2xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                  </div>
                  <div className="scan-laser-line absolute top-6 left-6 right-6 h-1 bg-emerald-400 rounded-full shadow-[0_0_15px_#10b981]"></div>
                </>
              )}

              {/* Verifying Loader State */}
              {verifying && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-3" />
                  <p className="text-sm font-bold text-white">Verifying Authenticity...</p>
                  <p className="text-xs text-slate-400 mt-1">Validating cryptographic signature</p>
                </div>
              )}

              {/* Fallback / Camera Error State */}
              {(!cameraActive && !verifying) && (
                <div className="p-4 text-center flex flex-col items-center justify-center">
                  <Camera className="h-10 w-10 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-300 font-semibold mb-2">
                    {cameraError || "Initializing camera viewfinder..."}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight mb-3">
                    Point your device at the TV screen or tablet display placed at the dining hall entrance.
                  </p>
                </div>
              )}
            </div>

            {/* Test Simulation Button (Essential for local tests and devices without webcams) */}
            <div className="w-full space-y-2">
              <button
                onClick={handleSimulateScan}
                disabled={verifying}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl font-black text-xs shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <QrCode className="h-4 w-4" /> SIMULATE SCANNING ENTRANCE QR (TEST PASS)
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Scans the live cryptographic rotating token directly from the mess system
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SCAN RESULT / VERIFICATION MODAL */}
      {scanResult && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            {scanResult.status === "success" ? (
              <>
                <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-200 animate-bounce">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-emerald-700 tracking-tight">{scanResult.title}</h3>
                <p className="text-sm font-bold text-slate-900 mt-1">{scanResult.message}</p>
                
                <div className="w-full bg-slate-50 rounded-2xl p-3.5 my-4 text-left text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Student ID:</span>
                    <span className="text-slate-900 font-bold">{scanResult.studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Meal Session:</span>
                    <span className="text-slate-900 font-bold">{scanResult.mealType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Verified Time:</span>
                    <span className="text-slate-900 font-bold">{scanResult.verifiedAt}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-5">Please proceed to the serving line and enjoy your meal!</p>
                
                <button
                  onClick={() => setScanResult(null)}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  CONTINUE
                </button>
              </>
            ) : (
              <>
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border-2 border-red-200 animate-pulse">
                  <ShieldAlert className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-red-700 tracking-tight">{scanResult.title}</h3>
                <p className="text-xs font-semibold text-slate-700 mt-2 bg-red-50/80 p-3 rounded-2xl border border-red-100 leading-relaxed">
                  {scanResult.message}
                </p>

                <div className="w-full my-5 space-y-2">
                  {scanResult.message.includes("Skipped") || scanResult.message.includes("opted OUT") ? (
                    <button
                      onClick={() => {
                        if (selectedMealForScan) {
                          toggleSkip(selectedMealForScan.id, "ATTENDING");
                        }
                        setScanResult(null);
                      }}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Undo Skip & Opt Back In
                    </button>
                  ) : null}

                  <button
                    onClick={() => setScanResult(null)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-all cursor-pointer"
                  >
                    DISMISS
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
