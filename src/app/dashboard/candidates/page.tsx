"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { CompactCandidateCard } from "@/components/candidates/CompactCandidateCard";
import { CandidateDetailModal } from "@/components/candidates/CandidateDetailModal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, Users } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    location: string | null;
    skills: string[];
    experience: number | null;
    aiScore: number | null;
    resumeUrl: string | null;
    resumeText: string | null;
    coverLetter: string | null;
    education: string | null;
  };
  job: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CandidatesPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"full" | "compact">("full");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Application status updated to ${newStatus}`);
        fetchApplications();
        if (selectedApplication) {
          setSelectedApplication({
            ...selectedApplication,
            status: newStatus,
          });
        }
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(search.toLowerCase()) ||
      app.candidate.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      app.job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-1">Review and manage all applications</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "full" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("full")}
            className={viewMode === "full" ? "bg-blue-600 rounded-full" : "rounded-full"}
          >
            <List className="w-4 h-4 mr-2" />
            Full View
          </Button>
          <Button
            variant={viewMode === "compact" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("compact")}
            className={viewMode === "compact" ? "bg-blue-600 rounded-full" : "rounded-full"}
          >
            <Grid className="w-4 h-4 mr-2" />
            Compact
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, skills, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setSearch("");
          }}
          className="md:w-48"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="SCREENING">Screening</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card className="border-blue-100">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No applications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "full" ? "grid gap-4" : "grid md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredApplications.map((app) =>
            viewMode === "full" ? (
              <CandidateCard
                key={app.id}
                candidate={{
                  ...app.candidate,
                  applications: [app],
                }}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <div key={app.id} onClick={() => setSelectedApplication(app)}>
                <CompactCandidateCard
                  application={app}
                  onClick={() => setSelectedApplication(app)}
                />
              </div>
            )
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApplication && (
        <CandidateDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
