"use client";

import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
            {session?.user?.name
              ? getInitials(session.user.name)
              : session?.user?.email?.[0].toUpperCase()}
          </div>
          <span className="text-sm text-gray-600">
            {session?.user?.email}
          </span>
        </div>
      </div>
    </header>
  );
}
