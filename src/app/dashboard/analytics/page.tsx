"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { PipelineChart } from "@/components/dashboard/PipelineChart";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Insights and metrics for your recruitment
        </p>
      </div>

      <DashboardStats {...data.overview} />

      <div className="grid lg:grid-cols-2 gap-6">
        <PipelineChart data={data.pipeline} />

        <Card>
          <CardHeader>
            <CardTitle>Candidate Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.sources || {}).map(([source, count]) => {
                const total = Object.values(data.sources || {}).reduce(
                  (a: number, b: any) => a + (b as number),
                  0
                ) as number;
                const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                return (
                  <div key={source} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{source}</span>
                      <span className="text-gray-600">
                        {count as number} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentApplications?.slice(0, 10).map((app: any) => (
              <div key={app.id} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{app.candidate.name}</span>{" "}
                    applied for{" "}
                    <span className="font-medium">{app.job.title}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    AI Score: {app.candidate.aiScore || "N/A"}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(app.appliedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
