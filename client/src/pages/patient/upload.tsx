import { useState } from "react";
import { Upload, CheckCircle, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUpload } from "@/components/file-upload";
import { useAuth } from "@/lib/auth";
import { addRecord, generateRecordId } from "@/lib/records-store";
import type { PatientRecord } from "@shared/schema";

export default function PatientUpload() {
  const { patientId } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadSuccess(false);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !patientId) return;

    setIsUploading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const url = URL.createObjectURL(selectedFile);

      const record: PatientRecord = {
        id: generateRecordId(),
        patientId: patientId,
        filename: selectedFile.name,
        uploadedAt: new Date().toISOString(),
        url: url,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      };

      addRecord(record);

      setUploadSuccess(true);
      setSelectedFile(null);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-2">Upload Records</h2>
        <p className="text-muted-foreground">
          Upload your medical records to share with healthcare providers
        </p>
      </div>

      {uploadSuccess && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950" data-testid="alert-upload-success">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-300">Upload Successful</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            Your medical record has been uploaded successfully. You can view it in "My Documents".
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-upload-error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Medical Record
          </CardTitle>
          <CardDescription>
            Upload prescriptions, lab reports, imaging results, or other medical documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClear={handleClear}
            accept=".pdf,.png,.jpg,.jpeg"
            label="Upload Medical Document"
          />

          <div className="flex flex-col gap-4">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full"
              data-testid="button-upload-record"
            >
              {isUploading ? "Uploading..." : "Upload Record"}
            </Button>

            {patientId && (
              <p className="text-sm text-muted-foreground text-center">
                Uploading as Patient ID: <span className="font-mono font-medium">{patientId}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Accepted File Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { type: "PDF Documents", desc: "Prescriptions, reports, lab results" },
              { type: "Images", desc: "JPG, PNG - photos of documents, scans" },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
