"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Candidates", href: "/dashboard/candidates", icon: Users },
  { name: "Interviews", href: "/dashboard/interviews", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Call next-auth signout
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });
      
      if (response.ok) {
        router.push("/signin");
        router.refresh();
      }
    } catch (error) {
      console.error("Sign out error:", error);
      router.push("/signin");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white border-r border-brand-100 w-64">
      <div className="flex h-16 items-center px-6 border-b border-brand-100 gap-3">
        <Image
          src="/je_logo.png"
          alt="JobEscape Careers"
          width={36}
          height={36}
          className="rounded-lg"
        />
        <h1 className="text-lg font-bold text-brand-600">
          JobEscape Careers ATS
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-brand-50 text-brand-600"
                : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-brand-500" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-brand-100 p-3 space-y-1">
        <button
          onClick={handleSignOut}
          className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
