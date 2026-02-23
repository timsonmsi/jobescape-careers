import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Briefcase, DollarSign } from "lucide-react";

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
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
              {job.department && (
                <p className="text-sm text-gray-500 mt-1">{job.department}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="w-4 h-4 mr-1" />
                {jobTypeLabels[job.type] || job.type}
              </div>
              {job.salaryMin && job.salaryMax && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {formatCurrency(job.salaryMin, job.currency)} -{" "}
                  {formatCurrency(job.salaryMax, job.currency)}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">{jobTypeLabels[job.type] || job.type}</Badge>
              {job.department && <Badge variant="outline">{job.department}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
