"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bell, Moon, Sun, Lock, Key, LogOut, ChevronRight, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Your Profile & Settings</h2>
      
      {/* Profile Avatar */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-blue-50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] text-3xl font-light text-slate-600">
            A
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900">
             <Edit2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm rounded-xl bg-slate-100">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</p>
             <p className="text-sm font-semibold text-slate-900">Alex J.</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-xl bg-slate-100">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">College ID</p>
             <p className="text-sm font-semibold text-slate-900">ET12345</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 border-0 shadow-sm rounded-xl bg-slate-100">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Institution</p>
             <p className="text-sm font-semibold text-slate-900">Example Tech University</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-xl bg-slate-100">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hostel</p>
             <p className="text-sm font-semibold text-slate-900">Block C - R210</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-xl bg-slate-100">
          <CardContent className="p-4">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</p>
             <p className="text-sm font-semibold text-slate-900 truncate">Computer Science</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Menu */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden mt-6">
        <div className="flex flex-col">
          <button className="w-full flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <Bell className="h-4 w-4 text-slate-500" />
               <span className="text-sm font-medium text-slate-700">Notification Preferences</span>
             </div>
             <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
          
          <div className="w-full flex items-center justify-between p-4 border-b border-slate-50">
             <div className="flex items-center gap-3">
               <Sun className="h-4 w-4 text-slate-500" />
               <span className="text-sm font-medium text-slate-700">Theme</span>
             </div>
             <div className="flex items-center bg-slate-100 rounded-full p-1">
               <button className="p-1.5 bg-white rounded-full shadow-sm text-yellow-500"><Sun className="h-3 w-3" /></button>
               <button className="p-1.5 rounded-full text-slate-400"><Moon className="h-3 w-3" /></button>
             </div>
          </div>

          <button className="w-full flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <Lock className="h-4 w-4 text-slate-500" />
               <span className="text-sm font-medium text-slate-700">Clerk Auth Settings</span>
             </div>
             <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

           <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
             <div className="flex items-center gap-3">
               <Key className="h-4 w-4 text-slate-500" />
               <span className="text-sm font-medium text-slate-700">Change Password</span>
             </div>
             <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </Card>

      <button 
        onClick={() => router.push('/')}
        className="w-full py-4 bg-[#b54a55] hover:bg-red-800 text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 mt-4"
      >
        Log Out
      </button>

    </div>
  );
}
