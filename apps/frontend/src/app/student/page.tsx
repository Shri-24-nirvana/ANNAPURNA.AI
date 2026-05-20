"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Leaf, Award } from "lucide-react";
import { useState } from "react";

export default function StudentDashboard() {
  const [lunchStatus, setLunchStatus] = useState<"ATTENDING" | "SKIPPING">("ATTENDING");

  return (
    <div className="p-6 space-y-6">
      
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
        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white mb-4">
          {/* Food Image Placeholder */}
          <div className="h-32 w-full bg-[#fcecd2] relative flex items-center justify-center overflow-hidden">
             {/* Simple shapes to mimic food illustration */}
             <div className="absolute w-24 h-24 bg-orange-300 rounded-full right-4 opacity-80"></div>
             <div className="absolute w-16 h-16 bg-white rounded-full right-8"></div>
             <div className="absolute w-20 h-20 bg-yellow-400 rounded-md left-8 rotate-12"></div>
             <div className="absolute w-10 h-10 bg-green-500 rounded-full top-4 left-20"></div>
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
            <p className="text-sm text-slate-600 mb-5">Paneer Tikka, Rice, Daal, Naan</p>
            
            {lunchStatus === "ATTENDING" ? (
              <button 
                onClick={() => setLunchStatus("SKIPPING")}
                className="w-full py-4 bg-[#b54a55] hover:bg-red-800 text-white rounded-xl font-semibold shadow-md transition-all flex flex-col items-center justify-center relative overflow-hidden"
              >
                <span>SKIP LUNCH (Optional)</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">Skip window closes in: 1h 15m 30s</span>
              </button>
            ) : (
              <button 
                onClick={() => setLunchStatus("ATTENDING")}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-all"
              >
                UNDO SKIP (Opt back in)
              </button>
            )}
          </CardContent>
        </Card>

        {/* Other meals row */}
        <div className="flex gap-4">
          <Card className="flex-1 border-0 shadow-sm rounded-xl overflow-hidden bg-white opacity-60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">BREAKFAST</h4>
                <p className="text-[10px] text-slate-500">Status: Attended</p>
              </div>
            </CardContent>
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
