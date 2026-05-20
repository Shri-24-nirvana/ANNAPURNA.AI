"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChefHat } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("student");
  const router = useRouter();

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-start p-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <ChefHat className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold tracking-tight">Annapurna AI</span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Intelligence for<br/>every meal.
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Reducing global food waste.
          </p>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-white">
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-8 tracking-tight">
            Welcome back to<br/>Annapurna AI.
          </h2>

          <Tabs defaultValue="student" className="w-full mb-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent border-b border-slate-200 rounded-none h-auto p-0">
              <TabsTrigger 
                value="student" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent rounded-none py-3 text-sm font-medium data-[state=active]:shadow-none"
              >
                Student Portal
              </TabsTrigger>
              <TabsTrigger 
                value="manager"
                className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent rounded-none py-3 text-sm font-medium data-[state=active]:shadow-none"
              >
                Mess Manager
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent rounded-none py-3 text-sm font-medium data-[state=active]:shadow-none"
              >
                Super Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4">
              <Button onClick={() => router.push('/student')} variant="outline" className="w-full py-6 text-base font-medium flex items-center justify-center gap-3 rounded-xl border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with University SSO
              </Button>
              <Button onClick={() => router.push('/student')} variant="outline" className="w-full py-6 text-base font-medium flex items-center justify-center gap-3 rounded-xl border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
                <svg className="h-5 w-5 text-[#00a4ef]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
                Continue with College Email
              </Button>
            </TabsContent>

            <TabsContent value="manager" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manager-email">Email</Label>
                <Input id="manager-email" type="email" placeholder="manager@university.edu" defaultValue="manager@university.edu" className="py-5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager-password">Password</Label>
                <Input id="manager-password" type="password" defaultValue="password" className="py-5" />
              </div>
              <Button onClick={() => router.push('/manager')} className="w-full py-6 mt-2 text-base font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all">
                Sign In as Manager
              </Button>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@annapurna.com" defaultValue="admin@annapurna.com" className="py-5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" defaultValue="password" className="py-5" />
              </div>
               <Button onClick={() => router.push('/admin')} className="w-full py-6 mt-2 text-base font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all">
                Sign In as Super Admin
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center text-sm text-slate-500">
            First time? <a href="#" className="font-semibold text-slate-900 hover:underline">Contact your host.</a>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-2">
            <Checkbox id="remember" className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
            <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
              Remember my role
            </Label>
          </div>
          
        </div>
      </div>
    </div>
  );
}
