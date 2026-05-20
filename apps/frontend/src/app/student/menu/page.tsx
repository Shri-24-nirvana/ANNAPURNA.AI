"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function MenuPage() {
  const [expandedDay, setExpandedDay] = useState("Monday");
  const [expandedMeal, setExpandedMeal] = useState("Lunch");

  return (
    <div className="bg-slate-50 min-h-full pb-6">
      
      {/* Top Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 pt-4 flex gap-6">
        <button className="pb-3 border-b-2 border-slate-900 text-sm font-bold text-slate-900">Weekly Menu</button>
        <button className="pb-3 text-sm font-medium text-slate-500 hover:text-slate-900">Monthly Menu</button>
      </div>

      <div className="p-6">
        <h2 className="text-sm font-bold text-slate-900 text-center mb-6">Oct 25 - Oct 31, 2026</h2>

        <div className="space-y-4">
          
          {/* MONDAY */}
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
             <div 
               className="p-4 flex justify-between items-center cursor-pointer bg-slate-50"
               onClick={() => setExpandedDay(expandedDay === "Monday" ? "" : "Monday")}
             >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">MONDAY</h3>
                  <p className="text-xs text-slate-500">Oct 26</p>
                </div>
                {expandedDay === "Monday" ? <ChevronUp className="h-5 w-5 text-slate-400"/> : <ChevronDown className="h-5 w-5 text-slate-400"/>}
             </div>
             
             {expandedDay === "Monday" && (
                <div className="p-4 pt-0">
                   {/* Lunch Section */}
                   <div className="mt-4">
                      <div 
                        className="flex justify-between items-center cursor-pointer mb-2"
                        onClick={() => setExpandedMeal(expandedMeal === "Lunch" ? "" : "Lunch")}
                      >
                         <h4 className="font-bold text-slate-900 text-sm">LUNCH</h4>
                         {expandedMeal === "Lunch" ? <ChevronUp className="h-4 w-4 text-slate-400"/> : <ChevronDown className="h-4 w-4 text-slate-400"/>}
                      </div>
                      
                      {expandedMeal === "Lunch" && (
                         <div className="space-y-3">
                           {/* Food Image Placeholder */}
                            <div className="h-32 w-full bg-[#fcecd2] rounded-xl relative flex items-center justify-center overflow-hidden border border-slate-100">
                               <div className="absolute w-24 h-24 bg-orange-300 rounded-full right-4 opacity-80"></div>
                               <div className="absolute w-16 h-16 bg-white rounded-full right-8"></div>
                               <div className="absolute w-20 h-20 bg-yellow-400 rounded-md left-8 rotate-12"></div>
                            </div>
                            
                            <div className="flex gap-4">
                               <div className="flex-1">
                                 <p className="text-xs font-semibold text-slate-800 mb-1">Dish 1: <span className="font-normal text-slate-600">Paneer Tikka Masala</span></p>
                                 <p className="text-xs font-semibold text-slate-800 mb-1">Dish 2: <span className="font-normal text-slate-600">Jeera Rice</span></p>
                                 <p className="text-xs font-semibold text-slate-800 mb-1">Dish 3: <span className="font-normal text-slate-600">Dal Tadka</span></p>
                                 <p className="text-xs font-semibold text-slate-800 mb-1">Dish 4: <span className="font-normal text-slate-600">Butter Naan</span></p>
                               </div>
                               
                               <div className="w-[120px] bg-slate-50 rounded-lg p-2 border border-slate-100">
                                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">AI Nutritional Data</p>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-slate-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> CALORIES:</span>
                                      <span className="text-[10px] font-bold">450</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-slate-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> PROTEIN:</span>
                                      <span className="text-[10px] font-bold">22g</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-slate-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> FATS:</span>
                                      <span className="text-[10px] font-bold">15g</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-slate-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> CARBS:</span>
                                      <span className="text-[10px] font-bold">55g</span>
                                    </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             )}
          </Card>

          {/* TUESDAY */}
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
             <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpandedDay(expandedDay === "Tuesday" ? "" : "Tuesday")}>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">TUESDAY</h3>
                  <p className="text-xs text-slate-500">Oct 27</p>
                </div>
                {expandedDay === "Tuesday" ? <ChevronUp className="h-5 w-5 text-slate-400"/> : <ChevronDown className="h-5 w-5 text-slate-400"/>}
             </div>
          </Card>

          {/* WEDNESDAY */}
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
             <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpandedDay(expandedDay === "Wednesday" ? "" : "Wednesday")}>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">WEDNESDAY</h3>
                  <p className="text-xs text-slate-500">Oct 28</p>
                </div>
                {expandedDay === "Wednesday" ? <ChevronUp className="h-5 w-5 text-slate-400"/> : <ChevronDown className="h-5 w-5 text-slate-400"/>}
             </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
