import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";

interface ExtractedDataProps {
  data: {
    blood: Record<string, string>;
    cholesterol: Record<string, string>;
    thyroxine: Record<string, string>;
  } | null;
}

export function ExtractedData({ data }: ExtractedDataProps) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="font-medium">Blood Report</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.blood).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Cholesterol Report</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.cholesterol).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">Thyroxine Report</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.thyroxine).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 