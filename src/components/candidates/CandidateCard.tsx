"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { CheckCircle, XCircle, Calendar, Mail, Phone, MapPin, Linkedin, ExternalLink, FileText, MessageSquare, Video, Star } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { InterviewModal } from "./InterviewModal";

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    linkedin: string | null;
    location: string | null;
    skills: string[];
    experience: number | null;
    education: string | null;
    aiScore: number | null;
    status: string;
    applications: {
      id: string;
      status: string;
      appliedAt: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      linkedin: string | null;
      website: string | null;
      coverLetter: string | null;
      resumeUrl: string | null;
      job: {
        title: string;
        slug: string;
      };
    }[];
  };
  onStatusChange: (applicationId: string, newStatus: string) => void;
  unreadMessages?: number;
}

const statusColors: Record<string, "default" | "secondary" | "warning" | "success" | "destructive"> = {
  NEW: "default",
  CONTACTED: "secondary",
  SCREENING: "warning",
  INTERVIEW: "secondary",
  OFFER: "success",
  HIRED: "success",
  REJECTED: "destructive",
  BLACKLISTED: "destructive",
};

const applicationStatusOptions = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "SCREENING", label: "Screening" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
];

export function CandidateCard({ candidate, onStatusChange, unreadMessages }: CandidateCardProps) {
  const [selectedStatus, setSelectedStatus] = useState(candidate.applications[0]?.status || "SUBMITTED");
  const [selectedApplicationId, setSelectedApplicationId] = useState(candidate.applications[0]?.id);
  const [showChat, setShowChat] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [refreshUnread, setRefreshUnread] = useState(0);

  // Get the selected application data
  const selectedApp = candidate.applications.find(a => a.id === selectedApplicationId) || candidate.applications[0];

  // Debug logging
  useEffect(() => {
    console.log("=== CANDIDATE CARD DEBUG ===");
    console.log("selectedApp:", selectedApp);
    console.log("candidate:", candidate);
    console.log("phone from app:", selectedApp?.phone, "from candidate:", candidate.phone);
    console.log("resumeUrl from app:", selectedApp?.resumeUrl, "from candidate:", candidate.resumeUrl);
    console.log("coverLetter from app:", selectedApp?.coverLetter);
    console.log("application ID for resume:", selectedApp?.id || candidate.applications[0]?.id);
    console.log("===========================");
  }, [selectedApp, candidate]);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (selectedApplicationId) {
      onStatusChange(selectedApplicationId, newStatus);
    }
  };

  const handleApplicationChange = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    const app = candidate.applications.find(a => a.id === applicationId);
    if (app) {
      setSelectedStatus(app.status);
    }
  };

  // Trigger refresh of unread count
  const triggerRefreshUnread = () => {
    setRefreshUnread(prev => prev + 1);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-blue-100">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                {candidate.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-gray-900">{candidate.name}</h3>
                  {unreadMessages && unreadMessages > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {unreadMessages}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{candidate.email}</p>
                {selectedApp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Applied: {new Date(selectedApp.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {candidate.aiScore !== null && (
                <Badge variant={candidate.aiScore >= 70 ? "success" : candidate.aiScore >= 50 ? "warning" : "destructive"} className="shadow-sm">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {candidate.aiScore}/100
                </Badge>
              )}
              <Badge variant={statusColors[candidate.status] || "default"}>
                {candidate.status}
              </Badge>
            </div>
          </div>

          {/* Applied Position */}
          {candidate.applications[0] && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">Applied for</div>
              <div className="font-medium text-gray-900">{candidate.applications[0].job.title}</div>
            </div>
          )}

          {/* Contact Info */}
          <div className="grid sm:grid-cols-2 gap-3">
            {(selectedApp?.phone || candidate.phone) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>{selectedApp?.phone || candidate.phone}</span>
              </div>
            )}
            {(selectedApp?.location || candidate.location) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{selectedApp?.location || candidate.location}</span>
              </div>
            )}
            {selectedApp?.linkedin && (
              <a
                href={selectedApp.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {selectedApp?.website && (
              <a
                href={selectedApp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.slice(0, 8).map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {candidate.skills.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{candidate.skills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Experience & Education */}
          <div className="grid sm:grid-cols-2 gap-4">
            {candidate.experience !== null && (
              <div>
                <div className="text-sm font-medium text-gray-700">Experience</div>
                <div className="text-sm text-gray-600">{candidate.experience} years</div>
              </div>
            )}
            {candidate.education && (
              <div>
                <div className="text-sm font-medium text-gray-700">Education</div>
                <div className="text-sm text-gray-600">{candidate.education}</div>
              </div>
            )}
          </div>

          {/* Resume & Cover Letter Section */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {(selectedApp?.resumeUrl || candidate.resumeUrl) ? (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Resume / CV
                </div>
                <a
                  href={`/api/resumes/${selectedApp?.id || candidate.applications[0]?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Resume
                </a>
                <div className="text-xs text-gray-500 mt-1">
                  Resume URL: {selectedApp?.resumeUrl || candidate.resumeUrl}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No resume uploaded
              </div>
            )}

            {selectedApp?.coverLetter ? (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Cover Letter
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">
                  {selectedApp.coverLetter}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No cover letter provided
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {candidate.applications.length > 1 && (
              <Select
                value={selectedApplicationId}
                onChange={(e) => handleApplicationChange(e.target.value)}
                className="flex-1 min-w-[200px]"
              >
                {candidate.applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.job.title} ({app.status})
                  </option>
                ))}
              </Select>
            )}
            <Select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="flex-1 min-w-[150px]"
            >
              {applicationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(true)}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInterviewModal(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Video className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => handleStatusChange("HIRED")}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Hire
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleStatusChange("REJECTED")}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Chat Window */}
      {showChat && (
        <ChatWindow
          candidateId={candidate.id}
          candidateName={candidate.name}
          onClose={() => setShowChat(false)}
          onMessagesRead={triggerRefreshUnread}
        />
      )}

      {/* Interview Modal */}
      {showInterviewModal && candidate.applications[0] && (
        <InterviewModal
          candidateId={candidate.id}
          applicationId={candidate.applications[0].id}
          candidateName={candidate.name}
          jobTitle={candidate.applications[0].job.title}
          onClose={() => setShowInterviewModal(false)}
          onSuccess={() => {
            alert("Interview invite sent! Candidate will be notified.");
          }}
        />
      )}
    </Card>
  );
}
