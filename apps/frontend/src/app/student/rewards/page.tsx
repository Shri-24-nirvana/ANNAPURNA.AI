"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Handshake, Lightbulb, Trophy } from "lucide-react";

const tierData = [
  { val: 10 }, { val: 20 }, { val: 15 }, { val: 35 }, { val: 40 }, { val: 30 }, { val: 60 }, { val: 80 }
];

export default function RewardsPage() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Your Impact & Rewards</h2>
      
      {/* Impact Summary */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-slate-900 text-white relative">
        <div className="absolute top-2 right-2 text-yellow-300 opacity-80 text-2xl">✨</div>
        <div className="absolute bottom-2 left-1/2 text-yellow-300 opacity-80 text-xl">✨</div>
        <CardContent className="p-5 flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-sm font-semibold mb-2">Impact Summary</h3>
            <p className="text-xs text-slate-300">1.2kg CO2 Reduced |</p>
            <p className="text-xs text-slate-300">14 Meals Saved |</p>
            <p className="text-xs text-slate-300">140 Impact Points</p>
          </div>
          {/* Grocery Bag Illustration Mock */}
          <div className="w-16 h-16 bg-orange-300/20 rounded-lg flex items-center justify-center relative">
             <div className="absolute inset-x-2 bottom-0 h-10 bg-orange-200 rounded-b-md"></div>
             <div className="absolute top-2 left-3 w-3 h-8 bg-green-500 rounded-full rotate-12"></div>
             <div className="absolute top-3 right-3 w-3 h-6 bg-red-400 rounded-full -rotate-12"></div>
             <div className="absolute bottom-2 font-bold text-green-700 text-xs text-center w-full">♻️</div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-4">ACHIEVEMENT BADGES</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          
          <div className="flex flex-col items-center w-28 shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-300 p-1 mb-2 relative shadow-sm">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-green-100">
                 <Handshake className="h-8 w-8 text-green-600" />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-200">Earned</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 text-center">Sincere Scrapper</h4>
            <p className="text-[9px] text-slate-500 text-center mt-1">Earned for consistent 'Skip' inputs</p>
          </div>

          <div className="flex flex-col items-center w-28 shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300 p-1 mb-2 relative shadow-sm">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-yellow-100">
                 <Lightbulb className="h-8 w-8 text-yellow-500" />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-200">Earned</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 text-center">Forecasting Friend</h4>
            <p className="text-[9px] text-slate-500 text-center mt-1">Earned for providing regular meal feedback</p>
          </div>
          
           <div className="flex flex-col items-center w-28 shrink-0 opacity-50 grayscale">
            <div className="w-20 h-20 rounded-full bg-slate-200 p-1 mb-2 relative shadow-sm">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                 <Trophy className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-900 text-center">Waste Warrior</h4>
            <p className="text-[9px] text-slate-500 text-center mt-1">Save 50 meals</p>
          </div>

        </div>
      </div>

      {/* Tier Progress */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-2">TIER PROGRESS</h3>
        <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-0">
             <div className="h-24 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tierData}>
                    <defs>
                      <linearGradient id="colorTier" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTier)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-between px-4 pb-4 mt-2">
                <span className="text-[10px] font-bold text-slate-400">SILVER TIER</span>
                <span className="text-[10px] font-bold text-yellow-600">GOLD TIER</span>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="border-0 shadow-sm rounded-2xl bg-slate-100 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900">Top 10 Leaderboard</h3>
            <span className="text-xs font-bold text-slate-900">Rank #4</span>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px]">A</div>
                  <span className="font-medium text-slate-700">Anonymous</span>
                </div>
                <span className="font-bold text-slate-900">#1</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px]">S</div>
                  <span className="font-medium text-slate-700">Sarah M.</span>
                </div>
                <span className="font-bold text-slate-900">#2</span>
             </div>
             <div className="flex items-center justify-between text-sm bg-white p-2 rounded-lg shadow-sm -mx-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">Al</div>
                  <span className="font-bold text-slate-900">Alex J. (You)</span>
                </div>
                <span className="font-bold text-slate-900">#4</span>
             </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
