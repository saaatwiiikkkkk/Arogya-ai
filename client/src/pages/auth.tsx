import { useState } from "react";
import { useLocation } from "wouter";
import { Stethoscope, User, ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UserRole } from "@shared/schema";

export default function Auth() {
  const [, navigate] = useLocation();
  const { login, register } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
  };

  const handleBack = () => {
    setSelectedRole(null);
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      if (selectedRole) {
        if (isSignUp) {
          await register(username, password, selectedRole);
        } else {
          await login(username, password, selectedRole);
        }
        navigate(selectedRole === "doctor" ? "/doctor" : "/patient");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Arogya AI</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {!selectedRole ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome to Arogya AI</h1>
                <p className="text-muted-foreground">Select your role to continue</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                  onClick={() => handleRoleSelect("doctor")}
                  data-testid="card-doctor-login"
                >
                  <CardContent className="pt-8 pb-8 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Doctor Login</h2>
                      <p className="text-muted-foreground mt-2">
                        Access patient records, AI prescription verifier, drug interaction checks, and scan analysis
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                  onClick={() => handleRoleSelect("patient")}
                  data-testid="card-patient-login"
                >
                  <CardContent className="pt-8 pb-8 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Patient Login</h2>
                      <p className="text-muted-foreground mt-2">
                        Upload medical records, view your documents, and share with healthcare providers
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-4"
                  onClick={handleBack}
                  data-testid="button-back-role"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {selectedRole === "doctor" ? (
                    <Stethoscope className="h-8 w-8 text-primary" />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {selectedRole === "doctor" ? "Doctor" : "Patient"} Login
                </CardTitle>
                <CardDescription>
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      data-testid="input-password"
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md" data-testid="text-error">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                      data-testid="button-login"
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={isLoading}
                      onClick={(e) => handleSubmit(e, true)}
                      data-testid="button-signup"
                    >
                      {isLoading ? "Signing up..." : "Sign Up"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

