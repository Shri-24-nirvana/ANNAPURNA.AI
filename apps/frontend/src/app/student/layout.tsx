"use client";

import { Bell, Home, Utensils, Award, User, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-context";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="flex justify-center h-screen bg-slate-300 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Mobile constrained container */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl relative flex flex-col overflow-hidden border-x border-slate-200/50 dark:border-slate-800">
        
        {/* Top Header */}
        <header className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg flex items-center justify-center font-bold shadow-sm">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 block leading-tight">Alex J.</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Hostel C • ET12345</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>
            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100 transition-colors">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full h-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] z-20 transition-colors">
          <Link 
            href="/student" 
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              pathname === '/student' 
                ? 'text-blue-600 dark:text-blue-400 font-bold' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Home</span>
          </Link>
          <Link 
            href="/student/menu" 
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              pathname === '/student/menu' 
                ? 'text-blue-600 dark:text-blue-400 font-bold' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Utensils className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Menu</span>
          </Link>
          <Link 
            href="/student/rewards" 
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors relative ${
              pathname === '/student/rewards' 
                ? 'text-blue-600 dark:text-blue-400 font-bold' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Award className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Rewards</span>
            <span className="absolute top-2 right-3.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          </Link>
          <Link 
            href="/student/account" 
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              pathname === '/student/account' 
                ? 'text-blue-600 dark:text-blue-400 font-bold' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-[10px]">Account</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

