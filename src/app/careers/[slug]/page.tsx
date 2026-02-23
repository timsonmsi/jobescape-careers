import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/jobs/ApplicationForm";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, DollarSign, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/careers"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>
              {job.department && (
                <p className="text-lg text-gray-600">{job.department}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-5 h-5" />
                {jobTypeLabels[job.type] || job.type}
              </div>
              {job.salaryMin && job.salaryMax && (
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-5 h-5" />
                  {formatCurrency(job.salaryMin, job.currency)} -{" "}
                  {formatCurrency(job.salaryMax, job.currency)}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  About the Role
                </h2>
                <div
                  className="text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </section>

              {job.requirements.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Requirements
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {job.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </section>
              )}

              {job.responsibilities.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Responsibilities
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {job.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </section>
              )}

              {job.benefits.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Benefits
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {job.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar - Application Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ApplicationForm job={job} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
