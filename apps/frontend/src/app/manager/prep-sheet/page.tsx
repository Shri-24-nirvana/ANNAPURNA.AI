"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function PrepSheetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch("/manager/prep-sheet");
        setData(response);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

  const prepData = data?.prep_data || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">AI Optimized Prep Sheet</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-2">
           <Clock className="h-3 w-3" /> FOR: LUNCH (12:30 PM)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border-l-4 border-l-[#4a7c82]">
           <CardContent className="pt-6">
             <p className="text-sm font-semibold text-slate-500 mb-1">Total Enrolled</p>
             <p className="text-3xl font-black text-slate-900">{data?.total_enrolled || 2000}</p>
           </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-orange-400">
           <CardContent className="pt-6">
             <p className="text-sm font-semibold text-slate-500 mb-1">Explicitly Skipped</p>
             <p className="text-3xl font-black text-slate-900">{data?.skipped_count || 0}</p>
           </CardContent>
        </Card>
        <Card className="bg-[#e6f4f1] border-l-4 border-l-teal-600">
           <CardContent className="pt-6 flex justify-between items-center">
             <div>
                <p className="text-sm font-bold text-teal-800 mb-1">AI Predicted Attendance</p>
                <p className="text-4xl font-black text-teal-900">{data?.predicted_attendance || 0}</p>
             </div>
             <Users className="h-10 w-10 text-teal-300" />
           </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
              <tr>
                 <th className="px-6 py-4 font-bold">Ingredient</th>
                 <th className="px-6 py-4 font-bold">Category</th>
                 <th className="px-6 py-4 font-bold text-right">Required Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {prepData.map((item: any, i: number) => (
                 <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.ingredient}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                       <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-right text-lg text-[#3b7280]">
                       {item.amount} <span className="text-sm font-semibold text-slate-400">{item.unit}</span>
                    </td>
                 </tr>
               ))}
               {prepData.length === 0 && (
                 <tr>
                   <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No data available.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </Card>
      
    </div>
  );
}
