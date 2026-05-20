"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { Smile, Frown, Meh, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function FeedbackAnalysis() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch("/manager/feedback");
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

  const distribution = data?.distribution || { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  const chartData = [
    { rating: "5 Star", count: distribution["5"] },
    { rating: "4 Star", count: distribution["4"] },
    { rating: "3 Star", count: distribution["3"] },
    { rating: "2 Star", count: distribution["2"] },
    { rating: "1 Star", count: distribution["1"] },
  ];

  const feedbacks = data?.feedbacks || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Feedback & Sentiment Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sentiment Summary */}
        <Card className="col-span-1 shadow-sm border-0">
           <CardHeader className="pb-2 border-b border-slate-100">
             <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wide">AI Sentiment Breakdown</CardTitle>
           </CardHeader>
           <CardContent className="pt-6 space-y-6">
              
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Smile className="h-6 w-6 text-green-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900">Positive (4-5 Stars)</p>
                    <p className="text-2xl font-black text-green-600">{distribution["5"] + distribution["4"]}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Meh className="h-6 w-6 text-yellow-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900">Neutral (3 Stars)</p>
                    <p className="text-2xl font-black text-yellow-600">{distribution["3"]}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <Frown className="h-6 w-6 text-red-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-900">Negative (1-2 Stars)</p>
                    <p className="text-2xl font-black text-red-600">{distribution["2"] + distribution["1"]}</p>
                 </div>
              </div>

           </CardContent>
        </Card>

        {/* Rating Distribution Chart */}
        <Card className="col-span-1 md:col-span-2 shadow-sm border-0">
           <CardHeader className="pb-2 border-b border-slate-100">
             <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wide">Anonymous Rating Distribution</CardTitle>
           </CardHeader>
           <CardContent className="pt-6 h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="rating" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} width={60} />
                  <Bar dataKey="count" fill="#4a7c82" radius={[0, 4, 4, 0]} barSize={24}>
                     <LabelList dataKey="count" position="right" fill="#475569" fontSize={12} fontWeight={700} />
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>
      </div>

      {/* Raw Comments Stream */}
      <Card className="shadow-sm border-0">
         <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50 rounded-t-xl">
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wide">AI Processed Comments</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
               {feedbacks.map((fb: any, i: number) => {
                 let tagClass = "bg-green-100 text-green-700";
                 if (fb.sentiment === "NEGATIVE") tagClass = "bg-red-100 text-red-700";
                 else if (fb.sentiment === "NEUTRAL") tagClass = "bg-yellow-100 text-yellow-800";

                 return (
                   <div key={i} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                         <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-xs font-bold">{fb.rating} ★</span>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tagClass}`}>
                            {fb.sentiment}
                         </span>
                         <span className="text-xs text-slate-400 font-medium ml-auto">Just now</span>
                      </div>
                      <p className="text-slate-700 text-sm">{fb.comment}</p>
                   </div>
                 );
               })}
               {feedbacks.length === 0 && (
                 <div className="p-8 text-center text-slate-500 font-medium">No feedback collected yet.</div>
               )}
            </div>
         </CardContent>
      </Card>
      
    </div>
  );
}
