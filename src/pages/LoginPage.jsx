import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      if (err.isWrongRole) {
        setError(err.message);
      } else {
        const status = err.response?.status;
        if (status === 401 || status === 400) {
          setError("Email or password is incorrect.");
        } else {
          setError("Couldn't reach the server. It may be waking up — try again in a moment.");
        }
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-bottle text-paper px-16 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 31px, currentColor 31px, currentColor 32px)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <RxStamp />
            <span className="font-display text-2xl tracking-tight">MediFind</span>
          </div>
        </div>
        <div className="relative space-y-4 max-w-md">
          <p className="font-display text-4xl leading-tight">
            The ledger for your counter.
          </p>
          <p className="text-paper/70 font-body text-base leading-relaxed">
            Stock, reservations, and hours — kept current, so the app can send
            people who need what you have.
          </p>
        </div>
        <p className="relative text-xs text-paper/50 font-mono">
          Pharmacy Dashboard
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <RxStamp small />
            <span className="font-display text-xl text-ink">MediFind</span>
          </div>

          <h1 className="font-display text-3xl text-ink mb-1">Sign in</h1>
          <p className="text-ink-soft text-sm mb-8">
            Enter your pharmacy account credentials.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-hairline bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-soft/50 focus:border-bottle outline-none transition-colors"
                placeholder="pharmacy@yourdomain.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wide text-ink-soft mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-hairline bg-white px-3.5 py-2.5 text-ink focus:border-bottle outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded border border-rust/30 bg-rust-light px-3.5 py-2.5 text-sm text-rust">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-bottle text-paper font-medium py-2.5 hover:bg-bottle-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function RxStamp({ small }) {
  const size = small ? 36 : 44;
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="21" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="22" cy="22" r="17" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <text
        x="22"
        y="29"
        textAnchor="middle"
        fontFamily="'Zilla Slab', serif"
        fontSize="18"
        fontWeight="600"
        fill="currentColor"
      >
        Rx
      </text>
    </svg>
  );
}
