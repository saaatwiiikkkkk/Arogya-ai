import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { DrugInput, PersonalDetails, DrugInteractionResult } from "@shared/schema";

const mockResults: Record<string, DrugInteractionResult> = {
  safe: {
    status: "safe",
    explanation: "Based on the analysis, the combination of the specified medications appears to be safe for a patient with the provided characteristics. No significant drug-drug interactions were identified that would require dosage adjustments or alternative therapies.",
    suggestions: [
      "Continue monitoring for any unexpected side effects",
      "Maintain regular follow-up appointments",
      "Ensure patient understands proper dosing schedules",
      "Review medication list at each visit for any changes",
    ],
  },
  warning: {
    status: "warning",
    explanation: "The combination of medications may have potential interactions that require monitoring. While not contraindicated, healthcare providers should be aware of possible effects including altered drug metabolism and increased risk of certain side effects.",
    suggestions: [
      "Monitor liver function tests periodically",
      "Consider spacing doses by at least 2 hours",
      "Watch for signs of increased sedation or dizziness",
      "Adjust dosages if necessary based on patient response",
      "Document the interaction and monitoring plan",
    ],
  },
};

export default function DrugInteractions() {
  const [step, setStep] = useState(1);
  const [drugs, setDrugs] = useState<[DrugInput, DrugInput]>([
    { name: "", dosage: "" },
    { name: "", dosage: "" },
  ]);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    age: 0,
    height: 0,
    heightUnit: "cm",
    weight: 0,
    weightUnit: "kg",
    additionalInfo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DrugInteractionResult | null>(null);

  const updateDrug = (index: 0 | 1, field: keyof DrugInput, value: string) => {
    const newDrugs = [...drugs] as [DrugInput, DrugInput];
    newDrugs[index] = { ...newDrugs[index], [field]: value };
    setDrugs(newDrugs);
  };

  const canProceedStep1 = drugs[0].name && drugs[0].dosage && drugs[1].name && drugs[1].dosage;
  const canProceedStep2 = personalDetails.age > 0 && personalDetails.height > 0 && personalDetails.weight > 0;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    if (result) setResult(null);
  };

  const handleSummarize = async () => {
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/analyze/drug-interactions", {
        drugs,
        personalDetails
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      setResult({
        status: "warning",
        explanation: "Failed to connect to analysis service. Please try again.",
        suggestions: ["Check internet connection", "Try again later"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setDrugs([{ name: "", dosage: "" }, { name: "", dosage: "" }]);
    setPersonalDetails({ age: 0, height: 0, heightUnit: "cm", weight: 0, weightUnit: "kg", additionalInfo: "" });
    setResult(null);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-2">Drug Interaction Check</h2>
        <p className="text-muted-foreground">
          Check for potential interactions between medications
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    step > s
                      ? "bg-primary text-primary-foreground"
                      : step === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </div>
                <span className={`ml-3 text-sm font-medium ${step >= s ? "" : "text-muted-foreground"}`}>
                  {s === 1 ? "Drug Inputs" : s === 2 ? "Personal Details" : "Summary"}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 mx-4 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Drug Information</CardTitle>
            <CardDescription>Enter the two drugs you want to check for interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[0, 1].map((index) => (
              <div key={index} className="space-y-4 p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium">Drug {index + 1}</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Drug Name</Label>
                    <Input
                      placeholder="e.g., Aspirin"
                      value={drugs[index as 0 | 1].name}
                      onChange={(e) => updateDrug(index as 0 | 1, "name", e.target.value)}
                      data-testid={`input-drug-${index + 1}-name`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input
                      placeholder="e.g., 500mg twice daily"
                      value={drugs[index as 0 | 1].dosage}
                      onChange={(e) => updateDrug(index as 0 | 1, "dosage", e.target.value)}
                      data-testid={`input-drug-${index + 1}-dosage`}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!canProceedStep1} data-testid="button-next-step1">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Details</CardTitle>
            <CardDescription>Provide patient information for accurate interaction analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Age"
                    value={personalDetails.age || ""}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, age: parseInt(e.target.value) || 0 })}
                    data-testid="input-age"
                  />
                  <span className="flex items-center text-sm text-muted-foreground">years</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Height"
                    value={personalDetails.height || ""}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, height: parseInt(e.target.value) || 0 })}
                    data-testid="input-height"
                  />
                  <span className="flex items-center text-sm text-muted-foreground">cm</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Weight</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Weight"
                    value={personalDetails.weight || ""}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, weight: parseInt(e.target.value) || 0 })}
                    data-testid="input-weight"
                  />
                  <span className="flex items-center text-sm text-muted-foreground">kg</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Information (Optional)</Label>
              <Textarea
                placeholder="Any relevant medical history, allergies, or conditions..."
                value={personalDetails.additionalInfo}
                onChange={(e) => setPersonalDetails({ ...personalDetails, additionalInfo: e.target.value })}
                rows={4}
                data-testid="input-additional-info"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} data-testid="button-back-step2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceedStep2} data-testid="button-next-step2">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review & Summarize</CardTitle>
            <CardDescription>Review the information and get the interaction analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Medications</h4>
                {drugs.map((drug, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/30">
                    <p className="font-medium">{drug.name}</p>
                    <p className="text-sm text-muted-foreground">{drug.dosage}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Patient Details</h4>
                <div className="p-3 rounded-lg bg-muted/30 space-y-1">
                  <p className="text-sm"><span className="text-muted-foreground">Age:</span> {personalDetails.age} years</p>
                  <p className="text-sm"><span className="text-muted-foreground">Height:</span> {personalDetails.height} cm</p>
                  <p className="text-sm"><span className="text-muted-foreground">Weight:</span> {personalDetails.weight} kg</p>
                  {personalDetails.additionalInfo && (
                    <p className="text-sm"><span className="text-muted-foreground">Notes:</span> {personalDetails.additionalInfo}</p>
                  )}
                </div>
              </div>
            </div>

            {!result && (
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack} data-testid="button-back-step3">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleSummarize} disabled={isLoading} data-testid="button-summarize">
                  {isLoading ? "Analyzing..." : "Summarize"}
                </Button>
              </div>
            )}

            {result && (
              <>
                <Separator />
                <div className="space-y-6" data-testid="interaction-result">
                  <div className="flex items-center gap-3">
                    {result.status === "safe" ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Safe
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">No significant interactions detected</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Warning
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">Potential interactions require monitoring</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Explanation</h4>
                    <p className="text-sm text-muted-foreground">{result.explanation}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Suggested Next Steps</h4>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={handleReset} data-testid="button-new-check">
                      Start New Check
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
