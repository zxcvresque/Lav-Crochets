"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await signUp.email({ name, email, password });
      if (authError) {
        setError(authError.message || "Failed to create account");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/account",
      });
    } catch {
      setError("Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-8)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Create account</h1>
          <p style={{ color: "var(--fg-muted)" }}>Join Lav Crochets to track your orders</p>
        </div>

        {/* Google */}
        <button className="btn outline auth-social-btn" onClick={handleGoogle} disabled={googleLoading || loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? "Signing up..." : "Continue with Google"}
        </button>

        <div className="auth-divider"><span>or</span></div>

        {error && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lav Crochets"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="btn btn-flash" style={{ width: "100%", justifyContent: "center", height: 48 }} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "var(--step--2)", color: "var(--fg-muted)", marginTop: 20 }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--fg)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--s-7) 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: var(--r-5);
          padding: 40px;
        }
        .auth-social-btn {
          width: 100%;
          justify-content: center;
          height: 48px;
          font-size: var(--step--2);
          font-weight: 600;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: var(--fg-muted);
          font-size: var(--step--2);
        }
        .auth-divider::before,
        .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--line);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-field label {
          font-size: var(--step--2);
          font-weight: 600;
          color: var(--fg-soft);
        }
        .form-field input {
          padding: 12px 14px;
          border-radius: var(--r-3);
          border: 1.5px solid var(--line);
          background: var(--bg);
          color: var(--fg);
          font-size: var(--step-0);
          font-family: var(--font-body);
          transition: border-color var(--dur-2) var(--ease-out), box-shadow var(--dur-2) var(--ease-out);
        }
        .form-field input:focus {
          outline: none;
          border-color: var(--joy-500);
        }
        .form-field input::placeholder { color: var(--fg-faint); }
        .auth-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: color-mix(in oklch, var(--bad) 10%, transparent);
          border: 1px solid color-mix(in oklch, var(--bad) 25%, transparent);
          border-radius: var(--r-3);
          color: var(--bad);
          font-size: var(--step--2);
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
