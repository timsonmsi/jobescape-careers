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
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState({ unreadMessages: 0, unreadApplications: 0, total: 0 });
  const [viewedApplicationIds, setViewedApplicationIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewedApplications');
      if (saved) return new Set(JSON.parse(saved));
    }
    return new Set();
  });
  const [viewedMessageCandidateIds, setViewedMessageCandidateIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewedMessageCandidates');
      if (saved) return new Set(JSON.parse(saved));
    }
    return new Set();
  });
  const [viewedInterviewIds, setViewedInterviewIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewedInterviews');
      if (saved) return new Set(JSON.parse(saved));
    }
    return new Set();
  });
  const [interviewResponsesCount, setInterviewResponsesCount] = useState(0);

  // Poll for new interview responses
  useEffect(() => {
    const fetchInterviewResponses = async () => {
      try {
        const response = await fetch("/api/interviews");
        if (response.ok) {
          const interviews = await response.json();
          const respondedInterviews = interviews.filter(
            (i: any) => (i.status === 'ACCEPTED' || i.status === 'DECLINED') && !viewedInterviewIds.has(i.id)
          );
          if (respondedInterviews.length > 0) {
            setInterviewResponsesCount(prev => {
              const newCount = respondedInterviews.length;
              return newCount !== prev ? newCount : prev;
            });
          }
        }
      } catch (error) {
        console.error("Error fetching interview responses:", error);
      }
    };

    fetchInterviewResponses();
    const interval = setInterval(fetchInterviewResponses, 10000);
    return () => clearInterval(interval);
  }, [viewedInterviewIds]);

  const handleSignOut = async () => {
    const viewedApplications = localStorage.getItem('viewedApplications');
    const viewedMessageCandidates = localStorage.getItem('viewedMessageCandidates');
    const viewedInterviews = localStorage.getItem('viewedInterviews');
    
    sessionStorage.clear();
    
    if (viewedApplications) localStorage.setItem('viewedApplications', viewedApplications);
    if (viewedMessageCandidates) localStorage.setItem('viewedMessageCandidates', viewedMessageCandidates);
    if (viewedInterviews) localStorage.setItem('viewedInterviews', viewedInterviews);

    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/signin");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      router.push("/signin");
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/admin/notifications", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const actualUnreadApplications = Math.max(0, data.unreadApplications - viewedApplicationIds.size);
        const actualUnreadMessages = Math.max(0, data.unreadMessages - viewedMessageCandidateIds.size);
        
        setNotifications(prev => {
          if (prev.unreadApplications === actualUnreadApplications && 
              prev.unreadMessages === actualUnreadMessages) {
            return prev;
          }
          return {
            unreadApplications: actualUnreadApplications,
            unreadMessages: actualUnreadMessages,
            total: actualUnreadApplications + actualUnreadMessages,
          };
        });
      } catch (error: any) {
        console.error("Error fetching notifications:", error.message || error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [viewedApplicationIds, viewedMessageCandidateIds]);

  useEffect(() => {
    const handleApplicationsViewed = (event: CustomEvent) => {
      const { applicationId } = event.detail as { applicationId: string };
      setViewedApplicationIds(prev => {
        const newSet = new Set(prev).add(applicationId);
        localStorage.setItem('viewedApplications', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
    };

    window.addEventListener('applicationsViewed', handleApplicationsViewed as EventListener);
    return () => window.removeEventListener('applicationsViewed', handleApplicationsViewed as EventListener);
  }, []);

  useEffect(() => {
    const handleInterviewResponse = (event: CustomEvent) => {
      const { interviewId } = event.detail as { interviewId: string };
      setViewedInterviewIds(prev => {
        const newSet = new Set(prev).add(interviewId);
        localStorage.setItem('viewedInterviews', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      setInterviewResponsesCount(prev => prev + 1);
    };

    window.addEventListener('interviewResponse', handleInterviewResponse as EventListener);
    return () => window.removeEventListener('interviewResponse', handleInterviewResponse as EventListener);
  }, []);

  const markAsViewed = async (type: 'applications' | 'messages') => {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, markAsViewed: true }),
      });
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error marking notifications as viewed:", error);
    }
  };

  const handleInterviewsClick = () => {
    setInterviewResponsesCount(0);
    fetch("/api/interviews")
      .then(res => res.json())
      .then(interviews => {
        const allInterviewIds = interviews.map((i: any) => i.id);
        const newViewedSet = new Set([...viewedInterviewIds, ...allInterviewIds]);
        setViewedInterviewIds(newViewedSet);
        localStorage.setItem('viewedInterviews', JSON.stringify(Array.from(newViewedSet)));
      })
      .catch(console.error);
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-brand-100 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Image
            src="/je_logo.png"
            alt="JobEscape Careers"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <h1 className="text-lg font-bold text-brand-600">JobEscape</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white border-r border-brand-100 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:static lg:h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-6 border-b border-brand-100 gap-3">
          <Image
            src="/je_logo.png"
            alt="JobEscape Careers"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <h1 className="text-lg font-bold text-brand-600 hidden lg:block">
            JobEscape ATS
          </h1>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                if (item.name === "Dashboard") markAsViewed('applications');
                else if (item.name === "Candidates") markAsViewed('messages');
                else if (item.name === "Interviews") handleInterviewsClick();
              }}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-brand-50 text-brand-600"
                  : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-brand-500" />
              <span className="flex-1">{item.name}</span>
              {item.name === "Dashboard" && notifications.unreadApplications > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {notifications.unreadApplications}
                </Badge>
              )}
              {item.name === "Candidates" && notifications.unreadMessages > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {notifications.unreadMessages}
                </Badge>
              )}
              {item.name === "Interviews" && interviewResponsesCount > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {interviewResponsesCount}
                </Badge>
              )}
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
    </>
  );
}
