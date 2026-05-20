"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, LabelList } from "recharts";
import { Download, Leaf, TreePine, DollarSign, Coins } from "lucide-react";

const savingsData = [
  { name: 'Jan', val: 110 }, { name: 'Feb', val: 138 }, { name: 'Mar', val: 183 }, 
  { name: 'Apr', val: 230 }, { name: 'May', val: 154 }, { name: 'Jun', val: 150 }
];

const gasData = [
  { name: 'Jan', val: 130 }, { name: 'Feb', val: 150 }, { name: 'Mar', val: 80 }, 
  { name: 'Apr', val: 115 }, { name: 'May', val: 85 }
];

const projectedActualData = [
  { name: 'Jan', projected: 40, actual: 0, previous: 0 },
  { name: 'Feb', projected: 250, actual: 140, previous: 190 },
  { name: 'Mar', projected: 190, actual: 230, previous: 150 },
  { name: 'Apr', projected: 235, actual: 310, previous: 275 },
  { name: 'May', projected: 275, actual: 420, previous: 350 },
];

export default function ReportsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">COMPREHENSIVE PERFORMANCE REPORTS</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#4a7c82] hover:bg-[#386065] text-white rounded-md font-semibold text-sm transition-colors shadow-sm">
          <Download className="h-4 w-4" /> Download Detailed Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sustainability & Savings Summary */}
        <Card className="shadow-sm border-slate-200">
           <CardHeader className="pb-2 border-b border-slate-100">
             <CardTitle className="text-lg font-bold text-slate-900">Sustainability & Savings Summary</CardTitle>
           </CardHeader>
           <CardContent className="pt-6 grid grid-cols-2 gap-y-8 gap-x-4">
              
              <div className="flex justify-between items-center">
                 <div>
                   <p className="text-xs font-semibold text-slate-600 mb-1">CO2 Reduction</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tight">140kg</p>
                   <p className="text-[10px] text-slate-400 mt-1">(Image 1/0 ref)</p>
                 </div>
                 <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shadow-[0_0_15px_rgba(186,230,253,0.6)] relative">
                    <Leaf className="h-6 w-6 text-green-500 absolute -top-1" />
                    <span className="text-[10px] font-bold text-blue-800 mt-2">CO2</span>
                 </div>
              </div>

              <div className="flex justify-between items-center pl-4 border-l border-slate-100">
                 <div>
                   <p className="text-xs font-semibold text-slate-600 mb-1">Food Wastage Reduced</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tight">35kg</p>
                 </div>
                 <div className="text-3xl filter drop-shadow-md">
                    🥗
                 </div>
              </div>

              <div className="flex justify-between items-center">
                 <div>
                   <p className="text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wider">PROJECTED SAVINGS (YTD)</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tight">1,200</p>
                 </div>
                 <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                    <DollarSign className="h-6 w-6 text-green-600" />
                 </div>
              </div>

              <div className="flex justify-between items-center pl-4 border-l border-slate-100">
                 <div>
                   <p className="text-xs font-semibold text-slate-600 mb-1">Financial Savings (Money)</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tight">345</p>
                 </div>
                 <div className="text-3xl filter drop-shadow-md">
                    🪙
                 </div>
              </div>

           </CardContent>
        </Card>

        {/* Savings Comparison */}
        <Card className="shadow-sm border-slate-200">
           <CardHeader className="pb-2">
             <CardTitle className="text-base font-bold text-slate-900 uppercase">SAVINGS COMPARISON</CardTitle>
             <p className="text-xs text-slate-500">(Money/Food/Gas - Past Quarter)</p>
           </CardHeader>
           <CardContent className="h-[250px] pt-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={savingsData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                 <Bar dataKey="val" fill="#3b7280" barSize={35}>
                    <LabelList dataKey="val" position="top" fill="#475569" fontSize={11} fontWeight={600} />
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* Gas Consumption */}
        <Card className="shadow-sm border-slate-200">
           <CardHeader className="pb-2">
             <CardTitle className="text-base font-bold text-slate-900">Gas (Fuel) Consumption Trend (KG)</CardTitle>
           </CardHeader>
           <CardContent className="h-[200px] pt-4">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={gasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 200]} ticks={[0, 50, 100, 150, 200]} />
                 <Line type="monotone" dataKey="val" stroke="#3b7280" strokeWidth={2} dot={{ r: 3, fill: "#3b7280" }} />
               </LineChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* Projected vs Actual */}
        <Card className="shadow-sm border-slate-200">
           <CardHeader className="pb-2">
             <CardTitle className="text-base font-bold text-slate-900 uppercase">PROJECTED vs. ACTUAL SAVINGS TREND</CardTitle>
             <p className="text-xs text-slate-500">(Money - past quarter)</p>
           </CardHeader>
           <CardContent className="h-[200px] pt-4">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={projectedActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 400]} ticks={[0, 100, 200, 300, 400]} />
                 <Line type="monotone" dataKey="projected" stroke="#004d40" strokeWidth={2} dot={{ r: 3, fill: "#004d40" }} />
                 <Line type="monotone" dataKey="actual" stroke="#26a69a" strokeWidth={2} dot={{ r: 3, fill: "#26a69a" }} />
                 <Line type="monotone" dataKey="previous" stroke="#d4a373" strokeWidth={2} dot={{ r: 3, fill: "#d4a373" }} />
               </LineChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>

      </div>
    </div>
  );
}
