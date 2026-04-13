import { twMerge } from "tailwind-merge";

const toneStyles = {
  neutral: "bg-white/8 text-white/80 border-white/10",
  success: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  warning: "bg-amber-500/10 text-amber-200 border-amber-400/20",
  danger: "bg-rose-500/10 text-rose-200 border-rose-400/20",
  info: "bg-cyan-500/10 text-cyan-200 border-cyan-400/20",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: keyof typeof toneStyles;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        toneStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
