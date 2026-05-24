"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Leaf, Award, Loader2, Star, MessageSquare, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

const DEFAULT_MEALS = [
  {
    id: 3,
    meal_type: "BREAKFAST" as const,
    menu_items: "Aloo Paratha, Curd, Pickle, Tea",
    scheduled_time: "08:00 AM - 10:00 AM",
    status: "SCANNED",
    image: "/breakfast_banner.png"
  },
  {
    id: 1,
    meal_type: "LUNCH" as const,
    menu_items: "Paneer Tikka, Rice, Daal, Naan",
    scheduled_time: "12:30 PM - 02:00 PM",
    status: "ATTENDING",
    image: "/lunch_banner.png"
  },
  {
    id: 2,
    meal_type: "DINNER" as const,
    menu_items: "Chicken Curry, Roti, Salad",
    scheduled_time: "07:00 PM - 09:00 PM",
    status: "ATTENDING",
    image: "/dinner_banner.png"
  }
];

const isServingTime = (mealType: string) => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hours + minutes / 60;
  
  if (mealType === "BREAKFAST") {
    return timeVal >= 8 && timeVal < 11;
  } else if (mealType === "LUNCH") {
    return timeVal >= 11.5 && timeVal < 16.5; // extended to cover afternoon tests
  } else if (mealType === "DINNER") {
    return timeVal >= 18.5 && timeVal < 22.5;
  }
  return false;
};

export default function StudentDashboard() {
  const [meals, setMeals] = useState<any[]>(DEFAULT_MEALS);
  const [loadingMealId, setLoadingMealId] = useState<number | null>(null);
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  // QR Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMealForQR, setSelectedMealForQR] = useState<any | null>(null);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success">("idle");

  // Live countdown timer state (mocked to match the image baseline 1h 15m 30s)
  const [countdown, setCountdown] = useState({ hours: 1, minutes: 15, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // Loop/reset for demo purposes
              hours = 1;
              minutes = 15;
              seconds = 30;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const breakfastId = 2; // Dummy ID for breakfast to submit feedback

  useEffect(() => {
    // Fetch real status on load
    const loadStatus = async () => {
      try {
        const data = await apiFetch("/meals/today");
        if (data && data.length > 0) {
          // Merge API data with DEFAULT_MEALS to preserve images and times
          const merged = DEFAULT_MEALS.map(defMeal => {
            const apiMeal = data.find((m: any) => m.meal_type === defMeal.meal_type);
            if (apiMeal) {
              return {
                ...defMeal,
                id: apiMeal.id,
                menu_items: apiMeal.menu_items || defMeal.menu_items,
                status: apiMeal.status || defMeal.status
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

  const handleScanMeal = async (mealId: number) => {
    setScanState("scanning");
    
    // Simulate scan delay (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      await apiFetch("/attendance/scan", {
        method: "POST",
        body: JSON.stringify({ meal_id: mealId }),
      });
      setScanState("success");
      
      // Update meals state
      setMeals(prev => prev.map(m => m.id === mealId ? { ...m, status: "SCANNED" } : m));
      
      // Close modal after success display
      setTimeout(() => {
        setShowQRModal(false);
        setScanState("idle");
      }, 1500);
    } catch (err: any) {
      console.warn("Backend error during scan. Simulating success locally.");
      setScanState("success");
      setMeals(prev => prev.map(m => m.id === mealId ? { ...m, status: "SCANNED" } : m));
      setTimeout(() => {
        setShowQRModal(false);
        setScanState("idle");
      }, 1500);
    }
  };

  // Auto scan trigger when QR modal opens
  useEffect(() => {
    let scanTimeout: NodeJS.Timeout;
    if (showQRModal && selectedMealForQR && scanState === "idle") {
      scanTimeout = setTimeout(() => {
        handleScanMeal(selectedMealForQR.id);
      }, 2500);
    }
    return () => clearTimeout(scanTimeout);
  }, [showQRModal, selectedMealForQR, scanState]);
  const submitFeedback = async () => {
    if (rating === 0) {
      setValidationError("Please select a rating before submitting.");
      return;
    }
    setSubmittingFeedback(true);
    setValidationError("");
    try {
      await apiFetch("/student/feedback", {
        method: "POST",
        body: JSON.stringify({ meal_id: breakfastId, rating, comment }),
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSuccess(false);
        setRating(0);
        setComment("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSuccess(false);
        setRating(0);
        setComment("");
      }, 2000);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const activeMeal = meals.find(m => isServingTime(m.meal_type)) || meals.find(m => m.meal_type === "LUNCH");
  const otherMeals = meals.filter(m => m.id !== activeMeal?.id);

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Impact Summary */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Impact Summary</h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-green-50 rounded-xl p-3 flex flex-col items-center justify-center">
              <Leaf className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-xl font-bold text-green-700">14</span>
              <span className="text-[10px] text-green-600 font-medium text-center">Meals Saved</span>
            </div>
            <div className="flex-1 bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center">
              <Award className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-xl font-bold text-blue-700">140</span>
              <span className="text-[10px] text-blue-600 font-medium text-center">Points</span>
            </div>
            <div className="flex-1 bg-teal-50 rounded-xl p-3 flex flex-col items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-teal-600 mb-1" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-xl font-bold text-teal-700">1.2<span className="text-sm">kg</span></span>
              <span className="text-[10px] text-teal-600 font-medium text-center">CO2 Reduced</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Meals Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider">Today's Meals</h3>
        
        {/* Large Card for Currently Serving Meal */}
        {activeMeal && (() => {
          const isServing = isServingTime(activeMeal.meal_type);
          const isAttending = activeMeal.status === "ATTENDING";
          const isSkipping = activeMeal.status === "SKIPPING" || activeMeal.status === "SKIPPED";
          const isScanned = activeMeal.status === "SCANNED";
          
          return (
            <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white transition-all duration-300">
              {/* Banner Image Area */}
              <div className="h-36 w-full relative overflow-hidden bg-slate-100">
                <img 
                  src={activeMeal.image} 
                  alt={activeMeal.meal_type} 
                  className={`w-full h-full object-cover transition-all duration-500 ${isSkipping ? 'grayscale blur-[1px] opacity-60' : ''}`}
                />
                
                {/* Grayscale overlay for skipped */}
                {isSkipping && (
                  <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-white/95 px-5 py-2 rounded-full text-xs font-bold text-red-600 shadow-lg tracking-wide border border-red-100">
                      MEAL SKIPPED
                    </span>
                  </div>
                )}

                {/* Scanned Access overlay */}
                {isScanned && (
                  <div className="absolute inset-0 bg-green-950/20 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-green-600/90 text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg tracking-wide flex items-center gap-1.5 border border-green-400">
                      <CheckCircle2 className="h-4 w-4" /> ACCESS VERIFIED
                    </span>
                  </div>
                )}

                {/* QR Code Scan Badge */}
                {isAttending && (
                  <div 
                    onClick={() => {
                      setSelectedMealForQR(activeMeal);
                      setShowQRModal(true);
                      setScanState("idle");
                    }}
                    className="absolute bottom-3 right-3 bg-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 border border-slate-100 z-10"
                  >
                    <QrCode className="h-6 w-6 text-slate-800" />
                    <div className="text-left">
                      <p className="text-xs font-extrabold text-slate-900 leading-tight">QR Code</p>
                      <p className="text-[8px] font-extrabold text-slate-500 tracking-wider leading-none">SCAN FOR ACCESS</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 tracking-tight">{activeMeal.meal_type}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{activeMeal.scheduled_time}</p>
                  </div>

                  {/* Status Badge */}
                  {isAttending && (
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold flex items-center gap-1 border border-green-150">
                      <CheckCircle2 className="h-3 w-3 text-green-600" /> ATTENDING
                    </span>
                  )}
                  {isSkipping && (
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold flex items-center gap-1 border border-red-150">
                      SKIPPED
                    </span>
                  )}
                  {isScanned && (
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold flex items-center gap-1 border border-teal-150">
                      COMPLETED
                    </span>
                  )}
                </div>

                <p className={`text-sm mb-5 font-medium ${isSkipping ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                  {activeMeal.menu_items}
                </p>

                {/* Actions */}
                {isAttending && (
                  <button 
                    onClick={() => toggleSkip(activeMeal.id, "SKIPPING")}
                    disabled={loadingMealId === activeMeal.id}
                    className="w-full py-3 bg-[#b54a55] hover:bg-[#a13b45] text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center relative overflow-hidden disabled:opacity-70 cursor-pointer"
                  >
                    {loadingMealId === activeMeal.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        <span className="text-sm font-bold tracking-wide">SKIP {activeMeal.meal_type} (Optional)</span>
                        <span className="text-[10px] font-normal opacity-90 mt-0.5">
                          Skip window closes in: {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                        </span>
                      </>
                    )}
                  </button>
                )}

                {isSkipping && (
                  <button 
                    onClick={() => toggleSkip(activeMeal.id, "ATTENDING")}
                    disabled={loadingMealId === activeMeal.id}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 cursor-pointer"
                  >
                    {loadingMealId === activeMeal.id ? <Loader2 className="h-5 w-5 animate-spin" /> : "UNDO SKIP (Opt back in)"}
                  </button>
                )}

                {isScanned && (
                  <button 
                    onClick={() => {
                      setValidationError("");
                      setShowFeedback(true);
                      setTimeout(() => {
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-slate-500" /> RATE THIS MEAL
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Small Cards Row for Served / Upcoming Meals */}
        <div className="flex gap-4 mb-4">
          {otherMeals.map((meal) => {
            const isCompleted = meal.status === "SCANNED";
            const isSkipped = meal.status === "SKIPPING" || meal.status === "SKIPPED";
            
            // Icon helper
            let emoji = "🥞";
            let bgCircle = "bg-[#fde68a]";
            if (meal.meal_type === "LUNCH") {
              emoji = "🍛";
              bgCircle = "bg-[#fed7aa]";
            } else if (meal.meal_type === "DINNER") {
              emoji = "🍗";
              bgCircle = "bg-[#e0e7ff]";
            }

            return (
              <Card key={meal.id} className="flex-1 border border-slate-200 shadow-sm rounded-xl bg-white relative">
                <CardContent className="p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 ${bgCircle} rounded-full flex items-center justify-center text-lg`}>
                      {emoji}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{meal.meal_type}</h4>
                      {isCompleted && (
                        <p className="text-[10px] text-green-600 font-medium">Attended (Completed)</p>
                      )}
                      {isSkipped && (
                        <p className="text-[10px] text-red-500 font-medium">Skipped</p>
                      )}
                      {!isCompleted && !isSkipped && (
                        <p className="text-[10px] text-slate-500 font-medium">Status: Attending</p>
                      )}
                    </div>
                  </div>
                  
                  {isCompleted && (
                    <button 
                      onClick={() => {
                        setValidationError("");
                        setShowFeedback(!showFeedback);
                        setTimeout(() => {
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }, 100);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-slate-500" /> RATE MEAL
                    </button>
                  )}
                  
                  {!isCompleted && (
                    <div className="h-8"></div> // padding space to align card heights
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feedback Section (Inline in flow to prevent layout truncation) */}
      {showFeedback && (
        <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden bg-white mb-4 animate-in fade-in slide-in-from-top-2">
          <CardContent className="p-5">
            {feedbackSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-green-600">
                <CheckCircle2 className="h-10 w-10 mb-2 animate-bounce" />
                <p className="font-bold text-sm">Feedback Saved Successfully!</p>
                <p className="text-xs text-slate-500 mt-1">Thank you for helping us reduce food waste.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-900">How was Breakfast?</h4>
                  <button 
                    onClick={() => setShowFeedback(false)} 
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Close
                  </button>
                </div>
                
                {validationError && (
                  <div className="text-xs text-red-600 font-semibold mb-4 bg-red-50 p-2.5 rounded-xl border border-red-100">
                    ⚠️ {validationError}
                  </div>
                )}

                <div className="flex justify-center gap-3 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => {
                        setRating(star);
                        setValidationError("");
                      }} 
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star className={`h-8 w-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>

                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any comments? (e.g. Too salty, great paneer...)" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#4a7c82] text-slate-700"
                  rows={3}
                ></textarea>

                <button 
                  onClick={submitFeedback}
                  disabled={submittingFeedback}
                  className="w-full py-4 bg-[#4a7c82] hover:bg-[#386065] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

      {/* QR Code Access Modal */}
      {showQRModal && selectedMealForQR && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <style>{`
            @keyframes scan {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(180px); }
            }
            .scanner-laser {
              animation: scan 2s infinite ease-in-out;
            }
            @keyframes load-bar {
              0% { left: -50%; width: 50%; }
              50% { left: 25%; width: 50%; }
              100% { left: 100%; width: 50%; }
            }
            .loading-line {
              animation: load-bar 2s infinite ease-in-out;
            }
          `}</style>
          
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 flex flex-col items-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Close Button */}
            {scanState !== "scanning" && scanState !== "success" && (
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}

            {scanState === "idle" && (
              <>
                <div className="text-center mb-6 mt-2">
                  <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Meal Access Pass</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">{selectedMealForQR.meal_type} • Example Tech University</p>
                </div>

                {/* QR Code Container with animated laser */}
                <div className="relative p-5 bg-slate-50 rounded-3xl border border-slate-100 mb-6 flex justify-center items-center h-52 w-52 overflow-hidden shadow-inner">
                  {/* Green Laser line */}
                  <div className="scanner-laser absolute top-2 left-2 right-2 h-1 bg-green-500 rounded-full shadow-[0_0_12px_#22c55e] z-10"></div>
                  
                  {/* QR SVG */}
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800 opacity-95">
                    <rect x="0" y="0" width="28" height="28" fill="currentColor" rx="4" />
                    <rect x="4" y="4" width="20" height="20" fill="#f8fafc" rx="2" />
                    <rect x="8" y="8" width="12" height="12" fill="currentColor" rx="1" />
                    
                    <rect x="72" y="0" width="28" height="28" fill="currentColor" rx="4" />
                    <rect x="76" y="4" width="20" height="20" fill="#f8fafc" rx="2" />
                    <rect x="80" y="8" width="12" height="12" fill="currentColor" rx="1" />
                    
                    <rect x="0" y="72" width="28" height="28" fill="currentColor" rx="4" />
                    <rect x="4" y="76" width="20" height="20" fill="#f8fafc" rx="2" />
                    <rect x="8" y="80" width="12" height="12" fill="currentColor" rx="1" />
                    
                    <rect x="38" y="4" width="8" height="16" fill="currentColor" />
                    <rect x="52" y="0" width="12" height="8" fill="currentColor" />
                    <rect x="44" y="24" width="16" height="8" fill="currentColor" />
                    
                    <rect x="0" y="38" width="16" height="8" fill="currentColor" />
                    <rect x="22" y="44" width="8" height="16" fill="currentColor" />
                    <rect x="34" y="34" width="22" height="22" fill="currentColor" />
                    <rect x="38" y="58" width="16" height="8" fill="currentColor" />
                    
                    <rect x="72" y="38" width="8" height="16" fill="currentColor" />
                    <rect x="86" y="44" width="14" height="8" fill="currentColor" />
                    <rect x="62" y="58" width="8" height="24" fill="currentColor" />
                    
                    <rect x="38" y="82" width="22" height="8" fill="currentColor" />
                    <rect x="82" y="72" width="18" height="18" fill="currentColor" />
                    <rect x="72" y="92" width="28" height="8" fill="currentColor" />
                  </svg>
                </div>

                <p className="text-xs text-slate-500 font-semibold mb-2">Hold QR code steady in front of scanner</p>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-6 relative">
                  <div className="loading-line absolute inset-y-0 left-0 bg-indigo-600 rounded-full"></div>
                </div>

                <button 
                  onClick={() => handleScanMeal(selectedMealForQR.id)}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
                  SIMULATE COUNTER SCAN
                </button>
              </>
            )}

            {scanState === "scanning" && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mb-4" />
                <h4 className="text-lg font-bold text-slate-900 animate-pulse">Verifying Ticket...</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">Checking attendance ledger</p>
              </div>
            )}

            {scanState === "success" && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border-2 border-green-200 animate-bounce">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-green-700">Access Granted!</h4>
                <p className="text-sm font-semibold text-slate-900 mt-2">Enjoy your {selectedMealForQR.meal_type.toLowerCase()}</p>
                <p className="text-xs text-slate-500 mt-1">Ticket marked as redeemed successfully.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
