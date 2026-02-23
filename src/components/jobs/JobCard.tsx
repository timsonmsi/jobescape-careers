import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Briefcase, DollarSign, ArrowRight } from "lucide-react";

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

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const jobTypeLabels: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    FREELANCE: "Freelance",
  };

  return (
    <Link href={`/careers/${job.slug}`}>
      <Card className="group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-gray-100 hover:border-blue-200 hover:-translate-y-1 bg-white">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                {job.department && (
                  <p className="text-sm text-gray-500 mt-1.5">{job.department}</p>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-500" />
                {job.location}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Briefcase className="w-4 h-4 text-blue-500" />
                {jobTypeLabels[job.type] || job.type}
              </div>
              {job.salaryMin && job.salaryMax && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  {formatCurrency(job.salaryMin, job.currency)} -{" "}
                  {formatCurrency(job.salaryMax, job.currency)}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Badge 
                variant="secondary" 
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                {jobTypeLabels[job.type] || job.type}
              </Badge>
              {job.department && (
                <Badge 
                  variant="outline" 
                  className="bg-gray-50 text-gray-700 border-gray-200"
                >
                  {job.department}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
