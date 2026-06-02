import { useState } from "react";
import epitechLogo from "../assets/img/epitech_logo.png";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: appel API auth
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-epi-bg flex flex-col">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-epi-border h-12">
        <img src={epitechLogo} alt="Epitech" className="h-6 w-auto" />
        <span className="text-sm font-bold tracking-[0.25em] text-white">
          CODING <span className="text-epi-accent">CLUB</span> EPITECH
        </span>
        <div className="w-24" />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-epi-surface border border-epi-border rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-1">Connexion</h2>
            <p className="text-sm text-epi-muted mb-6">
              Accédez aux ressources du Coding Club
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-epi-muted mb-1.5 block">Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-epi-surface-2 border border-epi-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-epi-ghost outline-none focus:border-epi-accent transition-colors"
                  placeholder="prenom.nom@epitech.eu"
                />
              </div>
              <div>
                <label className="text-xs text-epi-muted mb-1.5 block">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-epi-surface-2 border border-epi-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-epi-ghost outline-none focus:border-epi-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-epi-accent text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-epi-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-epi-ghost mt-4">
            Étudiant Epitech ?{" "}
            <button className="text-epi-accent hover:underline">
              Connexion via my.epitech.eu
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
