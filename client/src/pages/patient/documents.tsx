import { useState, useEffect } from "react";
import { Eye, Download, FileText, Clock, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { getRecordsByPatientId } from "@/lib/records-store";
import type { PatientRecord } from "@shared/schema";

export default function PatientDocuments() {
  const { patientId } = useAuth();
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [previewRecord, setPreviewRecord] = useState<PatientRecord | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      if (patientId) {
        try {
          const res = await fetch(`/patients/${patientId}/documents`);
          if (res.ok) {
            const data = await res.json();
            const mappedRecords: PatientRecord[] = data.items.map((doc: any) => ({
              id: doc.id,
              patientId: doc.patient_id,
              filename: doc.filename,
              uploadedAt: doc.submitted_at,
              url: doc.download_url,
              fileType: doc.mime_type,
            }));
            setRecords(mappedRecords);
          }
        } catch (error) {
          console.error("Failed to fetch records:", error);
        }
      }
    };

    fetchRecords();
  }, [patientId]);

  const handleDownload = (record: PatientRecord) => {
    const link = document.createElement("a");
    link.href = record.url;
    link.download = record.filename;
    link.click();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-2">My Documents</h2>
        <p className="text-muted-foreground">
          View and manage your uploaded medical records
        </p>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't uploaded any medical records yet. Upload your first document to get started.
            </p>
            <Button onClick={() => window.location.href = "/patient/upload"} data-testid="button-upload-first">
              Upload Your First Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Documents</CardTitle>
            <CardDescription>{records.length} document(s) uploaded</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} data-testid={`row-document-${record.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{record.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(record.fileSize)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(record.uploadedAt)}</span>
                        <span className="text-xs">{formatTime(record.uploadedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewRecord(record)}
                          data-testid={`button-view-${record.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(record)}
                          data-testid={`button-download-${record.id}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!previewRecord} onOpenChange={() => setPreviewRecord(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewRecord?.filename}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh] rounded-lg bg-muted p-4">
            {previewRecord?.url && (
              previewRecord.filename.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewRecord.url}
                  className="w-full h-[500px]"
                  title={previewRecord.filename}
                />
              ) : (
                <img
                  src={previewRecord.url}
                  alt={previewRecord.filename}
                  className="max-w-full h-auto mx-auto"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
