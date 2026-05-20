"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { Smile, Frown, Meh } from "lucide-react";

const ratingData = [
  { name: '1 star', val: 5 },
  { name: '2 stars', val: 10 },
  { name: '3 stars', val: 25 },
  { name: '4 stars', val: 55 },
  { name: '5 stars', val: 55 },
];

export default function FeedbackPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">STUDENT FEEDBACK & RATING ANALYSIS</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
               <CardTitle className="text-base font-bold text-slate-900">AI Summary</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">OVERALL RATING:</p>
               <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-slate-900">4.2/5 stars</span>
                 <span className="text-sm font-medium text-slate-500">(Past Week)</span>
               </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-0">
               <CardTitle className="text-base font-bold text-slate-900">Anonymous Rating Distribution (1-5 stars)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Bar dataKey="val" fill="#3b7280" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="val" position="top" fill="#475569" fontSize={12} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center font-bold text-sm text-slate-900 mt-4">Anonymous Rating Distribution (1-5 stars)</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
               <CardTitle className="text-base font-bold text-slate-900">AI Generated Feedback Summary</CardTitle>
               <p className="text-xs text-slate-500">Sentiment Analysis - BERT ref</p>
            </CardHeader>
            <CardContent className="pt-2">
               <p className="text-sm font-medium text-slate-900 mb-3">Summary of 150 submissions:</p>
               <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-sm text-slate-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shadow-[0_0_4px_rgba(34,197,94,0.8)]"></div>
                   <span>Students strongly appreciate Friday's Paneer Tikka (Praise Sentiment).</span>
                 </li>
                 <li className="flex items-start gap-2 text-sm text-slate-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shadow-[0_0_4px_rgba(239,68,68,0.8)]"></div>
                   <span>Recurrent complaints about Tuesday's overcooked vegetables (Negative Sentiment).</span>
                 </li>
                 <li className="flex items-start gap-2 text-sm text-slate-800">
                   <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shadow-[0_0_4px_rgba(234,179,8,0.8)]"></div>
                   <span>Suggestions for more variety in breakfast options (Neutral Sentiment).</span>
                 </li>
               </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-2">
               <CardTitle className="text-base font-bold text-slate-900">Anonymous Student Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
               
               <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                 <div>
                   <p className="text-sm font-bold text-slate-900">Student_A12</p>
                   <p className="text-xs text-slate-500">2026-10-26 14:00 AM</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold text-slate-900 flex items-center gap-1 justify-end mb-1">
                      Anonymous rating: 4 stars <Smile className="h-4 w-4 text-green-500 bg-green-100 rounded-full" />
                   </p>
                   <p className="text-sm text-slate-700">Lunch Paneer was excellent!</p>
                 </div>
               </div>

               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-sm font-bold text-slate-900">Student_A11</p>
                   <p className="text-xs text-slate-500">2026-10-26 17:00 AM</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold text-slate-900 flex items-center gap-1 justify-end mb-1">
                      Anonymous rating: 4 stars <Frown className="h-4 w-4 text-red-500 bg-red-100 rounded-full" />
                   </p>
                   <p className="text-sm text-slate-700">Tuesday veg overcooked</p>
                 </div>
               </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
