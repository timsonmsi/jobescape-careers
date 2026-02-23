import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/jobs/ApplicationForm";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, DollarSign, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: {
    slug: string;
  };
}

async function getJob(slug: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { slug },
    });
    return job;
  } catch (error) {
    return null;
  }
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
};

export default async function JobDetailPage({ params }: PageProps) {
  const job = await getJob(params.slug);

  if (!job || job.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/careers"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Jobs</span>
            </Link>
            <Link
              href="/careers"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              View All Jobs
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  {job.department && (
                    <p className="text-lg text-gray-600">{job.department}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-medium">{job.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Job Type</div>
                      <div className="font-medium">{jobTypeLabels[job.type] || job.type}</div>
                    </div>
                  </div>
                  {job.salaryMin && job.salaryMax && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Salary Range</div>
                        <div className="font-medium">
                          {formatCurrency(job.salaryMin, job.currency)} -{" "}
                          {formatCurrency(job.salaryMax, job.currency)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">About the Role</h2>
              </div>
              <div
                className="text-gray-700 prose prose-sm max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Requirements</h2>
                </div>
                <ul className="space-y-3">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Responsibilities</h2>
                </div>
                <ul className="space-y-3">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Benefits</h2>
                </div>
                <ul className="space-y-3">
                  {job.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar - Application Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ApplicationForm job={job} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
