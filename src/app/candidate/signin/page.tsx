"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User } from "lucide-react";
import Image from "next/image";

export default function CandidateSignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const response = await fetch("/api/candidates/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split("@")[0],
          isRegister,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("candidateId", result.candidate.id);
        localStorage.setItem("candidateEmail", result.candidate.email);
        localStorage.setItem("candidateName", result.candidate.name);
        router.push("/candidate/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Failed to sign in");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
      <Card className="w-full max-w-md border-brand-100 shadow-xl shadow-brand-500/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/je_logo.png"
              alt="JobEscape Careers"
              width={64}
              height={64}
              className="rounded-xl shadow-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isRegister ? "Create Candidate Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isRegister
              ? "Register to track your applications"
              : "Sign in to view your application status"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required={isRegister}
                    className="pl-10 h-11 rounded-xl border-gray-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="pl-10 h-11 rounded-xl border-gray-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 h-11 rounded-xl border-gray-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-full font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all"
              disabled={loading}
            >
              {loading ? "Please wait..." : (isRegister ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Your data is secure and encrypted</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/careers" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
              ← Back to Careers
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
