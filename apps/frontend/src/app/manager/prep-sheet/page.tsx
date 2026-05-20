"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const prepData = [
  { ingredient: "RICE", category: "Grains", unit: "KG", amount: 190 },
  { ingredient: "DAL", category: "Pulses", unit: "KG", amount: 110 },
  { ingredient: "PANEER", category: "Dairy", unit: "KG", amount: 85 },
  { ingredient: "ONION", category: "Vegetables", unit: "KG", amount: 20 },
  { ingredient: "TOMATO", category: "Vegetables", unit: "KG", amount: 45 },
  { ingredient: "SPICES", category: "Misc", unit: "KG", amount: 10 },
  { ingredient: "COOKING OIL", category: "Fats/Oils", unit: "Liters", amount: 30 },
];

export default function PrepSheetPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">AI OPTIMIZED PREP SHEET - LUNCH</h2>
      
      <div className="flex gap-4">
        <Card className="flex-1 shadow-sm border-slate-200">
           <CardContent className="p-4 flex flex-col justify-center h-full">
              <p className="text-sm font-semibold text-slate-900 mb-1">Operational Context: <span className="font-normal text-slate-600">Tuesday, October 26, 2026.</span></p>
              <p className="text-sm font-semibold text-slate-900">Meal: <span className="font-normal text-slate-600">LUNCH.</span></p>
           </CardContent>
        </Card>
        
        <Card className="w-1/3 shadow-sm border-0 bg-[#e0f2f1]">
           <CardContent className="p-4 flex flex-col justify-center h-full border-l-4 border-[#00796b]">
              <p className="text-sm font-semibold text-slate-900 mb-1">AI Predicted Attendance:</p>
              <p className="text-xl font-bold text-[#00796b]">1800/2000 students (90%)</p>
           </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-900 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Ingredient</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4 text-right">AI Recommended Amount</th>
              </tr>
            </thead>
            <tbody>
              {prepData.map((item, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.ingredient}</td>
                  <td className="px-6 py-4 text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-slate-600">{item.unit}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 text-right">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex items-center justify-between border-t border-slate-200 bg-slate-50">
             <button className="px-6 py-2 bg-[#4a7c82] hover:bg-[#386065] text-white rounded-md font-semibold text-sm transition-colors shadow-sm">
                Generate Prep Sheet
             </button>
             <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Clock className="h-3 w-3" /> Last AI Refresh: 5m ago
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
