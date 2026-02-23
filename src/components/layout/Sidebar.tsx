"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Candidates", href: "/dashboard/candidates", icon: Users },
  { name: "Interviews", href: "/dashboard/interviews", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col bg-gray-900 text-white w-64">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-lg font-bold">JobEscape ATS</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-gray-800 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-3 space-y-1">
        <Link
          href="/dashboard/settings"
          className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/careers" })}
          className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
