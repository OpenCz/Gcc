import { useEffect, useState } from "react";
import epitechLogo from "../../assets/img/epitech_logo.png";

export function Navbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-epi-border bg-epi-bg shrink-0 h-12">
      <img src={epitechLogo} alt="Epitech" className="h-6 w-auto" />

      <span className="text-sm font-bold tracking-[0.25em] text-white">
        CODING <span className="text-epi-accent">CLUB</span> EPITECH
      </span>

      <div className="flex items-center gap-2 font-mono text-sm text-epi-muted">
        <span className="text-epi-accent text-[10px]">●</span>
        {formatted}
      </div>
    </nav>
  );
}
