import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, Calendar } from "lucide-react";

interface DashboardStatsProps {
  totalCandidates: number;
  totalJobs: number;
  totalApplications: number;
  totalInterviews: number;
  newCandidates: number;
  publishedJobs: number;
}

export function DashboardStats({
  totalCandidates,
  totalJobs,
  totalApplications,
  totalInterviews,
  newCandidates,
  publishedJobs,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Candidates",
      value: totalCandidates,
      change: `+${newCandidates} new`,
      icon: Users,
    },
    {
      title: "Active Jobs",
      value: publishedJobs,
      change: `${totalJobs} total`,
      icon: Briefcase,
    },
    {
      title: "Applications",
      value: totalApplications,
      change: "All time",
      icon: FileText,
    },
    {
      title: "Interviews",
      value: totalInterviews,
      change: "Scheduled",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
