"use client";

import * as React from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function SignupPage() {
  const { signup, isLoading } = useAuthStore();
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const firstName = (data.get("firstName") as string) ?? "";
    const lastName = (data.get("lastName") as string) ?? "";
    const email = (data.get("email") as string) ?? "";
    const password = (data.get("password") as string) ?? "";
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    const success = await signup(`${firstName} ${lastName}`, email, password);
    if (success) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create an account</h2>
        <p className="text-slate-500 dark:text-slate-400">Start generating smart floor plans today.</p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First name</label>
              <input 
                name="firstName"
                type="text" 
                placeholder="John" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last name</label>
              <input 
                name="lastName"
                type="text" 
                placeholder="Doe" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>
            <input 
              name="email"
              type="email" 
              placeholder="name@company.com" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              name="password"
              type="password" 
              placeholder="Create a password" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all mt-4 inline-flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
