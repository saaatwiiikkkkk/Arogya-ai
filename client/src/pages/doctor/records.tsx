import { useState } from "react";
import { Search, Eye, Download, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecordsByPatientId } from "@/lib/records-store";
import type { PatientRecord } from "@shared/schema";

export default function DoctorRecords() {
  const [patientId, setPatientId] = useState("");
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<PatientRecord | null>(null);

  const handleFetch = async () => {
    if (!patientId.trim()) return;

    setIsLoading(true);
    setHasFetched(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const fetchedRecords = getRecordsByPatientId(patientId.trim().toUpperCase());
    setRecords(fetchedRecords.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    ));
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFetch();
    }
  };

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

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-2">Patient Records</h2>
        <p className="text-muted-foreground">
          Search and view patient medical records by Patient ID
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Search Patient</CardTitle>
          <CardDescription>Enter the patient ID to fetch their records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter Patient ID (e.g., PAT-XXXXX)"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
                data-testid="input-patient-id"
              />
            </div>
            <Button
              onClick={handleFetch}
              disabled={!patientId.trim() || isLoading}
              data-testid="button-fetch-records"
            >
              {isLoading ? "Fetching..." : "Fetch Records"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && hasFetched && records.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Records Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No medical records were found for Patient ID "{patientId}". 
              Please verify the ID and try again.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Records for {patientId.toUpperCase()}</CardTitle>
            <CardDescription>{records.length} record(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} data-testid={`row-record-${record.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{record.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDate(record.uploadedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTime(record.uploadedAt)}
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
