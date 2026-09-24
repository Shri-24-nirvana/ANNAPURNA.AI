"use client";

import { ChefHat, LayoutDashboard, LineChart, Box, MessageSquare, FileText, Bell, User, Gift, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-context";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();

  const getLinkClass = (path: string) => {
    return pathname === path 
      ? "flex items-center gap-3 px-3 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg font-medium transition-colors"
      : "flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg font-medium transition-colors";
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <ChefHat className="h-6 w-6 text-slate-900 dark:text-blue-400 mr-2" />
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">Annapurna AI</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/manager" className={getLinkClass("/manager")}>
            <LayoutDashboard className="h-5 w-5" /> Command Center
          </Link>
          <Link href="/manager/prep-sheet" className={getLinkClass("/manager/prep-sheet")}>
            <LineChart className="h-5 w-5" /> Prep Sheet
          </Link>
          <Link href="/manager/coupons" className={getLinkClass("/manager/coupons")}>
            <Gift className="h-5 w-5" /> Coupons & Perks
          </Link>
          <Link href="/manager/inventory" className={getLinkClass("/manager/inventory")}>
            <Box className="h-5 w-5" /> Inventory
          </Link>
          <Link href="/manager/feedback" className={getLinkClass("/manager/feedback")}>
            <MessageSquare className="h-5 w-5" /> Feedback Analysis
          </Link>
          <Link href="/manager/reports" className={getLinkClass("/manager/reports")}>
            <FileText className="h-5 w-5" /> Reports
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg font-medium transition-colors">
            Log out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 transition-colors">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mess Manager Command Center</h1>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
        </header>
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          {children}
        </div>
      </main>
    </div>
  );
}

