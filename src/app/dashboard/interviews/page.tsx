"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, XCircle, Clock, Video, Phone, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface InterviewInvite {
  id: string;
  type: string;
  scheduledAt: string;
  duration: number;
  location: string;
  notes: string | null;
  status: string;
  candidateResponse: string | null;
  respondedAt: string | null;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  application: {
    id: string;
    job: {
      title: string;
    };
  };
  interviewer: {
    name: string | null;
    email: string | null;
  } | null;
}

export default function InterviewsPage() {
  const [invites, setInvites] = useState<InterviewInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch("/api/interviews");
      if (response.ok) {
        const data = await response.json();
        setInvites(data);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "ACCEPTED":
        return "success";
      case "DECLINED":
        return "destructive";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-4 h-4" />;
      case "PHONE":
        return <Phone className="w-4 h-4" />;
      case "ONSITE":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredInvites = filter
    ? invites.filter((i) => i.status === filter)
    : invites;

  const stats = {
    total: invites.length,
    pending: invites.filter((i) => i.status === "PENDING").length,
    accepted: invites.filter((i) => i.status === "ACCEPTED").length,
    declined: invites.filter((i) => i.status === "DECLINED").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="text-gray-600 mt-1">
          Track interview invites and candidate responses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <div className="text-sm text-gray-600">Declined</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "" ? "default" : "outline"}
          onClick={() => setFilter("")}
          className={filter === "" ? "bg-blue-600 rounded-full" : "rounded-full"}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filter === "PENDING" ? "default" : "outline"}
          onClick={() => setFilter("PENDING")}
          className={filter === "PENDING" ? "bg-yellow-600 rounded-full" : "rounded-full"}
          size="sm"
        >
          Pending
        </Button>
        <Button
          variant={filter === "ACCEPTED" ? "default" : "outline"}
          onClick={() => setFilter("ACCEPTED")}
          className={filter === "ACCEPTED" ? "bg-green-600 rounded-full" : "rounded-full"}
          size="sm"
        >
          Accepted
        </Button>
        <Button
          variant={filter === "DECLINED" ? "default" : "outline"}
          onClick={() => setFilter("DECLINED")}
          className={filter === "DECLINED" ? "bg-red-600 rounded-full" : "rounded-full"}
          size="sm"
        >
          Declined
        </Button>
      </div>

      {/* Interview List */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Interview Invites
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredInvites.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No interview invites found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvites.map((invite) => (
                <div
                  key={invite.id}
                  className={`p-5 rounded-2xl border ${
                    invite.status === "PENDING"
                      ? "bg-gradient-to-r from-yellow-50 to-white border-yellow-200"
                      : invite.status === "ACCEPTED"
                      ? "bg-gradient-to-r from-green-50 to-white border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          invite.status === "PENDING"
                            ? "bg-yellow-100"
                            : invite.status === "ACCEPTED"
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}>
                          <div className={
                            invite.status === "PENDING"
                              ? "text-yellow-600"
                              : invite.status === "ACCEPTED"
                              ? "text-green-600"
                              : "text-gray-600"
                          }>
                            {getTypeIcon(invite.type)}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {invite.candidate.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {invite.application.job.title}
                          </div>
                        </div>
                        <Badge
                          variant={getStatusColor(invite.status)}
                          className="ml-auto"
                        >
                          {invite.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 ml-13">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Date & Time:</span>
                            {new Date(invite.scheduledAt).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Duration:</span>
                            {invite.duration} minutes
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Location:</span>
                            {invite.location}
                          </div>
                        </div>

                        {invite.status !== "PENDING" && (
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              {invite.status === "ACCEPTED" ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium">Candidate Response:</span>
                            </div>
                            {invite.candidateResponse && (
                              <div className="p-3 bg-white rounded-lg text-gray-700 italic">
                                "{invite.candidateResponse}"
                              </div>
                            )}
                            {invite.respondedAt && (
                              <div className="text-gray-600">
                                Responded: {formatDate(invite.respondedAt)}
                              </div>
                            )}
                          </div>
                        )}

                        {invite.notes && (
                          <div className="md:col-span-2">
                            <div className="p-3 bg-white rounded-lg text-sm text-gray-700">
                              <strong>Notes:</strong> {invite.notes}
                            </div>
                          </div>
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
  );
}
