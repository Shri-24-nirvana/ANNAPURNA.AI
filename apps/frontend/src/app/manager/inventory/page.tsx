"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

const inventoryData = [
  { item: "RICE", category: "Grains", stock: 750, limit: 200, status: "HIGH", date: "2026-10-26 14:00" },
  { item: "DAL", category: "Pulses", stock: 450, limit: 150, status: "HIGH", date: "2026-10-26 14:00" },
  { item: "PANEER", category: "Dairy", stock: 120, limit: 50, status: "HIGH", date: "2026-10-26 13:30" },
  { item: "ONION", category: "Vegetables", stock: 15, limit: 30, status: "CRITICAL", date: "2026-10-26 14:15" },
  { item: "TOMATO", category: "Vegetables", stock: 28, limit: 40, status: "LOW", date: "2026-10-26 14:15" },
  { item: "CHICKEN", category: "Meat", stock: 200, limit: 100, status: "HIGH", date: "2026-10-26 12:45" },
  { item: "SPICES", category: "Misc", stock: 90, limit: 25, status: "HIGH", date: "2026-10-26 13:30" },
];

export default function InventoryPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "HIGH": return "bg-orange-400";
      case "LOW": return "bg-orange-500";
      case "CRITICAL": return "bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">CURRENT INVENTORY & REORDER ALERTS</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#4a7c82] hover:bg-[#386065] text-white rounded-md font-semibold text-sm transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Add New Item
        </button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-900 font-bold border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Current Stock (Unit)</th>
                <th className="px-6 py-4">Threshold Limit (Unit)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((row, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.item}</td>
                  <td className="px-6 py-4 text-slate-600">{row.category}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{row.stock}</td>
                  <td className="px-6 py-4 text-slate-600">{row.limit}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(row.status)}`}></span>
                      {row.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
