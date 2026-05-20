"use client";

import { Bell, Home, Utensils, Award, User, QrCode } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex justify-center h-screen bg-slate-200 font-sans">
      {/* Mobile constrained container */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-slate-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-slate-900 text-white rounded-md flex items-center justify-center font-bold">
              <Utensils className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-900">Good Morning, Alex!</span>
          </div>
          <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto bg-slate-50 pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <Link href="/student" className={`flex flex-col items-center justify-center w-16 h-full ${pathname === '/student' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'} transition-colors`}>
            <Home className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/student/menu" className={`flex flex-col items-center justify-center w-16 h-full ${pathname === '/student/menu' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'} transition-colors`}>
            <Utensils className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">Menu</span>
          </Link>
          <Link href="/student/rewards" className={`flex flex-col items-center justify-center w-16 h-full ${pathname === '/student/rewards' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'} transition-colors`}>
            <Award className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">Rewards</span>
          </Link>
          <Link href="/student/account" className={`flex flex-col items-center justify-center w-16 h-full ${pathname === '/student/account' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'} transition-colors`}>
            <User className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">Account</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
