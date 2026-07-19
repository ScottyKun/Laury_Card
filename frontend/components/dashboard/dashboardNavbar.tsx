"use client";

import Link from "next/link";
import { Search, Mail, LogOut } from "lucide-react";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import Logo from "@/components/logo";
import { logout } from "@/lib/auth";

type Props = {
  firstName?: string;
  unreadCount: number;
  onNewNotification: () => void;
};

export default function DashboardNavbar({ firstName, unreadCount, onNewNotification }: Props) {
  const initial = firstName?.charAt(0).toUpperCase() || "?";

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("notification:new", onNewNotification);
    return () => {
      socket.off("notification:new", onNewNotification);
    };
  }, [onNewNotification]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-dark/10 bg-white px-4 md:px-6">
      <Logo />

      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-full bg-cream px-4 py-2 md:flex">
        <Search size={16} className="text-dark/40" />
        <input type="text" placeholder="Rechercher..." className="w-full bg-transparent text-sm outline-none placeholder:text-dark/40" />
      </div>

      <div className="flex items-center gap-4">
        <Link href="/inbox" className="relative rounded-full p-2 hover:bg-cream">
          <Mail size={20} className="text-dark/60" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/20 text-sm font-medium text-coral-dark hover:bg-coral/30">
          {initial}
        </Link>
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/20 text-sm font-medium text-coral-dark hover:bg-coral/30"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}