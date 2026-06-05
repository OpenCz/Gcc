import { useState } from "react";
import { IconX } from "@tabler/icons-react";

const DEFAULT_TAGS = ["HTML", "CSS", "JavaScript", "C", "C++", "Python", "Java", "Linux"];

export function TagInput({ tags, onChange, suggestions = DEFAULT_TAGS }: {
  tags: string[];
  onChange: (t: string[]) => void;
  suggestions?: string[];
}) {
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
    {suggestions.length > 0 && (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {suggestions.map(s => {
          const selected = tags.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => !selected && onChange([...tags, s])}
              style={{
                background: selected ? "rgba(128,157,253,0.1)" : "none",
                border: `1px solid ${selected ? "var(--epi-accent)" : "var(--epi-border)"}`,
                color: selected ? "var(--epi-accent)" : "var(--epi-ghost)",
                fontSize: 11, fontWeight: 600,
                padding: "3px 10px", borderRadius: 15,
                cursor: selected ? "default" : "pointer",
                fontFamily: "inherit", transition: "border-color 0.15s, color 0.15s",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    )}
  );
}
