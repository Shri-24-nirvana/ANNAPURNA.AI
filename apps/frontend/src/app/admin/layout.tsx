import { ChefHat, LayoutDashboard, Building2, CreditCard, Globe, Activity, Users, Bell, User } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <ChefHat className="h-6 w-6 text-white mr-2" />
          <span className="font-bold text-lg tracking-tight text-white">Annapurna AI</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-slate-800 text-white rounded-lg font-medium shadow-inner">
            <LayoutDashboard className="h-5 w-5 text-blue-400" /> Overview
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
            <Building2 className="h-5 w-5" /> Institutions
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
            <CreditCard className="h-5 w-5" /> Subscriptions
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
            <Globe className="h-5 w-5" /> Global Analytics
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
            <Activity className="h-5 w-5" /> System Health
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition-colors">
            <Users className="h-5 w-5" /> Users
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg font-medium transition-colors">
            Log out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800">Super Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group">
              <button className="p-2 text-slate-400 group-hover:bg-slate-100 rounded-full transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              </button>
              {/* Notification Tooltip Mock */}
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 shadow-lg rounded-xl p-4 hidden group-hover:block z-50">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
                  <Bell className="h-4 w-4 text-red-500" /> Billing Alerts:
                </h4>
                <p className="text-xs text-slate-600 mb-2">2 Institutions pending renewal.</p>
                <a href="#" className="text-xs text-blue-600 font-medium hover:underline">View notifications</a>
              </div>
            </div>
            <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center cursor-pointer">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </header>
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
}
