"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Mail, MapPin, Star, MessageSquare, Phone } from "lucide-react";

interface CompactCandidateCardProps {
  application: {
    id: string;
    status: string;
    appliedAt: string;
    // Application-specific fields (from application record)
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
    website?: string | null;
    coverLetter?: string | null;
    resumeUrl?: string | null;
    // Candidate fields (fallback)
    candidate: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      location: string | null;
      aiScore: number | null;
      skills: string[];
    };
    job: {
      id: string;
      title: string;
    };
    unreadMessages?: number;
  };
  onClick: () => void;
}

export function CompactCandidateCard({ application, onClick }: CompactCandidateCardProps) {
  // Use application-specific data if available, otherwise use candidate data
  // For new applications, data is stored in the application record
  const name = application.name || application.candidate.name;
  const email = application.email || application.candidate.email;
  const phone = application.phone || application.candidate.phone;
  const location = application.location || application.candidate.location;
  
  const statusColors: Record<string, "default" | "secondary" | "warning" | "success" | "destructive"> = {
    SUBMITTED: "secondary",
    SCREENING: "warning",
    INTERVIEW: "secondary",
    OFFER: "success",
    HIRED: "success",
    REJECTED: "destructive",
  };
  
  // Debug logging
  useEffect(() => {
    console.log("=== COMPACT CARD DEBUG ===");
    console.log("application:", application);
    console.log("unreadMessages:", application.unreadMessages);
    console.log("========================");
  }, [application]);
  
  return (
    <Card 
      onClick={onClick}
      className="hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer border-gray-100 hover:border-blue-200 group"
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {name}
                  </h3>
                  {application.unreadMessages && application.unreadMessages > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {application.unreadMessages}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{email}</span>
                </div>
              </div>
            </div>
            <Badge variant={statusColors[application.status] || "default"} className="text-xs">
              {application.status}
            </Badge>
          </div>

          {/* Job Position */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="truncate">{application.job.title}</span>
          </div>

          {/* Contact Info - Show if available */}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            {phone ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                <span>{phone}</span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">No phone</div>
            )}
            {location ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">No location</div>
            )}
          </div>

          {/* AI Score & Skills */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {application.candidate.aiScore !== null && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  {application.candidate.aiScore}/100
                </span>
              </div>
            )}
            {application.candidate.skills.length > 0 && (
              <div className="flex gap-1">
                {application.candidate.skills.slice(0, 3).map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-gray-50">
                    {skill}
                  </Badge>
                ))}
                {application.candidate.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-50">
                    +{application.candidate.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
