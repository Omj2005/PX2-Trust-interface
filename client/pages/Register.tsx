import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleContinue = () => {
    if (!firstName || !lastName) {
      setError("Please fill in all required fields (First Name, Last Name).");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter a password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await register(email, password, `${firstName} ${lastName}`, "user");
    } catch (error: any) {
      console.error("Registration failed:", error);

      if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50 dark:from-green-950 dark:to-cyan-950 p-4">
      <div className="w-full max-w-md animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-900 to-cyan-600 dark:from-green-100 dark:to-cyan-300 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join our platform and start your journey
          </p>
        </div>

        <Card className="p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-green-200/50 dark:border-green-700/50 shadow-xl">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleContinue();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <Button
                type="submit"
                className="w-full hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700"
              >
                Continue with Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>

              <Button
                type="submit"
                className="w-full hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700"
                disabled={isSubmitting || !password}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
