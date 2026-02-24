"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { JobList } from "@/components/jobs/JobList";
import { ArrowRight, Users, CheckCircle, Sparkles, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

export default function CareersPage() {
  const [candidate, setCandidate] = useState<{ name: string; email: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const candidateName = localStorage.getItem("candidateName");
    const candidateEmail = localStorage.getItem("candidateEmail");
    const candidateId = localStorage.getItem("candidateId");
    
    if (candidateId && candidateName) {
      setCandidate({
        name: candidateName,
        email: candidateEmail || "",
      });
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("candidateId");
    localStorage.removeItem("candidateEmail");
    localStorage.removeItem("candidateName");
    setCandidate(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/je_logo.png"
                alt="JobEscape Careers"
                width={36}
                height={36}
                className="rounded-xl shadow-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:block">
                JobEscape Careers
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent sm:hidden">
                JobEscape
              </span>
            </Link>
            
            {candidate ? (
              <div className="flex items-center gap-3">
                <Link href="/candidate/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    My Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden text-gray-600"
                  >
                    <Users className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                    <div className="text-xs text-gray-500">{candidate.email}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold shadow-lg shadow-blue-500/25">
                    {getInitials(candidate.name)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden text-gray-600"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/candidate/signin"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors hidden sm:block"
                >
                  For Candidates
                </Link>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors hidden sm:block"
                >
                  For Recruiters
                </Link>
                <Link
                  href="/candidate/signin"
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Sign Up
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden text-gray-600"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-brand-100 bg-white px-4 py-3 space-y-3">
            {candidate ? (
              <>
                <Link
                  href="/candidate/dashboard"
                  className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <div className="pt-2 border-t border-brand-100">
                  <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                  <div className="text-xs text-gray-500">{candidate.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700 py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/candidate/signin"
                  className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Candidates
                </Link>
                <Link
                  href="/signin"
                  className="block text-sm font-medium text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  For Recruiters
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Join our team and build the future</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your Dream Job
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                At JobEscape
              </span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              We&apos;re looking for talented people who are passionate about creating 
              amazing experiences. Join us and make an impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
              <a
                href="#jobs"
                onClick={(e) => {
                  e.preventDefault();
                  const jobsSection = document.getElementById('jobs');
                  if (jobsSection) {
                    jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                Browse Open Positions
                <ArrowRight className="w-5 h-5" />
              </a>
              {candidate ? (
                <Link
                  href="/candidate/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all hover:-translate-y-0.5"
                >
                  <Users className="w-5 h-5" />
                  My Applications
                </Link>
              ) : (
                <Link
                  href="/candidate/signin"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all hover:-translate-y-0.5"
                >
                  Create Candidate Account
                  <Users className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl sm:rounded-3xl border border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Exciting Roles</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Discover diverse opportunities across engineering, design, and more. 
                Find the perfect role for your skills.
              </p>
            </div>

            <div className="group p-6 sm:p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl sm:rounded-3xl border border-purple-100 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Great Benefits</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Competitive salary, health insurance, flexible work arrangements, 
                and professional development budget.
              </p>
            </div>

            <div className="group p-6 sm:p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl sm:rounded-3xl border border-green-100 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Innovative Culture</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Work with cutting-edge technology, collaborate with talented teams, 
                and make a real impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="jobs" className="py-12 sm:py-20 bg-gradient-to-br from-white via-brand-50/20 to-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Find your next career opportunity. Filter by department, location, or job type.
            </p>
          </div>

          <JobList />

          {/* CTA Section */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center text-white shadow-2xl shadow-blue-500/25">
            <h3 className="text-xl sm:text-3xl font-bold mb-4">
              Don&apos;t see the right role?
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-6 sm:mb-8 max-w-xl mx-auto px-4 sm:px-0 leading-relaxed">
              We&apos;re always looking for talented people. Create a candidate account and 
              we&apos;ll keep you in mind for future opportunities.
            </p>
            {candidate ? (
              <Link
                href="/candidate/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Go to My Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/candidate/signin"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Create Candidate Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">JobEscape</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              © {new Date().getFullYear()} JobEscape Careers. All rights reserved.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="/privacy" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
