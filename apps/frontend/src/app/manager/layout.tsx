"use client";

import { ChefHat, LayoutDashboard, LineChart, Box, MessageSquare, FileText, Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path 
      ? "flex items-center gap-3 px-3 py-2 bg-slate-900 text-white rounded-lg font-medium transition-colors"
      : "flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <ChefHat className="h-6 w-6 text-slate-900 mr-2" />
          <span className="font-bold text-lg tracking-tight">Annapurna AI</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/manager" className={getLinkClass("/manager")}>
            <LayoutDashboard className="h-5 w-5" /> Command Center
          </Link>
          <Link href="/manager/prep-sheet" className={getLinkClass("/manager/prep-sheet")}>
            <LineChart className="h-5 w-5" /> Prep Sheet
          </Link>
          <Link href="/manager/inventory" className={getLinkClass("/manager/inventory")}>
            <Box className="h-5 w-5" /> Inventory {pathname === "/manager/inventory" && "(Active)"}
          </Link>
          <Link href="/manager/feedback" className={getLinkClass("/manager/feedback")}>
            <MessageSquare className="h-5 w-5" /> Feedback Analysis
          </Link>
          <Link href="/manager/reports" className={getLinkClass("/manager/reports")}>
            <FileText className="h-5 w-5" /> Reports {pathname === "/manager/reports" && "(Active)"}
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium">
            Log out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-slate-800">Manager Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </header>
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
