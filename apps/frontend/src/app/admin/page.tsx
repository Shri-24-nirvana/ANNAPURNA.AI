"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { CheckCircle2, Globe2 } from "lucide-react";

const healthData = [
  { time: "1:00 PM", val: 50 },
  { time: "2:00 PM", val: 120 },
  { time: "3:00 PM", val: 80 },
  { time: "4:00 PM", val: 150 },
  { time: "7:00 PM", val: 600 },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">SUPER ADMIN COMMAND CENTER</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Key Global Metrics & Map Container */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200 overflow-hidden">
          <CardContent className="p-0">
            {/* Top Metrics Bar */}
            <div className="grid grid-cols-4 border-b border-slate-100 bg-white p-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Active Institutions:</p>
                <p className="text-3xl font-bold text-slate-900">32</p>
              </div>
              <div className="border-l border-slate-100 pl-6">
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Registered Users:</p>
                <p className="text-3xl font-bold text-slate-900">1.2M+</p>
              </div>
              <div className="border-l border-slate-100 pl-6">
                <p className="text-sm font-semibold text-slate-500 mb-1">Global Waste Reduction:</p>
                <p className="text-3xl font-bold text-slate-900">450 Tons <span className="text-sm font-normal text-slate-500">(YTD)</span></p>
              </div>
              <div className="border-l border-slate-100 pl-6">
                <p className="text-sm font-semibold text-slate-500 mb-1">Platform Uptime:</p>
                <p className="text-3xl font-bold text-slate-900">99.98%</p>
              </div>
            </div>

            {/* Map Area */}
            <div className="bg-slate-50 p-6 flex flex-col md:flex-row justify-between items-center relative">
               <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 border border-green-200 shadow-sm">
                    <CheckCircle2 className="h-3 w-3" /> ALL SYSTEMS NORMAL
                  </span>
               </div>
               
               <div className="w-full h-[300px] flex flex-col">
                 <h4 className="text-sm font-bold text-slate-700 mb-4">Multi-Tenant Global Map</h4>
                 {/* CSS Art Map Placeholder */}
                 <div className="flex-1 bg-blue-50/50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center">
                    <Globe2 className="h-64 w-64 text-slate-200 absolute opacity-50" />
                    {/* Simulated Map Markers */}
                    <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse"></div>
                    <div className="absolute top-[40%] left-[25%] w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse"></div>
                    <div className="absolute top-[35%] left-[45%] w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse"></div>
                    <div className="absolute top-[25%] left-[55%] w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse"></div>
                    <div className="absolute top-[45%] left-[75%] w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse"></div>
                    <p className="text-slate-400 font-medium z-10 bg-white/80 px-4 py-2 rounded-lg text-sm">Interactive Map View</p>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Client Performance */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
           <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-base font-semibold">Top Client Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-medium">Institution</th>
                  <th className="px-4 py-3 font-medium">Conversion Rate</th>
                  <th className="px-4 py-3 font-medium">Waste Savings</th>
                  <th className="px-4 py-3 font-medium">Risk Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">Major Client University System</td>
                  <td className="px-4 py-4">70.36%</td>
                  <td className="px-4 py-4">450 Tons</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[90%]"></div></div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <td className="px-4 py-4 font-medium text-slate-900">Major State University System</td>
                  <td className="px-4 py-4">60.75%</td>
                  <td className="px-4 py-4">450 Tons</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-orange-400 w-[60%]"></div></div>
                    </div>
                  </td>
                </tr>
                 <tr>
                  <td className="px-4 py-4 font-medium text-slate-900">Client State University System</td>
                  <td className="px-4 py-4">70.75%</td>
                  <td className="px-4 py-4">450 Tons</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-[75%]"></div></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="shadow-sm border-slate-200">
           <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-semibold">System Health</CardTitle>
              <p className="text-xs text-slate-500 mt-1">(Framer Motion interaction visualization)</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">OPTIMAL</span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-medium text-slate-700">AI Model Retraining Status:</span>
              <span className="text-sm font-bold text-green-600">Optimal</span>
            </div>
            
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
