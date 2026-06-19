import { useState } from "react";
import { Stack, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import epitechLogo from "../../assets/img/epitech_logo.png";
import { API } from "../../lib/api";

export function PasswordGate({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const { token } = await res.json() as { token: string };
        sessionStorage.setItem("adminToken", token);
        onUnlock(token);
      } else {
        setError("Mot de passe incorrect.");
      }
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--epi-bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 380 }}>
        <form onSubmit={submit}>
          <Stack gap="xl">
            <Stack gap={6} align="center">
              <a href="/"><img src={epitechLogo} height={28} alt="Epitech" style={{ marginBottom: 4, cursor: "pointer" }} /></a>
              <Text fw={700} size="xl" ff="heading">Zone Admin</Text>
              <Text size="sm" c="dimmed">Accès restreint</Text>
            </Stack>

            <div style={{
              background: "var(--epi-surface)",
              border: "1px solid var(--epi-border)",
              borderRadius: 12, padding: 28,
            }}>
              <Stack gap="md">
                <div>
                  <Text size="sm" fw={600} mb={8}>Mot de passe</Text>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "var(--epi-bg)",
                    border: `1px solid ${error ? "var(--epi-advanced)" : "var(--epi-border)"}`,
                    borderRadius: 8, padding: "10px 14px",
                    transition: "border-color 0.2s",
                  }}>
                    <IconLock size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                    <input
                      type="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      autoFocus
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        color: "#fff", fontSize: 14, fontFamily: "inherit",
                      }}
                    />
                  </div>
                  {error && (
                    <Text size="xs" mt={6} style={{ color: "var(--epi-advanced)" }}>{error}</Text>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password}
                  style={{
                    width: "100%",
                    background: password ? "var(--epi-accent)" : "var(--epi-bg)",
                    border: "1px solid var(--epi-border)",
                    color: password ? "#fff" : "var(--epi-ghost)",
                    fontSize: 14, fontWeight: 700,
                    padding: "10px", borderRadius: 8,
                    cursor: password && !loading ? "pointer" : "not-allowed",
                    transition: "0.2s", fontFamily: "inherit",
                  }}
                >
                  {loading ? "Vérification…" : "Accéder"}
                </button>
              </Stack>
            </div>
          </Stack>
        </form>
      </div>
    </div>
  );
}
