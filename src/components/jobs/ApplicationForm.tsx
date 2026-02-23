"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

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
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    try {
      const formDataToSend = new FormData();
      if (resumeFile) {
        formDataToSend.append("resume", resumeFile);
      }
      formDataToSend.append(
        "candidate",
        JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          linkedin: formData.linkedin,
          website: formData.website,
          location: formData.location,
          coverLetter: formData.coverLetter,
        })
      );
      formDataToSend.append("jobId", job.id);
      formDataToSend.append("answers", JSON.stringify([]));

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        setAiAnalysis(result.aiAnalysis);
        setSubmitted(true);
      } else {
        alert(result.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Application Submitted!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for applying to {job.title}. We&apos;ll review your application and
            get back to you soon.
          </p>

          {aiAnalysis && (
            <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">AI Analysis</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">Match Score:</span>
                <Badge
                  variant={
                    (aiAnalysis.score || 0) >= 70
                      ? "success"
                      : (aiAnalysis.score || 0) >= 50
                      ? "warning"
                      : "destructive"
                  }
                >
                  {aiAnalysis.score || 0}/100
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{aiAnalysis.summary}</p>
              {aiAnalysis.strengths?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Strengths:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {aiAnalysis.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <Button onClick={() => (window.location.href = "/careers")}>
            Browse More Jobs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Step 1: Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedin: e.target.value })
                  }
                  placeholder="linkedin.com/in/..."
                />
              </div>
              <div>
                <Label htmlFor="website">Website/Portfolio</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Step 2: Resume */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resume *</h3>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
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
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {resumeFile ? (
                  <span className="flex items-center justify-center gap-2">
                    {resumeFile.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ) : (
                  "Click to upload or drag and drop"
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, or TXT (max 10MB)
              </p>
            </div>
          </div>

          {/* Step 3: Cover Letter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cover Letter</h3>
            <textarea
              className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Tell us why you're interested in this role and what makes you a great fit..."
              value={formData.coverLetter}
              onChange={(e) =>
                setFormData({ ...formData, coverLetter: e.target.value })
              }
            />
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              By submitting this application, you agree to our{" "}
              <a href="/privacy" className="underline">
                Privacy Policy
              </a>{" "}
              and consent to the processing of your personal information.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
