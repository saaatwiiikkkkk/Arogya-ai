import { useState } from "react";
import { Upload, Info, Brain, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/file-upload";
import { Chatbot } from "@/components/chatbot";
import type { ScanAnalysisResult } from "@shared/schema";

const mockScanResult: ScanAnalysisResult = {
  summary: "The scan analysis has been completed. The image quality is adequate for assessment. The AI has identified key anatomical structures and performed preliminary evaluation. All findings should be confirmed by a qualified radiologist.",
  findings: [
    "Normal bone density observed in visualized skeletal structures",
    "Soft tissue contours appear within normal limits",
    "No acute abnormalities or concerning lesions identified",
    "Joint spaces and alignment appear preserved",
    "No signs of fracture or dislocation in visible areas",
  ],
  recommendations: [
    "Confirm findings with clinical correlation",
    "Consider follow-up imaging if symptoms persist",
    "Compare with prior studies if available",
    "Consult radiology for formal interpretation",
  ],
};

export default function Scans() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanAnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    setResult(mockScanResult);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2">MRI/X-ray Scan Analysis</h2>
        <p className="text-muted-foreground">
          Upload medical scans for AI-assisted analysis
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Scan
              </CardTitle>
              <CardDescription>
                Upload an MRI, X-ray, or CT scan image for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClear={handleClear}
                accept=".png,.jpg,.jpeg,.dcm"
                label="Upload Medical Scan"
              />

              {previewUrl && (
                <div className="mt-4 rounded-lg border overflow-hidden bg-muted/30">
                  <img
                    src={previewUrl}
                    alt="Scan preview"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full"
                data-testid="button-analyze-scan"
              >
                {isAnalyzing ? "Analyzing Scan..." : "Analyze"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Assistive, non-diagnostic</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">AI is analyzing the scan...</span>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}

              {!isAnalyzing && !result && (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a scan and click "Analyze" to see the AI analysis</p>
                </div>
              )}

              {!isAnalyzing && result && (
                <div className="space-y-6" data-testid="scan-analysis">
                  <div>
                    <Badge variant="secondary" className="mb-3">
                      <Info className="h-3 w-3 mr-1" />
                      AI-Assisted Analysis
                    </Badge>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Key Findings</h4>
                    <ul className="space-y-2">
                      {result.findings.map((finding, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Chatbot
        context="scan"
        placeholder="Ask questions about the scan analysis..."
      />
    </div>
  );
}
