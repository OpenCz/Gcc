import { useState, useEffect } from "react";
import { Stack, Group, Text } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { type WhitelistEntry } from "./types";
import { API } from "../../lib/api";

export function WhitelistTab({ token }: { token: string }) {
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MANTA" | "PEDA">("MANTA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch(`${API}/admin/whitelist`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setEntries(d.whitelist ?? []));
  };

  useEffect(() => { load(); }, [token]);

  const add = async () => {
    if (!email.trim()) return;
    setLoading(true); setError("");
    const res = await fetch(`${API}/admin/whitelist`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
    });
    setLoading(false);
    if (res.ok) { setEmail(""); load(); }
    else setError("Erreur lors de l'ajout");
  };

  const remove = async (id: number) => {
    await fetch(`${API}/admin/whitelist/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const roleColor = (r: string) => r === "PEDA" ? "var(--epi-accent)" : "var(--epi-beginner)";

  return (
    <Stack gap="xl">
      <Text fw={700} size="lg">Whitelist</Text>

      <div style={{ background: "var(--epi-panel)", borderRadius: 10, padding: 20, border: "1px solid var(--epi-border)" }}>
        <Text fw={600} size="sm" mb={12}>Ajouter un accès</Text>
        <Stack gap={10}>
          <input
            placeholder="email@epitech.eu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            style={{
              background: "var(--epi-input)", border: "1px solid var(--epi-border)",
              borderRadius: 8, padding: "8px 12px", color: "var(--epi-text)",
              fontSize: 13, width: "100%", boxSizing: "border-box",
            }}
          />
          <Group gap={8}>
            {(["MANTA", "PEDA"] as const).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: role === r ? roleColor(r) : "transparent",
                color: role === r ? "#fff" : "var(--epi-muted)",
                border: `1px solid ${role === r ? roleColor(r) : "var(--epi-border)"}`,
              }}>{r}</button>
            ))}
            <button onClick={add} disabled={loading || !email.trim()} style={{
              marginLeft: "auto", padding: "6px 16px", borderRadius: 8, fontSize: 12,
              fontWeight: 600, cursor: "pointer", background: "var(--epi-accent)",
              color: "#fff", border: "none", opacity: loading || !email.trim() ? 0.5 : 1,
            }}>
              <Group gap={6}><IconPlus size={12} />{loading ? "Ajout…" : "Ajouter"}</Group>
            </button>
          </Group>
          {error && <Text size="xs" c="red">{error}</Text>}
        </Stack>
      </div>

      <Stack gap={8}>
        {entries.length === 0 && <Text size="sm" c="dimmed">Aucune entrée dans la whitelist.</Text>}
        {entries.map(e => (
          <div key={e.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--epi-panel)", borderRadius: 8, padding: "10px 14px",
            border: "1px solid var(--epi-border)",
          }}>
            <Group gap={10}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                background: roleColor(e.role) + "22", color: roleColor(e.role),
              }}>{e.role}</span>
              <Text size="sm">{e.email}</Text>
            </Group>
            <button onClick={() => remove(e.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--epi-muted)", padding: 4, borderRadius: 4,
              display: "flex", alignItems: "center",
            }}>
              <IconTrash size={14} />
            </button>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}
