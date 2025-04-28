import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface HealthStatusProps {
  status: {
    weight_status: string;
    recommendations: string[];
  };
}

export function HealthStatus({ status }: HealthStatusProps) {
  const getWeightStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "underweight":
        return "bg-yellow-100 text-yellow-800";
      case "normal weight":
        return "bg-green-100 text-green-800";
      case "overweight":
        return "bg-orange-100 text-orange-800";
      case "obese":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Weight Status</Label>
          <Badge className={getWeightStatusColor(status.weight_status)}>
            {status.weight_status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Recommendations</Label>
          <ul className="space-y-2">
            {status.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 