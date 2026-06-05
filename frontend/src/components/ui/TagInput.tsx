import { useState } from "react";
import { IconX } from "@tabler/icons-react";

export function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6,
      background: "var(--epi-bg)", border: "1px solid var(--epi-border)",
      borderRadius: 8, padding: "8px 12px", minHeight: 42,
    }}>
      {tags.map(tag => (
        <span key={tag} style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "var(--epi-surface)", color: "var(--epi-accent)",
          border: "1px solid var(--epi-border)",
          fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 15,
        }}>
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter(t => t !== tag))}
            style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex", padding: 0 }}
          >
            <IconX size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? "C, C++, Python… (Entrée pour ajouter)" : ""}
        style={{
          flex: 1, minWidth: 120, background: "none", border: "none", outline: "none",
          color: "#fff", fontSize: 13, fontFamily: "inherit",
        }}
      />
    </div>
  );
}
