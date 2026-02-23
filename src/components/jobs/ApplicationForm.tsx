"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, CheckCircle, AlertCircle, Sparkles, User } from "lucide-react";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  location: string;
  type: string;
  department: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
}

interface ApplicationFormProps {
  job: Job;
}

export function ApplicationForm({ job }: ApplicationFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if candidate is logged in and prefill data
    const name = localStorage.getItem("candidateName");
    const email = localStorage.getItem("candidateEmail");
    const candidateId = localStorage.getItem("candidateId");
    
    if (candidateId && name) {
      setIsLoggedIn(true);
      setCandidateName(name);
      setCandidateEmail(email || "");
      
      // Also prefill form data
      setFormData(prev => ({
        ...prev,
        name: name,
        email: email || "",
      }));
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    website: "",
    location: "",
    coverLetter: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const candidateId = localStorage.getItem("candidateId");
    if (!candidateId) {
      alert("Please sign in to apply");
      router.push("/candidate/signin");
      return;
    }

    try {
      const formDataToSend = new FormData();
      if (resumeFile) {
        formDataToSend.append("resume", resumeFile);
        console.log("Resume file:", resumeFile.name, resumeFile.size, resumeFile.type);
      } else {
        console.log("No resume file attached");
      }
      
      const candidateData = {
        id: candidateId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin,
        website: formData.website,
        location: formData.location,
        coverLetter: formData.coverLetter,
      };
      
      console.log("Candidate data:", candidateData);
      console.log("Job ID:", job.id);
      
      formDataToSend.append(
        "candidate",
        JSON.stringify(candidateData)
      );
      formDataToSend.append("jobId", job.id);
      formDataToSend.append("answers", JSON.stringify([]));

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", result);

      if (response.ok) {
        setAiAnalysis(result.aiAnalysis);
        setSubmitted(true);
      } else {
        const errorMsg = result.error || `Failed with status ${response.status}`;
        console.error("Application error:", errorMsg);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(`Failed to submit: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-blue-100 shadow-xl shadow-blue-500/10">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Application Submitted!
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for applying to <span className="font-semibold text-gray-900">{job.title}</span>. 
            We&apos;ll review your application and get back to you soon.
          </p>

          {aiAnalysis && (
            <div className="text-left bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 mb-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">AI Analysis</h4>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-gray-600">Match Score:</span>
                <Badge
                  variant={
                    (aiAnalysis.score || 0) >= 70
                      ? "success"
                      : (aiAnalysis.score || 0) >= 50
                      ? "warning"
                      : "destructive"
                  }
                  className="text-sm"
                >
                  {aiAnalysis.score || 0}/100
                </Badge>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{aiAnalysis.summary}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push("/candidate/dashboard")}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full"
            >
              Go to My Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => (window.location.href = "/careers")}
              className="w-full h-12 rounded-full"
            >
              Browse More Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If not logged in, show sign-in prompt
  if (!isLoggedIn) {
    return (
      <Card className="border-blue-100 shadow-xl shadow-blue-500/10">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Sign in to Apply
          </h3>
          <p className="text-gray-600 mb-6">
            Create an account or sign in to submit your application and track your progress
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push("/candidate/signin")}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full"
            >
              Sign In / Register
            </Button>
            <Button 
              variant="outline"
              onClick={() => (window.location.href = "/careers")}
              className="w-full h-11 rounded-full"
            >
              Back to Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-blue-100 shadow-xl shadow-blue-500/10">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {candidateName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{candidateName}</div>
              <div className="text-sm text-gray-500">Apply as candidate</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
                className="h-11 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Resume *</Label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-700 font-medium">
                {resumeFile ? (
                  <span className="flex items-center justify-center gap-2">
                    {resumeFile.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ) : (
                  "Click to upload your resume"
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1.5">
                PDF, DOC, DOCX, or TXT (max 10MB)
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="text-sm font-medium text-gray-700">Cover Letter</Label>
            <textarea
              id="coverLetter"
              className="w-full min-h-[120px] p-4 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all resize-none"
              placeholder="Tell us why you're interested in this role..."
              value={formData.coverLetter}
              onChange={(e) =>
                setFormData({ ...formData, coverLetter: e.target.value })
              }
            />
          </div>

          <div className="flex items-start gap-2.5 text-sm text-gray-600 bg-blue-50 p-4 rounded-xl">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
            <p className="leading-relaxed">
              By submitting this application, you agree to our Privacy Policy and consent to the processing of your personal information.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Submitting...
              </span>
            ) : (
              "Submit Application"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
