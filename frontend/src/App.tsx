import { useState, useEffect } from "react";
import ApmLensApp from "./apm-lens/ApmLensApp";
import EaStudioApp from "./ea-studio/EaStudioApp";

const getApiUrl = (path: string) => {
  const isDev = window.location.hostname === "localhost" && window.location.port !== "8080";
  const base = isDev ? "http://localhost:8080" : "";
  return `${base}${path}`;
};

interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (token: string, user: UserProfile) => void }) {
  const [password, setPassword] = useState("");
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch config and initialize Google button dynamically
  useEffect(() => {
    fetch(getApiUrl("/api/config"))
      .then((res) => res.json())
      .then((config) => {
        if (config.googleClientId) {
          setGoogleClientId(config.googleClientId);

          // Repeated check until the Google Script GSI Client has loaded onto window
          const interval = setInterval(() => {
            const google = (window as any).google;
            const buttonElement = document.getElementById("google-signin-button");

            if (google && buttonElement) {
              clearInterval(interval);

              google.accounts.id.initialize({
                client_id: config.googleClientId,
                callback: (response: any) => {
                  handleGoogleLogin(response.credential);
                }
              });

              google.accounts.id.renderButton(
                buttonElement,
                { 
                  theme: "filled_blue", 
                  size: "large", 
                  shape: "rectangular",
                  text: "signin_with",
                  width: 256
                }
              );
            }
          }, 150);

          return () => clearInterval(interval);
        }
      })
      .catch((err) => console.error("Kunde inte läsa in API-konfiguration:", err));
  }, []);

  const handleGoogleLogin = async (idToken: string) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/auth/google"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error || "Google-inloggning misslyckades.");
      }
    } catch (err) {
      setError("Anslutningsfel vid verifiering mot Google. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.error || "Felaktigt lösenord. Försök igen.");
      }
    } catch (err) {
      setError("Kunde inte ansluta till servern. Säkra att backend är igång.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-slate-100 font-sans p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col items-center">
        {/* Logo */}
        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 mb-4 select-none">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">EA Workspace</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6 text-center leading-relaxed select-none">
          Vänligen logga in för att samarbete och rita processer live.
        </p>

        {/* GOOGLE SSO LOGIN BUTTON (Visible only if googleClientId is configured in GCP) */}
        {googleClientId && (
          <div className="w-full flex flex-col items-center mb-6">
            <div id="google-signin-button" className="min-h-[40px] flex items-center justify-center"></div>
            <div className="flex items-center w-full my-4 select-none">
              <div className="flex-1 border-t border-slate-800/80"></div>
              <span className="px-3 text-[10px] text-slate-600 font-bold uppercase tracking-widest">eller logga in med lösenord</span>
              <div className="flex-1 border-t border-slate-800/80"></div>
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5 tracking-wider select-none">Team-lösenord</label>
            <input
              type="password"
              required
              placeholder="Skriv lösenord..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-purple-500 text-center text-sm"
            />
          </div>

          {error && <div className="text-xs text-rose-400 font-medium text-center leading-relaxed">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-extrabold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors"
          >
            {loading ? "Validerar..." : "Lås upp med lösenord"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("labb_token"));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("labb_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentApp, setCurrentApp] = useState<"apm" | "studio">("apm");

  const handleLoginSuccess = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("labb_token", newToken);
    localStorage.setItem("labb_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("labb_token");
    localStorage.removeItem("labb_user");
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Global Workspace Control Bar */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 flex justify-between items-center text-xs z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 select-none">
            <span className="font-bold text-slate-300">free-apm-workspace:</span>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded font-mono border border-slate-800 text-purple-400 font-bold">MULTIPLE_DOMAINS</span>
          </div>
          
          <span className="text-slate-700 select-none">|</span>
          
          {user && (
            <div className="flex items-center gap-1.5 select-none text-[10px] font-bold text-slate-300">
              {user.picture && (
                <img src={user.picture} alt={user.name} className="w-5 h-5 rounded-full border border-purple-500/80 shadow shadow-purple-950/20" />
              )}
              <span>{user.name}</span>
            </div>
          )}

          <span className="text-slate-700 select-none">|</span>
          
          <button
            onClick={handleLogout}
            className="text-[10px] text-slate-500 hover:text-rose-400 font-bold uppercase transition-colors"
            title="Logga ut från denna session"
          >
            Logga ut
          </button>

          <span className="text-slate-700 select-none">|</span>

          <span className="text-[10px] text-purple-400 font-mono font-bold" title="Lokal EA-plattformskonfiguration">
            v0.1 &bull; Build: #204-Prod
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentApp("apm")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              currentApp === "apm"
                ? "bg-purple-600 text-white shadow shadow-purple-600/20"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            APM Lens (Portfolio & Sömmar)
          </button>
          <button
            onClick={() => setCurrentApp("studio")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              currentApp === "studio"
                ? "bg-purple-600 text-white shadow shadow-purple-600/20"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            EA Studio (Process & Arkitektur)
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {currentApp === "apm" ? <ApmLensApp /> : <EaStudioApp />}
      </div>
    </div>
  );
}
