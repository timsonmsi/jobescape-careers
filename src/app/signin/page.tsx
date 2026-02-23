"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
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
            JobEscape Careers ATS
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access your recruiter dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                className="h-11 rounded-xl border-gray-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-11 rounded-xl border-gray-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-full font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium mb-2">Demo credentials:</p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="bg-gray-100 px-3 py-1.5 rounded-lg font-mono">admin@jobescape.com</span>
                <span className="text-gray-400">/</span>
                <span className="bg-gray-100 px-3 py-1.5 rounded-lg font-mono">admin123</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/careers"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              ← Back to Careers
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
