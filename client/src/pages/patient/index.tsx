import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { PatientLayout } from "@/components/patient-layout";
import PatientUpload from "./upload";
import PatientDocuments from "./documents";

function RedirectToUpload() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/patient/upload", { replace: true });
  }, [navigate]);
  return null;
}

export default function PatientDashboard() {
  return (
    <PatientLayout>
      <Switch>
        <Route path="/patient/upload" component={PatientUpload} />
        <Route path="/patient/documents" component={PatientDocuments} />
        <Route path="/patient" component={RedirectToUpload} />
      </Switch>
    </PatientLayout>
  );
}
