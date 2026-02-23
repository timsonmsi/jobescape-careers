"use client";

import { useEffect, useState } from "react";
import { JobCard } from "./JobCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  type: string;
  department: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  publishedAt: string | null;
}

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [jobType, setJobType] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [department, jobType]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (department) params.set("department", department);
      if (jobType) params.set("type", jobType);

      const response = await fetch(`/api/jobs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  const departments = Array.from(
    new Set(jobs.map((j) => j.department).filter((d): d is string => Boolean(d)))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="md:w-48"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept!}>
              {dept}
            </option>
          ))}
        </Select>
        <Select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="md:w-48"
        >
          <option value="">All Types</option>
          <option value="FULL_TIME">Full-time</option>
          <option value="PART_TIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="FREELANCE">Freelance</option>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No jobs found matching your criteria.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
