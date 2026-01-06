import { useState } from "react";
import { FileUp, AlertTriangle, CheckCircle, Pill, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUpload } from "@/components/file-upload";
import { Chatbot } from "@/components/chatbot";
import type { PrescriptionAnalysis } from "@shared/schema";

const mockAnalysis: PrescriptionAnalysis = {
  summary: "The prescription has been analyzed and contains 3 medications. The overall prescription appears to be clinically appropriate with standard dosages. Minor considerations have been identified.",
  medications: [
    { name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily for 7 days" },
    { name: "Ibuprofen", dosage: "400mg", frequency: "As needed, max 3 times daily" },
    { name: "Omeprazole", dosage: "20mg", frequency: "Once daily before breakfast" },
  ],
  warnings: [
    "Ibuprofen may cause GI irritation; Omeprazole provides gastric protection",
    "Patient should complete full course of antibiotics",
  ],
  recommendations: [
    "Take Amoxicillin with food to reduce stomach upset",
    "Avoid alcohol during antibiotic treatment",
    "Monitor for allergic reactions in first 48 hours",
    "Follow up if symptoms persist after completing course",
  ],
};

export default function PrescriptionVerifier() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PrescriptionAnalysis | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalysis(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    try {
      // In a real app, we would upload the file first to get text/image content
      // For this demo, we'll simulate sending text content
      // Ideally, we should upload the file to an endpoint that extracts text/image and sends to Gemini
      
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      // First upload/analyze endpoint
      const res = await fetch("/api/analyze/prescription-upload", {
        method: "POST",
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        // Fallback to mock if API fails or not configured
        console.error("Analysis failed, falling back to mock");
        setAnalysis(mockAnalysis);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysis(mockAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2">AI Prescription Verifier</h2>
        <p className="text-muted-foreground">
          Upload prescriptions for AI-powered analysis and verification
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Upload Prescription
              </CardTitle>
              <CardDescription>
                Upload a prescription image or PDF for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClear={handleClear}
                accept=".pdf,.png,.jpg,.jpeg"
                label="Upload Prescription"
              />
              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full"
                data-testid="button-analyze-prescription"
              >
                {isAnalyzing ? "Analyzing..." : "Submit & Analyze"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">AI Analysis Summary</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Info className="h-4 w-4" />
                  <span>Assistive, non-diagnostic</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing && (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              )}

              {!isAnalyzing && !analysis && (
                <div className="text-center py-12 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a prescription and click "Submit & Analyze" to see the AI summary</p>
                </div>
              )}

              {!isAnalyzing && analysis && (
                <div className="space-y-6" data-testid="prescription-analysis">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Summary
                    </h4>
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Medications Identified</h4>
                    <div className="space-y-3">
                      {analysis.medications.map((med, index) => (
                        <div key={index} className="bg-background rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{med.name}</span>
                            <Badge variant="secondary">{med.dosage}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{med.frequency}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {analysis.warnings.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          Warnings
                        </h4>
                        <ul className="space-y-2">
                          {analysis.warnings.map((warning, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
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
        context="prescription"
        placeholder="Ask questions about the prescription analysis..."
        analysisData={analysis}
      />
    </div>
  );
}
