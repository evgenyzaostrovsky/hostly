import React from "react";

export default function PoweredBy({ className = "" }) {
  return (
    <div className={`text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 ${className}`}>
      powered by <span className="text-violet-300">KODADEV</span>
    </div>
  );
}
