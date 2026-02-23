"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X, Calendar, Clock, Video, Phone, MapPin } from "lucide-react";

interface InterviewModalProps {
  candidateId: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function InterviewModal({
  candidateId,
  applicationId,
  candidateName,
  jobTitle,
  onClose,
  onSuccess,
}: InterviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "VIDEO",
    scheduledAt: "",
    duration: "30",
    location: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/interview-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          applicationId,
          ...formData,
          scheduledAt: new Date(formData.scheduledAt).toISOString(),
          duration: parseInt(formData.duration),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Failed to send interview invite");
      }
    } catch (error) {
      console.error("Error sending interview invite:", error);
      alert("Failed to send interview invite");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="w-5 h-5" />;
      case "PHONE":
        return <Phone className="w-5 h-5" />;
      case "ONSITE":
        return <MapPin className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg border-blue-100 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Invite {candidateName} for {jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Interview Type
                </Label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="h-11 rounded-xl border-gray-200"
                >
                  <option value="VIDEO">Video Call</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="ONSITE">On-site</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Duration
                </Label>
                <Select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="h-11 rounded-xl border-gray-200"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt" className="text-sm font-medium text-gray-700">
                Date & Time *
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledAt: e.target.value })
                }
                required
                className="h-11 rounded-xl border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location / Link *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder={
                  formData.type === "VIDEO"
                    ? "Zoom/Google Meet link"
                    : formData.type === "PHONE"
                    ? "Phone number"
                    : "Office address"
                }
                required
                className="h-11 rounded-xl border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Additional Notes
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional information for the candidate..."
                className="w-full min-h-[100px] p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Candidate receives an email notification</li>
                    <li>• They can accept or decline the invite</li>
                    <li>• You'll be notified of their response</li>
                    <li>• If accepted, interview is added to schedule</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Interview Invite"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 rounded-full"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
