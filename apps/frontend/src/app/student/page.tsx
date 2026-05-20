"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Leaf, Award, Loader2, Star, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function StudentDashboard() {
  const [lunchStatus, setLunchStatus] = useState<"ATTENDING" | "SKIPPING">("ATTENDING");
  const [loading, setLoading] = useState(false);
  
  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // For MVP integration, we assume the first lunch meal has id = 1
  const mealId = 1;
  const breakfastId = 2; // Dummy ID for breakfast to submit feedback

  useEffect(() => {
    // Fetch real status on load
    const loadStatus = async () => {
      try {
        const data = await apiFetch("/meals/today");
        if (data && data.length > 0) {
          const lunch = data.find((m: any) => m.meal_type === "LUNCH" || m.id === mealId);
          if (lunch && lunch.status) {
            setLunchStatus(lunch.status as "ATTENDING" | "SKIPPING");
          }
        }
      } catch (err: any) {
        console.warn("Backend unavailable, using default local state.");
      }
    };
    loadStatus();
  }, []);

  const toggleSkip = async (newStatus: "ATTENDING" | "SKIPPING") => {
    setLoading(true);
    try {
      await apiFetch("/attendance/skip", {
        method: "POST",
        body: JSON.stringify({ meal_id: mealId, status: newStatus }),
      });
      setLunchStatus(newStatus);
    } catch (err: any) {
      console.warn("Backend unavailable. Toggling local state for demo purposes.");
      setLunchStatus(newStatus);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (rating === 0) return;
    setSubmittingFeedback(true);
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
      // Mock success for demo if backend is offline
      setFeedbackSuccess(true);
      setTimeout(() => setShowFeedback(false), 2000);
    } finally {
      setSubmittingFeedback(false);
    }
  };

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

      {/* Today's Meals */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Today's Meals</h3>
        
        {/* Lunch Card */}
        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white mb-4 transition-all duration-300">
          <div className={`h-32 w-full relative flex items-center justify-center overflow-hidden transition-colors ${lunchStatus === 'SKIPPING' ? 'bg-slate-100 grayscale' : 'bg-[#fcecd2]'}`}>
             <div className="absolute w-24 h-24 bg-orange-300 rounded-full right-4 opacity-80"></div>
             <div className="absolute w-16 h-16 bg-white rounded-full right-8"></div>
             <div className="absolute w-20 h-20 bg-yellow-400 rounded-md left-8 rotate-12"></div>
             <div className="absolute w-10 h-10 bg-green-500 rounded-full top-4 left-20"></div>
             
             {lunchStatus === 'SKIPPING' && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-white/90 px-4 py-1.5 rounded-full text-sm font-bold text-slate-500 shadow-sm">MEAL SKIPPED</span>
                </div>
             )}
          </div>
          
          <CardContent className="p-5 relative">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-lg font-bold text-slate-900">LUNCH</h4>
                <p className="text-xs text-slate-500 font-medium">12:30 PM - 2:00 PM</p>
              </div>
              {lunchStatus === "ATTENDING" ? (
                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 border border-green-200">
                  <CheckCircle2 className="h-3 w-3" /> ATTENDING
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center gap-1 border border-slate-200">
                  SKIPPING
                </span>
              )}
            </div>
            <p className={`text-sm mb-5 ${lunchStatus === 'SKIPPING' ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
              Paneer Tikka, Rice, Daal, Naan
            </p>
            
            {lunchStatus === "ATTENDING" ? (
              <button 
                onClick={() => toggleSkip("SKIPPING")}
                disabled={loading}
                className="w-full py-4 bg-[#b54a55] hover:bg-red-800 text-white rounded-xl font-semibold shadow-md transition-all flex flex-col items-center justify-center relative overflow-hidden disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <span>SKIP LUNCH (Optional)</span>
                    <span className="text-[10px] font-normal opacity-80 mt-0.5">Skip window closes in: 1h 15m 30s</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={() => toggleSkip("ATTENDING")}
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "UNDO SKIP (Opt back in)"}
              </button>
            )}
          </CardContent>
        </Card>

        {/* Other meals row */}
        <div className="flex gap-4">
          <Card className="flex-1 border border-slate-200 shadow-sm rounded-xl bg-white relative overflow-visible">
            <CardContent className="p-4 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-[#fde68a] rounded-full flex items-center justify-center">🥞</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">BREAKFAST</h4>
                  <p className="text-[10px] text-green-600 font-medium">Attended (Completed)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFeedback(!showFeedback)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="h-3.5 w-3.5" /> RATE MEAL
              </button>
            </CardContent>
            
            {/* Feedback Dropdown Panel */}
            {showFeedback && (
              <div className="absolute top-[105%] left-0 w-[calc(200%+16px)] z-10 bg-white border border-slate-200 shadow-xl rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                {feedbackSuccess ? (
                  <div className="flex flex-col items-center justify-center py-4 text-green-600">
                    <CheckCircle2 className="h-8 w-8 mb-2" />
                    <p className="font-bold text-sm">Feedback Saved!</p>
                  </div>
                ) : (
                  <>
                    <h4 className="text-sm font-bold text-slate-900 mb-3">How was Breakfast?</h4>
                    <div className="flex justify-between mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                          <Star className={`h-8 w-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Any comments? (e.g. Too salty, great paneer...)" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#4a7c82]"
                      rows={2}
                    ></textarea>
                    <button 
                      onClick={submitFeedback}
                      disabled={rating === 0 || submittingFeedback}
                      className="w-full py-3 bg-[#4a7c82] hover:bg-[#386065] text-white rounded-lg font-bold text-sm disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      {submittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : "SUBMIT FEEDBACK"}
                    </button>
                  </>
                )}
              </div>
            )}
          </Card>
          
          <Card className="flex-1 border-0 shadow-sm rounded-xl overflow-hidden bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-full bg-slate-300"></div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">DINNER</h4>
                <p className="text-[10px] text-green-600 font-medium">Status: Attending</p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
