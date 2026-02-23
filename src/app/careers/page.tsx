import Link from "next/link";
import { JobList } from "@/components/jobs/JobList";
import { Briefcase, ArrowRight } from "lucide-react";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              <span className="text-xl font-bold">JobEscape</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              For Recruiters →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Help us build the future of work. We&apos;re looking for talented people
            who are passionate about creating amazing experiences.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Open Positions
          </h2>
          <p className="text-gray-600">
            Find your next career opportunity. Filter by department, location, or
            job type.
          </p>
        </div>

        <JobList />

        {/* CTA Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Don&apos;t see the right role?
            </h3>
            <p className="text-gray-600 mb-6">
              We&apos;re always looking for talented people. Send us your resume and
              we&apos;ll keep you in mind for future opportunities.
            </p>
            <Link
              href="/careers/general-application"
              className="inline-flex items-center gap-2 text-gray-900 font-medium hover:underline"
            >
              Submit General Application
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              <span className="font-semibold">JobEscape</span>
            </div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} JobEscape. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
