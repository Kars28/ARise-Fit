import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface FileUploadProps {
  uploadedFiles: {
    bloodReport: File | null;
    cholesterolReport: File | null;
    thyroxineReport: File | null;
  };
  setUploadedFiles: React.Dispatch<React.SetStateAction<{
    bloodReport: File | null;
    cholesterolReport: File | null;
    thyroxineReport: File | null;
  }>>;
  onSubmit: () => void;
}

export function FileUpload({ uploadedFiles, setUploadedFiles, onSubmit }: FileUploadProps) {
  const handleFileChange = (type: keyof typeof uploadedFiles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles(prev => ({
        ...prev,
        [type]: e.target.files![0]
      }));
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bloodReport">Blood Report (PDF)</Label>
          <Input
            id="bloodReport"
            type="file"
            accept=".pdf"
            onChange={handleFileChange('bloodReport')}
          />
          {uploadedFiles.bloodReport && (
            <p className="text-sm text-green-600">✓ Blood report uploaded</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cholesterolReport">Cholesterol Report (PDF)</Label>
          <Input
            id="cholesterolReport"
            type="file"
            accept=".pdf"
            onChange={handleFileChange('cholesterolReport')}
          />
          {uploadedFiles.cholesterolReport && (
            <p className="text-sm text-green-600">✓ Cholesterol report uploaded</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="thyroxineReport">Thyroxine Report (PDF)</Label>
          <Input
            id="thyroxineReport"
            type="file"
            accept=".pdf"
            onChange={handleFileChange('thyroxineReport')}
          />
          {uploadedFiles.thyroxineReport && (
            <p className="text-sm text-green-600">✓ Thyroxine report uploaded</p>
          )}
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!uploadedFiles.bloodReport || !uploadedFiles.cholesterolReport || !uploadedFiles.thyroxineReport}
        className="w-full"
      >
        Analyze Reports
      </Button>
    </form>
  );
} 