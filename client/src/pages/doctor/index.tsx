import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { DoctorLayout } from "@/components/doctor-layout";
import DoctorRecords from "./records";
import PrescriptionVerifier from "./prescription-verifier";
import DrugInteractions from "./drug-interactions";
import Scans from "./scans";

function RedirectToRecords() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/doctor/records", { replace: true });
  }, [navigate]);
  return null;
}

export default function DoctorDashboard() {
  return (
    <DoctorLayout>
      <Switch>
        <Route path="/doctor/records" component={DoctorRecords} />
        <Route path="/doctor/prescription-verifier" component={PrescriptionVerifier} />
        <Route path="/doctor/drug-interactions" component={DrugInteractions} />
        <Route path="/doctor/scans" component={Scans} />
        <Route path="/doctor" component={RedirectToRecords} />
      </Switch>
    </DoctorLayout>
  );
}
