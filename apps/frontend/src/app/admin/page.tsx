"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Download, Leaf, TreePine, DollarSign, Coins, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, instData, trendsData] = await Promise.all([
          apiFetch("/admin/stats").catch(() => null),
          apiFetch("/admin/institutions").catch(() => []),
          apiFetch("/admin/financial-trends").catch(() => [])
        ]);
        setStats(statsData);
        setInstitutions(instData);
        setTrends(trendsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Global Headquarters</h2>
          <p className="text-slate-500 font-medium">Cross-institution analytics and financial overview</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
           <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {/* Top Level Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl">
          <CardContent className="pt-6">
            <Leaf className="h-6 w-6 mb-4 opacity-80" />
            <p className="text-sm font-bold opacity-90 uppercase tracking-wider mb-1">Total Meals Saved</p>
            <p className="text-4xl font-black">{stats?.total_meals_saved?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="pt-6">
            <DollarSign className="h-6 w-6 mb-4 text-[#4a7c82]" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Money Saved (INR)</p>
            <p className="text-4xl font-black text-slate-900">₹{stats?.total_money_saved?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="pt-6">
            <TreePine className="h-6 w-6 mb-4 text-teal-600" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Waste Prevented</p>
            <p className="text-4xl font-black text-slate-900">{stats?.total_waste_prevented_kg?.toLocaleString() || 0} <span className="text-lg text-slate-400">kg</span></p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-slate-900 text-white rounded-2xl">
          <CardContent className="pt-6">
            <Coins className="h-6 w-6 mb-4 opacity-80" />
            <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Total ID Scans</p>
            <p className="text-4xl font-black">{stats?.total_scans?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Financial Trends Graph */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 uppercase tracking-wide">Financial Savings Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Saved"]}
                />
                <Line type="monotone" dataKey="saved" stroke="#4a7c82" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Multi-Institution Table */}
        <Card className="col-span-1 border-0 shadow-sm rounded-2xl flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 uppercase tracking-wide">Institution Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0">
                  <tr>
                    <th className="px-5 py-3 font-bold">Campus</th>
                    <th className="px-5 py-3 font-bold text-right">Saved (₹)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {institutions.map((inst: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                       <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{inst.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`h-2 w-2 rounded-full ${inst.health === 'OPTIMAL' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">{inst.health}</span>
                          </div>
                       </td>
                       <td className="px-5 py-4 text-right font-black text-[#4a7c82]">
                          ₹{inst.money_saved.toLocaleString()}
                       </td>
                    </tr>
                  ))}
                  {institutions.length === 0 && (
                     <tr><td colSpan={2} className="px-5 py-8 text-center text-slate-500">No institutions found.</td></tr>
                  )}
               </tbody>
            </table>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
