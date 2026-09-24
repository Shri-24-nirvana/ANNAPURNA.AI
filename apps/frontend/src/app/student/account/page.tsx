"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bell, Moon, Sun, Laptop, Lock, Key, LogOut, ChevronRight, Edit2, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/theme-context";

export default function AccountPage() {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Your Profile & Settings</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage preferences, theme and identity</p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Active Pass
        </span>
      </div>
      
      {/* Profile Avatar */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-blue-50 dark:border-blue-900/40 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.25)] text-3xl font-semibold text-slate-700 dark:text-slate-200">
            A
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
             <Edit2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Name</p>
             <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Alex J.</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">College ID</p>
             <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">ET12345</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 border-0 shadow-sm rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Institution</p>
             <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Example Tech University</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Hostel</p>
             <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Block C - R210</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Department</p>
             <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">Computer Science</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Menu */}
      <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 overflow-hidden mt-6">
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800/60">
          
          {/* THEME TOGGLE ROW */}
          <div className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                 {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
               </div>
               <div>
                 <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Appearance Theme</span>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400">
                   Currently: <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">{theme}</span>
                 </p>
               </div>
             </div>
             
             {/* 3-way Interactive Theme Switcher (Light / System / Dark) */}
             <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 rounded-xl p-1 gap-0.5 border border-slate-300/60 dark:border-slate-700">
               <button 
                 type="button"
                 title="Light Mode"
                 onClick={() => setTheme("light")}
                 className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                   theme === "light" 
                     ? "bg-white dark:bg-slate-700 text-amber-500 shadow-sm font-bold" 
                     : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                 }`}
               >
                 <Sun className="h-3.5 w-3.5" />
                 <span className="text-[10px] pr-0.5">Light</span>
               </button>
               
               <button 
                 type="button"
                 title="System Preference"
                 onClick={() => setTheme("system")}
                 className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                   theme === "system" 
                     ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold" 
                     : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                 }`}
               >
                 <Laptop className="h-3.5 w-3.5" />
                 <span className="text-[10px] pr-0.5">Auto</span>
               </button>

               <button 
                 type="button"
                 title="Dark Mode"
                 onClick={() => setTheme("dark")}
                 className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                   theme === "dark" 
                     ? "bg-white dark:bg-slate-700 text-indigo-400 shadow-sm font-bold" 
                     : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                 }`}
               >
                 <Moon className="h-3.5 w-3.5" />
                 <span className="text-[10px] pr-0.5">Dark</span>
               </button>
             </div>
          </div>

          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                 <Bell className="h-4 w-4" />
               </div>
               <div>
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Meal Reminders & Notifications</span>
                 <p className="text-[11px] text-slate-400 dark:text-slate-500">Opt-out cutoff and rewards alerts</p>
               </div>
             </div>
             <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                 <Lock className="h-4 w-4" />
               </div>
               <div>
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Security & Authentication</span>
                 <p className="text-[11px] text-slate-400 dark:text-slate-500">Password and multi-factor session</p>
               </div>
             </div>
             <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </button>
        </div>
      </Card>

      <button 
        onClick={() => router.push('/')}
        className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 mt-4 text-sm"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>

    </div>
  );
}

