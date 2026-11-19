"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/** Only allow same-site relative redirects (e.g. ?redirect=/admin). */
function nextPath() {
  if (typeof window === "undefined") return "/account";
  const r = new URLSearchParams(window.location.search).get("redirect");
  return r && r.startsWith("/") && !r.startsWith("//") ? r : "/account";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await signIn.email({ email, password });
      if (authError) {
        setError(authError.message || "Invalid email or password");
        return;
      }
      router.push(nextPath());
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await signIn.magicLink({ email, callbackURL: nextPath() });
      if (authError) {
        setError(authError.message || "Failed to send magic link");
        return;
      }
      setMagicSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: nextPath(),
      });
    } catch {
      setError("Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  if (magicSent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "color-mix(in oklch, var(--ok) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-4)", fontWeight: 600, marginBottom: 12 }}>Check your email</h1>
            <p style={{ color: "var(--fg-soft)", marginBottom: 24, lineHeight: 1.6 }}>
              I sent a magic link to <strong>{email}</strong>.<br />
              Click the link in the email to sign in.
            </p>
            <button className="btn outline" onClick={() => setMagicSent(false)}>Back to sign in</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--step-8)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Welcome back</h1>
          <p style={{ color: "var(--fg-muted)" }}>Sign in to your account</p>
        </div>

        {/* Google */}
        <button className="btn outline auth-social-btn" onClick={handleGoogle} disabled={googleLoading || loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        <div className="auth-divider"><span>or</span></div>

        {error && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={mode === "password" ? "active" : ""} onClick={() => setMode("password")}>Password</button>
          <button className={mode === "magic" ? "active" : ""} onClick={() => setMode("magic")}>Magic Link</button>
        </div>

        {mode === "password" ? (
          <form onSubmit={handlePasswordLogin} className="auth-form">
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
                placeholder="Your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-flash" style={{ width: "100%", justifyContent: "center", height: 48 }} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="auth-form">
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
            <button type="submit" className="btn btn-flash" style={{ width: "100%", justifyContent: "center", height: 48 }} disabled={loading}>
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", fontSize: "var(--step--2)", color: "var(--fg-muted)", marginTop: 20 }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" style={{ color: "var(--fg)", fontWeight: 600 }}>Sign up</Link>
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
        .auth-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--line);
          margin-bottom: 24px;
        }
        .auth-tabs button {
          flex: 1;
          background: none;
          border: none;
          padding: 10px;
          font-size: var(--step--2);
          font-weight: 600;
          color: var(--fg-muted);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: color var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out);
        }
        .auth-tabs button.active {
          color: var(--fg);
          border-bottom-color: var(--brand);
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
