"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch("/manager/inventory");
        setInventoryData(response);
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">Current Inventory & Alerts</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
              <tr>
                 <th className="px-6 py-4 font-bold">Item</th>
                 <th className="px-6 py-4 font-bold">Stock</th>
                 <th className="px-6 py-4 font-bold text-center">Status</th>
                 <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {inventoryData.map((item: any, i: number) => {
                 let statusClass = "bg-green-100 text-green-700";
                 let dotClass = "bg-green-500";
                 
                 if (item.status === "CRITICAL") {
                   statusClass = "bg-red-100 text-red-700 font-bold border border-red-200";
                   dotClass = "bg-red-500 animate-pulse";
                 } else if (item.status === "LOW") {
                   statusClass = "bg-yellow-100 text-yellow-800";
                   dotClass = "bg-yellow-500";
                 }

                 return (
                   <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-base">{item.item_name}</p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-end gap-2">
                          <span className={`text-2xl font-black ${item.status === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'}`}>
                            {item.current_stock}
                          </span>
                          <span className="text-sm font-semibold text-slate-400 mb-1">{item.unit}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Limit: {item.reorder_limit} {item.unit}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${statusClass}`}>
                            <span className={`h-2 w-2 rounded-full ${dotClass}`}></span>
                            {item.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="text-sm font-bold text-[#4a7c82] hover:text-[#386065] transition-colors">
                           {item.status === "CRITICAL" ? "Order Now" : "Update"}
                         </button>
                      </td>
                   </tr>
                 );
               })}
               {inventoryData.length === 0 && (
                 <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No inventory found.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </Card>
    </div>
  );
}
