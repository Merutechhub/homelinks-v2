import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui";
import { Mail, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { resendVerificationEmail } from "@/lib/hooks/useAuth";

/* ──────────────────────────────────────────────────────────────
   Email Verification Page — Confirm email before access
   Resend verification link if needed
   ────────────────────────────────────────────────────────────── */

function EmailVerificationPage() {
  const [_location, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from query params
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email) {
      setError("No email address found");
      return;
    }

    setResendLoading(true);
    setError("");
    setResendSuccess(false);

    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
      setCountdown(60);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to resend email");
    } finally {
      setResendLoading(false);
    }
  };

  const handleContinue = () => {
    // In production, this would check if email is verified
    // For now, assume verified after user clicks continue
    setLoading(true);
    setTimeout(() => {
      setVerified(true);
      // Redirect to onboarding profile page
      setLocation("/onboarding/profile");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-accent-green/10 via-accent-purple/5 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/10 via-accent-purple/5 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* Back button */}
      <div className="relative z-10 pt-6 px-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => setLocation("/signup")}
        >
          Back
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            {verified ? (
              <div className="w-16 h-16 rounded-full bg-success/10 border-2 border-success flex items-center justify-center animate-scale-in">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
                <Mail className="w-8 h-8 text-accent" />
              </div>
            )}
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-text-primary mb-3">
              {verified ? "Email verified!" : "Verify your email"}
            </h1>
            <p className="text-text-secondary text-base">
              {verified
                ? "Your account is ready to go. Let's set up your profile."
                : `We've sent a verification link to ${email || "your email"}`}
            </p>
          </div>

          {!verified && (
            <>
              {/* Instructions */}
              <div className="bg-bg-surface border border-border rounded-lg p-6 mb-8 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary mb-1">
                      Check your inbox
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      Look for an email from Homelink
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary mb-1">
                      Click the verification link
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      It expires in 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary mb-1">
                      Come back here
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      To complete your profile setup
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-lg bg-error/10 border border-error/30 text-sm text-error mb-6">
                  {error}
                </div>
              )}

              {/* Success message */}
              {resendSuccess && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-sm text-success mb-6">
                  Verification email sent! Check your inbox.
                </div>
              )}

              {/* Resend button */}
              <div className="text-center mb-6">
                <p className="text-sm text-text-tertiary mb-3">
                  Didn't receive the email?
                </p>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleResendEmail}
                  disabled={resendLoading || countdown > 0}
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    "Resend verification email"
                  )}
                </Button>
              </div>

              {/* Continue anyway button */}
              <Button
                fullWidth
                size="lg"
                loading={loading}
                onClick={handleContinue}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "I've verified my email"
                )}
              </Button>
            </>
          )}

          {verified && (
            <>
              <Button
                fullWidth
                size="lg"
                onClick={() => setLocation("/onboarding/profile")}
              >
                Continue to profile setup
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailVerificationPage;
