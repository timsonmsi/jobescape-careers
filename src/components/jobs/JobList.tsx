"use client";

import { useEffect, useState } from "react";
import { JobCard } from "./JobCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

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
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search jobs by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-gray-200 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="pl-12 h-12 w-full md:w-48 rounded-2xl border-gray-200 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <Select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="pl-12 h-12 w-full md:w-48 rounded-2xl border-gray-200 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FREELANCE">Freelance</option>
          </Select>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search term</p>
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
