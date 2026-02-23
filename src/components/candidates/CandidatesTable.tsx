"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Eye, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate, getInitials } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  skills: string[];
  experience: number | null;
  aiScore: number | null;
  status: string;
  source: string;
  createdAt: Date | string;
  applications: {
    id: string;
    status: string;
    appliedAt: Date | string;
    job: {
      id: string;
      title: string;
      slug: string;
    };
  }[];
}

interface CandidatesTableProps {
  initialData?: {
    candidates: Candidate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
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

export function CandidatesTable({ initialData }: CandidatesTableProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(
    initialData?.candidates || []
  );
  const [loading, setLoading] = useState(!initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(initialData?.pagination);

  useEffect(() => {
    fetchCandidates();
  }, [page, statusFilter]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/candidates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchCandidates();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-48"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="SCREENING">Screening</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="HIRED">Hired</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Candidate
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Position
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  AI Score
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Applied
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                        {getInitials(candidate.name)}
                      </div>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-gray-500">
                          {candidate.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {candidate.applications[0] && (
                      <Link
                        href={`/careers/${candidate.applications[0].job.slug}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {candidate.applications[0].job.title}
                      </Link>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {candidate.aiScore !== null && (
                      <Badge
                        variant={
                          candidate.aiScore >= 70
                            ? "success"
                            : candidate.aiScore >= 50
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {candidate.aiScore}/100
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusColors[candidate.status] || "default"}>
                      {candidate.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(candidate.applications[0]?.appliedAt || candidate.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/candidates/${candidate.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * 20 + 1} to{" "}
              {Math.min(page * 20, pagination.total)} of {pagination.total}{" "}
              candidates
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
