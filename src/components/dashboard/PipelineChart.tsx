import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PipelineChartProps {
  data: Record<string, number>;
}

const statusColors: Record<string, "default" | "warning" | "secondary" | "success" | "destructive" | "outline"> = {
  SUBMITTED: "default",
  SCREENING: "warning",
  INTERVIEW: "secondary",
  OFFER: "success",
  HIRED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
};

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export function PipelineChart({ data }: PipelineChartProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruitment Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(data).map(([status, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant={statusColors[status] || "default"}>
                    {statusLabels[status] || status}
                  </Badge>
                  <span className="text-gray-600">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(status)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "SUBMITTED":
      return "bg-blue-500";
    case "SCREENING":
      return "bg-yellow-500";
    case "INTERVIEW":
      return "bg-purple-500";
    case "OFFER":
      return "bg-green-500";
    case "HIRED":
      return "bg-green-600";
    case "REJECTED":
      return "bg-red-500";
    case "WITHDRAWN":
      return "bg-gray-400";
    default:
      return "bg-gray-500";
  }
}
