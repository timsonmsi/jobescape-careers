"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Bell, CheckCircle, Clock, XCircle, LogOut, Calendar, FileText, ChevronRight, User, MessageSquare, MapPin } from "lucide-react";
import Link from "next/link";
import { CandidateChat } from "@/components/candidates/CandidateChat";
import Image from "next/image";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    slug: string;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"applications" | "interviews" | "notifications">("applications");
  const [interviewInvites, setInterviewInvites] = useState<any[]>([]);
  const [unreadChatMessages, setUnreadChatMessages] = useState(0);

  useEffect(() => {
    const candidateId = localStorage.getItem("candidateId");
    if (!candidateId) {
      router.push("/candidate/signin");
      return;
    }

    fetchCandidateData(candidateId);
  }, [router]);

  const fetchCandidateData = async (candidateId: string) => {
    try {
      const [candidateRes, appsRes, notifRes, invitesRes] = await Promise.all([
        fetch(`/api/candidates/${candidateId}`),
        fetch(`/api/candidates/${candidateId}/applications`),
        fetch(`/api/notifications?candidateId=${candidateId}&unreadOnly=false`),
        fetch(`/api/candidates/${candidateId}/interview-invites`),
      ]);

      if (candidateRes.ok) {
        const candidateData = await candidateRes.json();
        setCandidate(candidateData);
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        // Filter out MESSAGE notifications (those go to chat)
        const filteredNotifications = notifData.filter(
          (n: Notification) => n.type !== "MESSAGE"
        );
        setNotifications(filteredNotifications);
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInterviewInvites(invitesData);
      }
      
      // Fetch unread chat messages count
      try {
        const chatRes = await fetch(`/api/candidates/${candidateId}/messages`);
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          const unreadCount = chatData.filter((m: any) => !m.read).length;
          setUnreadChatMessages(unreadCount);
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error);
      }
    } catch (error) {
      console.error("Error fetching candidate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("candidateId");
    localStorage.removeItem("candidateEmail");
    localStorage.removeItem("candidateName");
    router.push("/candidate/signin");
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(
        unreadIds.map(id =>
          fetch(`/api/notifications/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const respondToInterview = async (inviteId: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      const response = await fetch(`/api/interview-invites/${inviteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          candidateResponse: status === "ACCEPTED" ? "Looking forward to it!" : "Thank you, but I must decline.",
        }),
      });

      if (response.ok) {
        alert(`Interview ${status.toLowerCase()}!`);
        fetchCandidateData(localStorage.getItem("candidateId")!);
      }
    } catch (error) {
      console.error("Error responding to interview:", error);
      alert("Failed to respond to interview invite");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingMessage(true);
    try {
      const candidateId = localStorage.getItem("candidateId");
      const response = await fetch(`/api/candidates/${candidateId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: candidate?.name || "Candidate",
          content: replyMessage,
        }),
      });

      if (response.ok) {
        setReplyMessage("");
        fetchCandidateData(candidateId!);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Mark all messages as read when viewing inbox
  const markMessagesAsRead = async () => {
    try {
      const unreadMessages = messages.filter((m) => !m.read);
      if (unreadMessages.length === 0) return;
      
      await Promise.all(
        unreadMessages.map((msg) =>
          fetch(`/api/messages/${msg.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      fetchCandidateData(localStorage.getItem("candidateId")!);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Clock className="w-4 h-4" />;
      case "SCREENING":
        return <CheckCircle className="w-4 h-4" />;
      case "INTERVIEW":
        return <Calendar className="w-4 h-4" />;
      case "OFFER":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "HIRED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "secondary";
      case "SCREENING":
        return "warning";
      case "INTERVIEW":
        return "secondary";
      case "OFFER":
      case "HIRED":
        return "success";
      case "REJECTED":
        return "destructive";
      default:
        return "default";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPLICATION_RECEIVED":
        return <FileText className="w-5 h-5" />;
      case "APPLICATION_REVIEWED":
        return <CheckCircle className="w-5 h-5" />;
      case "INTERVIEW_SCHEDULED":
        return <Calendar className="w-5 h-5" />;
      case "OFFER_SENT":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "HIRED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/careers" className="flex items-center gap-2.5">
              <Image
                src="/je_logo.png"
                alt="JobEscape"
                width={36}
                height={36}
                className="rounded-lg shadow-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                JobEscape Careers
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/careers">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  Browse Jobs
                </Button>
              </Link>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">{candidate?.name}</div>
                <div className="text-xs text-gray-500">{candidate?.email}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600">
            Track your applications and stay updated with notifications
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "applications" ? "default" : "outline"}
            onClick={() => setActiveTab("applications")}
            className={activeTab === "applications" ? "bg-blue-600 hover:bg-blue-700 rounded-full" : "rounded-full"}
          >
            <FileText className="w-4 h-4 mr-2" />
            Applications
            {applications.length > 0 && (
              <Badge variant="secondary" className="ml-2">{applications.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "interviews" ? "default" : "outline"}
            onClick={() => setActiveTab("interviews")}
            className={activeTab === "interviews" ? "bg-blue-600 hover:bg-blue-700 rounded-full" : "rounded-full"}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Interviews
            {interviewInvites.filter(i => i.status === "PENDING").length > 0 && (
              <Badge variant="default" className="ml-2 bg-red-500">
                {interviewInvites.filter(i => i.status === "PENDING").length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "notifications" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("notifications");
              // Mark notifications as read when opening
              setTimeout(() => markAllAsRead(), 500);
            }}
            className={activeTab === "notifications" ? "bg-blue-600 hover:bg-blue-700 rounded-full" : "rounded-full"}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge variant="default" className="ml-2 bg-red-500">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Application History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-2">No applications yet</p>
                    <p className="text-sm mb-6">Start applying to jobs to track your progress</p>
                    <Link href="/careers">
                      <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
                        Browse Open Positions
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            app.status === "REJECTED" ? "bg-red-50" :
                            app.status === "HIRED" || app.status === "OFFER" ? "bg-green-50" :
                            "bg-blue-50"
                          }`}>
                            <div className={
                              app.status === "REJECTED" ? "text-red-600" :
                              app.status === "HIRED" || app.status === "OFFER" ? "text-green-600" :
                              "text-blue-600"
                            }>
                              {getStatusIcon(app.status)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {app.job.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              Applied {new Date(app.appliedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={getStatusColor(app.status)} className="text-sm">
                            {app.status}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Notifications
                  </CardTitle>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No notifications</p>
                    <p className="text-sm">You&apos;ll receive updates about your applications here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all ${
                          notif.read
                            ? "bg-gray-50 border border-gray-100"
                            : "bg-gradient-to-r from-blue-50 to-white border border-blue-200 shadow-sm"
                        } hover:shadow-md`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            notif.read ? "bg-gray-100" : "bg-blue-100"
                          }`}>
                            <div className={notif.read ? "text-gray-500" : "text-blue-600"}>
                              {getNotificationIcon(notif.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                  {notif.title}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 leading-relaxed">
                                  {notif.message}
                                </div>
                                <div className="text-xs text-gray-500 mt-3">
                                  {new Date(notif.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </div>
                              </div>
                              {!notif.read && (
                                <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === "interviews" && (
          <div className="space-y-4">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Interview Invites
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interviewInvites.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No interview invites</p>
                    <p className="text-sm">When you receive an invite, it will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviewInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className={`p-5 rounded-2xl border ${
                          invite.status === "PENDING"
                            ? "bg-gradient-to-r from-blue-50 to-white border-blue-200"
                            : invite.status === "ACCEPTED"
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge
                                variant={
                                  invite.status === "PENDING"
                                    ? "warning"
                                    : invite.status === "ACCEPTED"
                                    ? "success"
                                    : "destructive"
                                }
                              >
                                {invite.status}
                              </Badge>
                              <div className="font-semibold text-gray-900">
                                {invite.application.job.title}
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                {new Date(invite.scheduledAt).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                {invite.duration} minutes • {invite.type}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                {invite.location}
                              </div>
                            </div>
                            {invite.notes && (
                              <div className="mt-3 p-3 bg-white rounded-lg text-sm text-gray-700">
                                <strong>Note:</strong> {invite.notes}
                              </div>
                            )}
                            {invite.status === "PENDING" && (
                              <div className="flex gap-3 mt-4">
                                <Button
                                  onClick={() => respondToInterview(invite.id, "ACCEPTED")}
                                  className="bg-green-600 hover:bg-green-700 rounded-full"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  onClick={() => respondToInterview(invite.id, "DECLINED")}
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            )}
                            {invite.status !== "PENDING" && invite.candidateResponse && (
                              <div className="mt-3 p-3 bg-white rounded-lg text-sm text-gray-700">
                                <strong>Your response:</strong> {invite.candidateResponse}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No messages</p>
                    <p className="text-sm">Recruiters can send you messages about your applications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-5 rounded-2xl border ${
                          message.read
                            ? "bg-gray-50 border-gray-100"
                            : "bg-gradient-to-r from-blue-50 to-white border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            message.read ? "bg-gray-100" : "bg-blue-100"
                          }`}>
                            <User className={`w-5 h-5 ${message.read ? "text-gray-500" : "text-blue-600"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold text-gray-900">
                                {message.senderName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Box */}
                {messages.length > 0 && (
                  <form onSubmit={sendMessage} className="mt-6 pt-6 border-t border-gray-100">
                    <Label htmlFor="reply" className="text-sm font-medium text-gray-700 mb-2">
                      Reply to messages
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="reply"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 h-11 rounded-full border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        disabled={sendingMessage}
                      />
                      <Button
                        type="submit"
                        className="h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full"
                        disabled={sendingMessage || !replyMessage.trim()}
                      >
                        {sendingMessage ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Floating Chat Window */}
      {candidate && (
        <CandidateChat 
          candidateId={candidate.id} 
          candidateName={candidate.name}
          onUnreadCountChange={(count) => setUnreadChatMessages(count)}
        />
      )}
    </div>
  );
}
