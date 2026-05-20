"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChefHat, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { setToken, clearToken } from "@/lib/auth";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Clear any existing tokens on login page mount
  useEffect(() => {
    clearToken();
  }, []);

  const handleLogin = async (e: React.FormEvent, roleRedirect: string, defaultEmail: string) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const loginEmail = email || defaultEmail;
    
    try {
      const formData = new URLSearchParams();
      formData.append("username", loginEmail);
      formData.append("password", password);

      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setToken(data.access_token, data.role);
      router.push(roleRedirect);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Backend connection failed. Routing to mock UI...");
      // Fallback for UI mockup testing if backend DB isn't seeded correctly yet
      setTimeout(() => {
        router.push(roleRedirect);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

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
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm font-medium">
               <AlertCircle className="h-5 w-5" />
               {error}
            </div>
          )}

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
              <form onSubmit={(e) => handleLogin(e, '/student', 'student@example.com')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email (Mock Login)</Label>
                  <Input id="student-email" type="email" placeholder="student@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="py-5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input id="student-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="py-5" />
                </div>
                <Button type="submit" disabled={loading} className="w-full py-6 mt-2 text-base font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all">
                  {loading ? "Authenticating..." : "Sign In as Student"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="manager" className="space-y-4">
              <form onSubmit={(e) => handleLogin(e, '/manager', 'manager@example.com')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manager-email">Email</Label>
                  <Input id="manager-email" type="email" placeholder="manager@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="py-5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager-password">Password</Label>
                  <Input id="manager-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="py-5" />
                </div>
                <Button type="submit" disabled={loading} className="w-full py-6 mt-2 text-base font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all">
                  {loading ? "Authenticating..." : "Sign In as Manager"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <form onSubmit={(e) => handleLogin(e, '/admin', 'admin@example.com')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input id="admin-email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="py-5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="py-5" />
                </div>
                 <Button type="submit" disabled={loading} className="w-full py-6 mt-2 text-base font-medium rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all">
                  {loading ? "Authenticating..." : "Sign In as Super Admin"}
                </Button>
              </form>
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
