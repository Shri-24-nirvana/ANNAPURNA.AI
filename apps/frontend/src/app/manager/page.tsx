"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Calendar, ChevronRight, CheckCircle2, CloudRain, TreePine } from "lucide-react";

const attendanceData = [
  { time: "1:00 PM", count: 0 },
  { time: "1:30 PM", count: 120 },
  { time: "2:00 PM", count: 280 },
  { time: "2:30 PM", count: 420 },
  { time: "3:00 PM", count: 490 },
  { time: "4:00 PM", count: 580 },
  { time: "5:00 PM", count: 650 },
  { time: "9:00 PM", count: 692 },
];

export default function ManagerDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">COMMAND CENTER</h2>
          <p className="text-muted-foreground text-sm">Tuesday, October 26, 2026</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium shadow-sm cursor-pointer hover:bg-slate-50">
          <Calendar className="h-4 w-4 text-slate-500" />
          Tuesday, October 26
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Real-time Meal Status */}
        <Card className="col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-semibold">Real-time Meal Status - LUNCH</CardTitle>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1 border border-green-200">
               <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
               ATTENDING
            </span>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-around items-center text-center">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Predicted</p>
                <p className="text-5xl font-bold text-slate-800">785</p>
              </div>
              <div className="relative">
                {/* Simulated donut chart */}
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351" strokeDashoffset="42" className="text-slate-800" />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pt-1">
                   <p className="text-[10px] text-slate-500 font-medium leading-none mb-1">Currently Attending</p>
                   <p className="text-3xl font-bold text-slate-800 leading-none">692</p>
                   <p className="text-[10px] text-slate-500 mt-1">(88%)</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Confirmed Skipping</p>
                <div className="w-24 h-24 mx-auto rounded-full border-8 border-slate-100 flex items-center justify-center">
                  <p className="text-3xl font-bold text-slate-400">93</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wastage Risk */}
        <Card className="shadow-sm border-slate-200">
           <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-semibold">Wastage Risk Level: <span className="text-green-600">LOW</span></CardTitle>
            <span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Top At-Risk Ingredients</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-slate-600">Tomatoes</span><span className="font-medium text-slate-900">12kg</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Chicken Seeds</span><span className="font-medium text-slate-900">12kg</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Chicken</span><span className="font-medium text-slate-900">8kg</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-600">Potatoes</span><span className="font-medium text-slate-900">5kg</span></div>
              </div>
            </div>
            
            <div className="bg-[#1e293b] text-white rounded-lg p-4 shadow-inner">
              <p className="text-xs font-semibold text-blue-300 mb-1">AI Procurement Suggestion</p>
              <p className="text-sm font-bold mb-1">LUNCH TOMORROW: <span className="font-normal text-slate-300">Expected 810.</span></p>
              <p className="text-xs text-slate-300 leading-relaxed">Order 15kg Chicken (Est. 3 hrs prep time).</p>
            </div>
          </CardContent>
        </Card>

        {/* Live Attendance Flow */}
        <Card className="col-span-2 shadow-sm border-slate-200">
           <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-base font-semibold">Live Attendance Flow (LUNCH)</CardTitle>
            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1 border border-green-200">
               <CheckCircle2 className="h-3 w-3" /> ATTENDING
            </span>
          </CardHeader>
          <CardContent className="pt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ESG Sustainability Metrics */}
        <Card className="shadow-sm border-slate-200">
           <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-semibold">ESG Sustainability Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <CloudRain className="h-12 w-12 text-slate-700 p-2 bg-slate-100 rounded-full" />
              <div>
                <p className="text-sm text-slate-500 font-medium">Waste Averted Today:</p>
                <p className="text-3xl font-bold text-slate-900">35kg</p>
              </div>
            </div>
             <div className="flex items-center gap-4">
              <TreePine className="h-12 w-12 text-green-600 p-2 bg-green-50 rounded-full" />
              <div>
                <p className="text-sm text-slate-500 font-medium">CO2 Reduction:</p>
                <p className="text-3xl font-bold text-slate-900">140kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
