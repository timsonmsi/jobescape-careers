"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { X, Mail, Phone, MapPin, Linkedin, ExternalLink, FileText, MessageSquare, Video, CheckCircle, XCircle, Calendar, Star } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { InterviewModal } from "./InterviewModal";

interface CandidateDetailModalProps {
  application: {
    id: string;
    status: string;
    appliedAt: string;
    coverLetter: string | null;
    candidate: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      location: string | null;
      linkedin: string | null;
      website: string | null;
      skills: string[];
      experience: number | null;
      education: string | null;
      aiScore: number | null;
      resumeUrl: string | null;
      resumeText: string | null;
    };
    job: {
      id: string;
      title: string;
      slug: string;
    };
  };
  onClose: () => void;
  onStatusChange: (applicationId: string, newStatus: string) => void;
}

const statusColors: Record<string, "default" | "secondary" | "warning" | "success" | "destructive"> = {
  SUBMITTED: "secondary",
  SCREENING: "warning",
  INTERVIEW: "secondary",
  OFFER: "success",
  HIRED: "success",
  REJECTED: "destructive",
};

const applicationStatusOptions = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "SCREENING", label: "Screening" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
];

export function CandidateDetailModal({ application, onClose, onStatusChange }: CandidateDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  const [showChat, setShowChat] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    onStatusChange(application.id, newStatus);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="my-8">
          <Card className="w-full max-w-4xl border-blue-100 shadow-2xl">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    {application.candidate.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{application.candidate.name}</h2>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {application.candidate.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusColors[application.status] || "default"} className="text-sm">
                    {application.status}
                  </Badge>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="grid md:grid-cols-3 gap-6 p-6 max-h-[70vh] overflow-y-auto">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                  {/* Applied Position */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div className="text-sm font-medium text-gray-900">Applied Position</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{application.job.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Skills */}
                  {application.candidate.skills.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {application.candidate.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience & Education */}
                  <div className="grid grid-cols-2 gap-4">
                    {application.candidate.experience !== null && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Experience</div>
                        <div className="text-sm text-gray-600">{application.candidate.experience} years</div>
                      </div>
                    )}
                    {application.candidate.education && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Education</div>
                        <div className="text-sm text-gray-600">{application.candidate.education}</div>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter */}
                  {application.coverLetter && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Cover Letter</div>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                        {application.coverLetter}
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  {(application.resumeUrl || application.candidate.resumeUrl) && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Resume / CV
                      </div>
                      <a
                        href={`/api/resumes/${application.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Resume
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        Resume: {application.resumeUrl || application.candidate.resumeUrl}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* AI Score */}
                  {application.candidate.aiScore !== null && (
                    <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-4 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <div className="text-sm font-medium text-gray-900">AI Score</div>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {application.candidate.aiScore}/100
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">Contact</div>
                    {(application.phone || application.candidate.phone) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span>{application.phone || application.candidate.phone}</span>
                      </div>
                    )}
                    {(application.location || application.candidate.location) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{application.location || application.candidate.location}</span>
                      </div>
                    )}
                    {(application.linkedin || application.candidate.linkedin) && (
                      <a
                        href={application.linkedin || application.candidate.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {(application.website || application.candidate.website) && (
                      <a
                        href={application.website || application.candidate.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="text-sm font-medium text-gray-700">Actions</div>
                    <Select
                      value={selectedStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full"
                    >
                      {applicationStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setShowChat(true)}
                      className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowInterviewModal(true)}
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange("HIRED")}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Hire
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange("REJECTED")}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Window */}
      {showChat && (
        <ChatWindow
          candidateId={application.candidate.id}
          candidateName={application.candidate.name}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Interview Modal */}
      {showInterviewModal && (
        <InterviewModal
          candidateId={application.candidate.id}
          applicationId={application.id}
          candidateName={application.candidate.name}
          jobTitle={application.job.title}
          onClose={() => setShowInterviewModal(false)}
          onSuccess={() => {
            alert("Interview invite sent!");
            setShowInterviewModal(false);
          }}
        />
      )}
    </>
  );
}
