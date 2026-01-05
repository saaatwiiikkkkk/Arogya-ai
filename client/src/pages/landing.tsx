import { useLocation } from "wouter";
import { ArrowRight, Shield, Stethoscope, Brain, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Arogya AI</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={() => navigate("/auth")} data-testid="button-get-started-header">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative min-h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Trusted Healthcare AI
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-headline">
                  Arogya AI: The Intelligent{" "}
                  <span className="text-primary">Clinical Safety</span> Layer
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-lg" data-testid="text-hero-subheadline">
                  Assisting the Doctor, Empowering the Patient, Humanizing Healthcare.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="text-base"
                    data-testid="button-get-started-hero"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base"
                    data-testid="button-learn-more"
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl" />
                  <div className="relative bg-card border rounded-3xl p-8 shadow-lg">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">AI-Powered Diagnostics</p>
                          <p className="text-sm text-muted-foreground">Assistive analysis for better decisions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Drug Interaction Checks</p>
                          <p className="text-sm text-muted-foreground">Comprehensive safety verification</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Secure Patient Records</p>
                          <p className="text-sm text-muted-foreground">HIPAA-compliant data handling</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Comprehensive Healthcare Solutions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform provides tools for both healthcare providers and patients
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Stethoscope,
                  title: "Prescription Verifier",
                  description: "AI-powered analysis of prescriptions for safety and accuracy",
                },
                {
                  icon: Brain,
                  title: "Drug Interactions",
                  description: "Check for potential drug interactions with detailed reports",
                },
                {
                  icon: Activity,
                  title: "Scan Analysis",
                  description: "Assistive MRI and X-ray scan interpretation",
                },
                {
                  icon: Shield,
                  title: "Record Management",
                  description: "Secure storage and sharing of medical records",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-card border rounded-xl p-6 space-y-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Arogya AI - Intelligent Clinical Safety Layer</p>
        </div>
      </footer>
    </div>
  );
}
